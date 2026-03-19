import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

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
    .then(() => {
      isMongoConnected = true;
      console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI is not set. Using in-memory fallback for preview.');
}

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  university: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  pdf_link: { type: String, required: true },
  uploader_name: { type: String },
  created_at: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  resource_id: { type: String, required: true },
  reason: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', resourceSchema);
const Report = mongoose.model('Report', reportSchema);

// In-memory fallback data for preview environment
let fallbackResources: any[] = [
  {
    _id: '1',
    title: 'Data Structures and Algorithms Notes',
    description: 'Comprehensive notes covering trees, graphs, and dynamic programming.',
    university: 'Stanford University',
    branch: 'Computer Science',
    year: 'Year 2',
    semester: 'Semester 3',
    subject: 'CS161',
    pdf_link: 'https://drive.google.com/file/d/1234567890/view',
    uploader_name: 'Alice',
    created_at: new Date()
  }
];
let fallbackReports: any[] = [];

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
    ['university', 'branch', 'year', 'semester', 'subject'].forEach(key => {
      if (req.query[key]) match[key] = req.query[key];
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
          { subject: regex },
          { university: regex }
        ]
      }).sort({ created_at: -1 });
      res.json(resources);
    } else {
      const resources = fallbackResources.filter(r =>
        regex.test(r.title) || regex.test(r.subject) || regex.test(r.university)
      ).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
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

app.get('/api/options', async (req, res) => {
  try {
    const { university, branch, year, semester } = req.query;
    const match: any = {};
    if (university) match.university = university;
    if (branch) match.branch = branch;
    if (year) match.year = year;
    if (semester) match.semester = semester;

    let groupBy = 'university';
    if (university && !branch) groupBy = 'branch';
    else if (branch && !year) groupBy = 'year';
    else if (year && !semester) groupBy = 'semester';
    else if (semester) groupBy = 'subject';

    if (isMongoConnected) {
      const options = await Resource.distinct(groupBy, match);
      res.json(options.filter(Boolean));
    } else {
      const filtered = fallbackResources.filter(r => {
        let ok = true;
        if (university && r.university !== university) ok = false;
        if (branch && r.branch !== branch) ok = false;
        if (year && r.year !== year) ok = false;
        if (semester && r.semester !== semester) ok = false;
        return ok;
      });
      const options = Array.from(new Set(filtered.map(r => r[groupBy]))).filter(Boolean);
      res.json(options);
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
