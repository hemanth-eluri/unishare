import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flag, ExternalLink } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetch('/api/reports', {
      headers: { 'Authorization': `Bearer ${user._id}` }
    })
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard - Reports</h1>
          <p className="text-black/60">Manage content reported by users.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-black/40">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-black/5 shadow-sm text-center">
          <Flag className="w-8 h-8 mx-auto text-black/20 mb-4" />
          <h3 className="font-semibold text-lg mb-2">All Clear</h3>
          <p className="text-black/60">No community reports at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report._id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-lg mb-1 flex items-center gap-2 text-red-600">
                    <Flag className="w-4 h-4" /> Reported Issue
                  </h3>
                  <p className="text-black/80 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{report.reason}</p>
                  <p className="text-xs text-black/40">
                    Reported on {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/resource/${report.resource_id}`}
                  className="shrink-0 flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Investigate Resource
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
