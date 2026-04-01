import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import bcryptjs from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Setup Multer for document uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

const MONGODB_URI = process.env.MONGODB_URI;
let isMongoConnected = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      isMongoConnected = true;
      console.log('Connected to MongoDB');
      try {
        const adminExists = await User.findOne({ email: 'admin@kluniversity.in' });
        if (!adminExists) {
          const hashedPassword = await bcryptjs.hash('KL2508281', 10);
          await User.create({ email: 'admin@kluniversity.in', password: hashedPassword, role: 'admin' });
          console.log('Default admin created in Mongo');
        }
      } catch (err) {
        console.error('Failed to create default admin', err);
      }
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI is not set. Using in-memory fallback for preview.');
}

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  semester: { type: Number, required: true },
  subject: { type: String, required: true },
  resource_type: { type: String, required: true },
  document_type: { type: String, required: true },
  pdf_link: { type: String, required: true },
  uploader_name: { type: String },
  helpful_votes: { type: Number, default: 0 },
  not_helpful_votes: { type: Number, default: 0 },
  download_count: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const videoSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  title: { type: String, required: true },
  video_url: { type: String, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  resource_id: { type: String, required: true },
  reason: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const voteSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  resource_id: { type: String, required: true },
  vote_type: { type: String, enum: ['helpful', 'not_helpful'], required: true },
  created_at: { type: Date, default: Date.now }
});

const subjectItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  created_at: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', resourceSchema);
const Report = mongoose.model('Report', reportSchema);
const User = mongoose.model('User', userSchema);
const Video = mongoose.model('Video', videoSchema);
const Vote = mongoose.model('Vote', voteSchema);
const SubjectModel = mongoose.model('Subject', subjectItemSchema);

// In-memory fallback data for preview environment
let fallbackResources: any[] = [
  {
    _id: '1',
    title: 'Data Structures and Algorithms Notes',
    description: 'Comprehensive notes covering trees, graphs, and dynamic programming.',
    semester: 4,
    subject: 'Design and Analysis of Algorithms',
    resource_type: 'Lecture Notes',
    document_type: 'Notes',
    pdf_link: 'https://drive.google.com/file/d/1234567890/view',
    uploader_name: 'Alice',
    download_count: 5,
    helpful_votes: 10,
    not_helpful_votes: 2,
    created_at: new Date()
  }
];
let fallbackReports: any[] = [];
let fallbackUsers: any[] = [];
let fallbackVideos: any[] = [];
let fallbackVotes: any[] = [];
let fallbackSubjects: any[] = [
  { _id: 'sub_1', name: 'Design and Analysis of Algorithms', semester: 4, created_at: new Date() },
  { _id: 'sub_2', name: 'Operating Systems', semester: 4, created_at: new Date() },
  { _id: 'sub_3', name: 'Data Structures', semester: 2, created_at: new Date() },
  { _id: 'sub_4', name: 'Mathematics-I', semester: 1, created_at: new Date() }
];

// Create default admin for fallback memory mode
bcryptjs.hash('KL2508281', 10).then(hashed => {
  fallbackUsers.push({
    _id: 'admin_1',
    email: 'admin@kluniversity.in',
    password: hashed,
    role: 'admin',
    created_at: new Date()
  });
});

