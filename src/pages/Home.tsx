import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Upload, Users, Download, FileText } from 'lucide-react';

export default function Home() {
  const [topDocs, setTopDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) => {
          const aScore = (a.helpful_votes || 0) - (a.not_helpful_votes || 0);
          const bScore = (b.helpful_votes || 0) - (b.not_helpful_votes || 0);
          return bScore - aScore;
        });
        setTopDocs(sorted.slice(0, 5));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = (id: string, e: React.MouseEvent) => {
    fetch(`/api/documents/${id}/download`, { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="flex flex-col items-center text-center py-20">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-sm mb-8">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Community driven resource sharing
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-2xl">
        The open library for university students.
      </h1>
      <p className="text-lg text-black/60 mb-10 max-w-xl">
        Browse, share, and organize academic PDF resources. Everything is stored on Google Drive and organized by your university's curriculum.
      </p>
      <div className="flex items-center gap-4">
        <Link to="/browse" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-black/80 transition-colors">
          Browse Resources
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/upload" className="flex items-center gap-2 bg-white border border-black/10 text-black px-6 py-3 rounded-lg font-medium hover:bg-black/5 transition-colors">
          Share a PDF
        </Link>
      </div>

      <div className="w-full mt-16 text-left bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Most Helpful Documents</h2>
        {loading ? (
          <div className="text-center py-8 text-black/40">Loading documents...</div>
        ) : topDocs.length === 0 ? (
          <div className="text-center py-8 text-black/40">No documents found.</div>
        ) : (
          <div className="space-y-4">
            {topDocs.map(doc => {
              const score = (doc.helpful_votes || 0) - (doc.not_helpful_votes || 0);
              return (
                <div key={doc._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-black/5 bg-black/[0.02] hover:bg-white hover:shadow-sm transition-all gap-4">
                  <div className="flex items-start gap-4 flex-1 w-full">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0 hidden sm:block">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/resource/${doc._id}`} className="font-semibold text-lg hover:underline truncate block">
                        {doc.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-black/60">
                        <span className="truncate">{doc.subject}</span>
                        <span>•</span>
                        <span className="font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded flex-shrink-0">Score: {score}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={doc.pdf_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleDownload(doc._id, e)}
                    className="shrink-0 flex items-center justify-center gap-2 bg-black text-white w-full sm:w-auto px-4 py-2 rounded-lg font-medium hover:bg-black/80 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left w-full">
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold mb-2">Organized Hierarchy</h3>
          <p className="text-sm text-black/60">Find exactly what you need by navigating through Semester and Subject.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4 text-green-600">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="font-semibold mb-2">Google Drive Integration</h3>
          <p className="text-sm text-black/60">We don't store files. Just paste your shareable Google Drive link and we'll organize it for everyone.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4 text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold mb-2">Community Moderation</h3>
          <p className="text-sm text-black/60">Help keep the library clean by reporting broken links or incorrect resources. No login required.</p>
        </div>
      </div>
    </div>
  );
}
