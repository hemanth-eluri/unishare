import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Youtube, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DOCUMENT_TYPES = [
  "Textbook",
  "Notes",
  "Practice",
  "Previous Papers"
];

export default function Browse() {
  const { user } = useAuth();
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [sortBy, setSortBy] = useState('helpful');

  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', video_url: '', description: '' });

  useEffect(() => {
    if (semester) {
      fetch(`/api/subjects?semester=${semester}`)
        .then(res => res.json())
        .then(data => setSubjects(data));
    } else {
      setSubjects([]);
      setSubject('');
    }
  }, [semester]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (semester) params.append('semester', semester);
      if (subject) params.append('subject', subject);
      if (documentType) params.append('document_type', documentType);
      
      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    if (!subject) {
      setVideos([]);
      return;
    }
    setLoadingVideos(true);
    try {
      const res = await fetch(`/api/videos?subject=${encodeURIComponent(subject)}`);
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchVideos();
  }, [semester, subject, documentType]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?._id}`,
        },
        body: JSON.stringify({ ...videoForm, subject })
      });
      if (res.ok) {
        setAddingVideo(false);
        setVideoForm({ title: '', video_url: '', description: '' });
        fetchVideos();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?._id}` }
      });
      if (res.ok) fetchVideos();
    } catch (err) {
      console.error(err);
    }
  };

  const renderResourceCard = (resource: any) => {
    const hv = resource.helpful_votes || 0;
    const nhv = resource.not_helpful_votes || 0;
    const total = hv + nhv;
    const score = total > 0 ? Math.round((hv / total) * 100) : 0;
    
    return (
    <Link key={resource._id} to={`/resource/${resource._id}`} className="flex flex-col p-6 bg-white rounded-2xl border border-black/5 hover:border-black/20 hover:shadow-md transition-all h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0"><FileText className="w-6 h-6" /></div>
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">{resource.title}</h3>
          <p className="text-sm text-black/60 mt-1 mb-2">
            {resource.description?.length > 120 ? (
              <>
                {resource.description.substring(0, 120)}...<span className="text-blue-600 hover:underline">read more</span>
              </>
            ) : (
              resource.description
            )}
          </p>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md mt-1 inline-block">{resource.resource_type || 'General'}</span>
          {resource.document_type && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md mt-1 inline-block ml-2">[{resource.document_type}]</span>
          )}
          {resource.verified && (
            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-md mt-1 inline-flex items-center gap-1 ml-2 font-medium">✔ Verified by Admin</span>
          )}
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-black/5 px-2 py-1 rounded text-xs font-medium text-black/60">Sem {resource.semester}</span>
            <span className="bg-black/5 px-2 py-1 rounded text-xs font-medium text-black/60">{resource.subject}</span>
            {total > 0 && <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">👍 {score}%</span>}
        </div>
        <div className="flex items-center justify-between text-xs text-black/40 border-t border-black/5 pt-4">
          <span className="truncate pr-2">By {resource.uploader_name || 'Anonymous'}</span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-medium text-black/60">⬇ {resource.download_count || 0} downloads</span>
            <span>{new Date(resource.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-black/80">Filter and Sort Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={semester} onChange={(e) => { 
            setSemester(e.target.value); setSubject(''); 
          }} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm">
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!semester} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm disabled:opacity-50 disabled:bg-black/5">
            <option value="">{!semester ? "Select Semester First" : "All Subjects"}</option>
            {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
          </select>
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm">
            <option value="">All Document Types</option>
            {DOCUMENT_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm">
            <option value="helpful">Sort By: Most Helpful</option>
            <option value="downloaded">Sort By: Most Downloaded</option>
            <option value="newest">Sort By: Newest Upload</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-black/40">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-black/5 shadow-sm">
          <p className="text-black/60 mb-4">No resources found matching your filters.</p>
          <Link to="/upload" className="text-blue-600 font-medium hover:underline">Be the first to upload one</Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(
            [...resources]
              .sort((a, b) => {
                if (sortBy === 'helpful') {
                  const aScore = (a.helpful_votes || 0) - (a.not_helpful_votes || 0);
                  const bScore = (b.helpful_votes || 0) - (b.not_helpful_votes || 0);
                  if (aScore !== bScore) return bScore - aScore;
                } else if (sortBy === 'downloaded') {
                  const aDown = a.download_count || 0;
                  const bDown = b.download_count || 0;
                  if (aDown !== bDown) return bDown - aDown;
                }
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              })
              .reduce((acc: any, res: any) => {
                const sem = res.semester || 'Other';
                const sub = res.subject || 'Other';
                if (!acc[sem]) acc[sem] = {};
                if (!acc[sem][sub]) acc[sem][sub] = [];
                acc[sem][sub].push(res);
                return acc;
              }, {})
          )
          .sort(([a], [b]) => parseInt(a as string) - parseInt(b as string))
          .map(([sem, subjectsObj]: [string, any]) => (
            <div key={sem} className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-black/10 pb-2">Semester {sem}</h2>
              {Object.entries(subjectsObj)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([sub, resList]: [string, any]) => (
                <div key={sub} className="space-y-4 ml-4">
                  <h3 className="text-lg font-semibold text-black/80">{sub}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resList.map(renderResourceCard)}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {subject && (
            <div className="mt-12 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2"><Youtube className="text-red-600 w-8 h-8"/> Recommended Videos</h2>
                {user?.role === 'admin' && (
                  <button onClick={() => setAddingVideo(!addingVideo)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/80">
                    <Plus className="w-4 h-4" /> Add Video
                  </button>
                )}
              </div>

              {addingVideo && user?.role === 'admin' && (
                <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-xl border border-black/5 shadow-sm mb-6 space-y-4">
                  <h3 className="font-medium text-lg mb-2">Add New Recommended Video</h3>
                  <div className="space-y-2">
                    <input required type="text" placeholder="Video Title" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="space-y-2">
                    <input required type="url" placeholder="YouTube URL" value={videoForm.video_url} onChange={e => setVideoForm({...videoForm, video_url: e.target.value})} className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="space-y-2">
                    <input type="text" placeholder="Short description (optional)" value={videoForm.description} onChange={e => setVideoForm({...videoForm, description: e.target.value})} className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/80">Submit Video</button>
                </form>
              )}

              {loadingVideos ? (
                <div className="py-6 text-black/40">Loading videos...</div>
              ) : videos.length === 0 ? (
                <div className="text-black/60 bg-white p-6 rounded-xl border border-black/5">No recommended videos yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(video => {
                    let embedUrl = video.video_url;
                    if (video.video_url.includes('youtube.com/watch?v=')) {
                      embedUrl = video.video_url.replace('/watch?v=', '/embed/');
                    } else if (video.video_url.includes('youtu.be/')) {
                      embedUrl = video.video_url.replace('youtu.be/', 'youtube.com/embed/');
                    }
                    embedUrl = embedUrl.split('&')[0];
                    return (
                      <div key={video._id} className="bg-white rounded-xl overflow-hidden border border-black/5 shadow-sm">
                        <iframe src={embedUrl} className="w-full aspect-video" allowFullScreen title={video.title} />
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-lg line-clamp-1">{video.title}</h4>
                            {user?.role === 'admin' && (
                              <button onClick={() => handleDeleteVideo(video._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors ml-2"><Trash2 className="w-4 h-4"/></button>
                            )}
                          </div>
                          {video.description && <p className="text-sm text-black/60 mt-2 line-clamp-2">{video.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
