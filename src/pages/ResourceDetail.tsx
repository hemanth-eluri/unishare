import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Flag, ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/resources/${id}`)
      .then(res => res.json())
      .then(data => {
        setResource(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReporting(true);
    try {
      await fetch('/api/report-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: id, reason: reportReason }),
      });
      setReported(true);
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?._id}`,
        }
      });
      if (res.ok) {
        navigate('/browse');
      } else {
        alert("Failed to delete resource");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-black/40">Loading...</div>;
  if (!resource || resource.error) return <div className="text-center py-20 text-red-500">Resource not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Resource'}
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm mb-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl shrink-0 hidden sm:block">
            <FileText className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-black/60">
              <span className="bg-black/5 px-2 py-1 rounded">{resource.university}</span>
              <span>•</span>
              <span className="bg-black/5 px-2 py-1 rounded">{resource.branch}</span>
              <span>•</span>
              <span className="bg-black/5 px-2 py-1 rounded">{resource.subject}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
            <p className="text-black/80 leading-relaxed mb-8 whitespace-pre-wrap">{resource.description}</p>

            <div className="flex items-center gap-4 text-sm text-black/50 mb-8">
              <span>Uploaded by {resource.uploader_name || 'Anonymous'}</span>
              <span>•</span>
              <span>{new Date(resource.created_at).toLocaleDateString()}</span>
            </div>

            <a
              href={resource.pdf_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              View / Download Document
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Flag className="w-4 h-4 text-red-500" />
          Report Issue
        </h3>
        {reported ? (
          <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">Thank you. This resource has been reported and will be reviewed.</p>
        ) : (
          <form onSubmit={handleReport} className="flex gap-4">
            <input
              type="text"
              required
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Why are you reporting this? (e.g. broken link, wrong subject)"
              className="flex-1 px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
            />
            <button
              type="submit"
              disabled={reporting}
              className="bg-black/5 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/10 transition-colors disabled:opacity-50"
            >
              {reporting ? 'Reporting...' : 'Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