app.post('/api/upload-resource', upload.single('document_file'), async (req, res) => {
  try {
    const data = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'A document file is required.' });
    }
    
    // Set the pdf_link to the statically served local file path
    data.pdf_link = `/uploads/${req.file.filename}`;
    
    if (isMongoConnected) {
      const resource = new Resource(data);
      await resource.save();
      res.json(resource);
    } else {
      const resource = { ...data, _id: Date.now().toString(), created_at: new Date() };
      fallbackResources.push(resource);
      res.json(resource);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources', async (req, res) => {
  try {
    const match: any = {};
    ['semester', 'subject', 'resource_type', 'document_type'].forEach(key => {
      if (req.query[key]) {
        if (key === 'semester') {
          match[key] = parseInt(req.query[key] as string, 10);
        } else {
          match[key] = req.query[key];
        }
      }
    });

    if (isMongoConnected) {
      const resources = await Resource.find(match).sort({ created_at: -1 });
      res.json(resources);
    } else {
      const resources = fallbackResources.filter(r => {
        return Object.keys(match).every(key => r[key] === match[key]);
      }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      res.json(resources);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    if (isMongoConnected) {
      const resources = await Resource.find({
        $or: [
          { title: regex },
          { subject: regex }
        ]
      }).sort({ verified: -1, created_at: -1 });
      res.json(resources);
    } else {
      const resources = fallbackResources.filter(r =>
        regex.test(r.title) || regex.test(r.subject)
      ).sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return b.created_at.getTime() - a.created_at.getTime();
      });
      res.json(resources);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const resource = await Resource.findById(req.params.id);
      if (!resource) return res.status(404).json({ error: 'Not found' });
      res.json(resource);
    } else {
      const resource = fallbackResources.find(r => r._id === req.params.id);
      if (!resource) return res.status(404).json({ error: 'Not found' });
      res.json(resource);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/subjects', async (req, res) => {
  try {
    const { semester } = req.query;
    const match: any = {};
    if (semester) match.semester = parseInt(semester as string, 10);

    if (isMongoConnected) {
      const subjects = await SubjectModel.find(match).sort({ name: 1 });
      res.json(subjects);
    } else {
      let subjects = fallbackSubjects;
      if (semester) {
        subjects = subjects.filter(s => s.semester === match.semester);
      }
      res.json(subjects.sort((a, b) => a.name.localeCompare(b.name)));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    let user;
    if (isMongoConnected) user = await User.findById(userId);
    else user = fallbackUsers.find(u => u._id === userId);
    
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { name, semester } = req.body;
    if (!name || !semester) return res.status(400).json({ error: 'Name and semester required.' });

    if (isMongoConnected) {
      const subject = new SubjectModel({ name, semester: parseInt(semester, 10) });
      await subject.save();
      res.json(subject);
    } else {
      const subject = { _id: Date.now().toString(), name, semester: parseInt(semester, 10), created_at: new Date() };
      fallbackSubjects.push(subject);
      res.json(subject);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    let user;
    if (isMongoConnected) user = await User.findById(userId);
    else user = fallbackUsers.find(u => u._id === userId);
    
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    if (isMongoConnected) {
      await SubjectModel.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } else {
      fallbackSubjects = fallbackSubjects.filter(s => s._id !== req.params.id);
      res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/report-resource', async (req, res) => {
  try {
    const data = req.body;
    if (isMongoConnected) {
      const report = new Report(data);
      await report.save();
      res.json(report);
    } else {
      const report = { ...data, _id: Date.now().toString(), created_at: new Date() };
      fallbackReports.push(report);
      res.json(report);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    if (!email.endsWith('@kluniversity.in')) return res.status(400).json({ error: 'Please use a @kluniversity.in email.' });
    
    const hashedPassword = await bcryptjs.hash(password, 10);
    if (isMongoConnected) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: 'Email already registered' });
      const user = new User({ email, password: hashedPassword, role: 'user' });
      await user.save();
      res.json({ _id: user._id, email: user.email, role: user.role });
    } else {
      if (fallbackUsers.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
      const user = { _id: Date.now().toString(), email, password: hashedPassword, role: 'user', created_at: new Date() };
      fallbackUsers.push(user);
      res.json({ _id: user._id, email: user.email, role: user.role });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;
    if (isMongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = fallbackUsers.find(u => u.email === email);
    }
    
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await bcryptjs.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    
    res.json({ _id: user._id, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const checkAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing token' });
      return;
    }
    
    let user;
    if (isMongoConnected) user = await User.findById(userId);
    else user = fallbackUsers.find(u => u._id === userId);
    
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error authorizing admin' });
  }
};

const checkUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing token' });
      return;
    }
    
    let user;
    if (isMongoConnected) user = await User.findById(userId);
    else user = fallbackUsers.find(u => u._id === userId);
    
    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User not found' });
      return;
    }
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error authorizing user' });
  }
};

app.delete('/api/resources/:id', checkAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      await Resource.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } else {
      fallbackResources = fallbackResources.filter(r => r._id !== req.params.id);
      res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports', checkAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const reports = await Report.find().sort({ created_at: -1 });
      res.json(reports);
    } else {
      res.json(fallbackReports.concat().sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) return res.json([]);
    
    if (isMongoConnected) {
      const videos = await Video.find({ subject }).sort({ created_at: -1 });
      res.json(videos);
    } else {
      const videos = fallbackVideos.filter(v => v.subject === subject)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      res.json(videos);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/videos', checkAdmin, async (req, res) => {
  try {
    const data = req.body;
    if (!data.video_url || !(data.video_url.includes('youtube.com') || data.video_url.includes('youtu.be'))) {
      return res.status(400).json({ error: 'Please provide a valid YouTube URL.' });
    }
    
    if (isMongoConnected) {
      const video = new Video(data);
      await video.save();
      res.json(video);
    } else {
      const video = { ...data, _id: Date.now().toString(), created_at: new Date() };
      fallbackVideos.push(video);
      res.json(video);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/videos/:id', checkAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      await Video.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } else {
      fallbackVideos = fallbackVideos.filter(v => v._id !== req.params.id);
      res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents/:id/:voteType', checkUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.params;
    if (voteType !== 'helpful' && voteType !== 'not-helpful') {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    const internalVoteType = voteType === 'not-helpful' ? 'not_helpful' : 'helpful';
    const userId = (req as any).user._id.toString();

    if (isMongoConnected) {
      const existingVote = await Vote.findOne({ user_id: userId, resource_id: id });
      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this document' });
      }
      
      const vote = new Vote({ user_id: userId, resource_id: id, vote_type: internalVoteType });
      await vote.save();
      
      const updateField = internalVoteType === 'helpful' ? 'helpful_votes' : 'not_helpful_votes';
      const updatedResource = await Resource.findByIdAndUpdate(id, { $inc: { [updateField]: 1 } }, { new: true });
      
      res.json(updatedResource);
    } else {
      const existingVote = fallbackVotes.find(v => v.user_id === userId && v.resource_id === id);
      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this document' });
      }
      fallbackVotes.push({ user_id: userId, resource_id: id, vote_type: internalVoteType, created_at: new Date() });
      
      const resource = fallbackResources.find(r => r._id === id);
      if (resource) {
        if (internalVoteType === 'helpful') resource.helpful_votes = (resource.helpful_votes || 0) + 1;
        else resource.not_helpful_votes = (resource.not_helpful_votes || 0) + 1;
      }
      res.json(resource);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const resource = await Resource.findByIdAndUpdate(id, { $inc: { download_count: 1 } }, { new: true });
      res.json({ success: true, download_count: resource?.download_count });
    } else {
      const resource = fallbackResources.find(r => r._id === id);
      if (resource) {
        resource.download_count = (resource.download_count || 0) + 1;
      }
      res.json({ success: true, download_count: resource?.download_count });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents/:id/verify', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    if (isMongoConnected) {
      const resource = await Resource.findByIdAndUpdate(id, { verified }, { new: true });
      res.json(resource);
    } else {
      const resource = fallbackResources.find(r => r._id === id);
      if (resource) {
        resource.verified = verified;
      }
      res.json(resource);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
