import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    const fileEntry = formData.get('document_file') as File | null;
    if (!fileEntry || fileEntry.size === 0) {
      setError('Please provide a valid document file.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/upload-resource', {
        method: 'POST',
        body: formData, // the browser will set the appropriate multipart/form-data headers automatically
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload');
      }

      const result = await res.json();
      navigate(`/resource/${result._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Upload Resource</h1>
      <p className="text-black/60 mb-8">Share a PDF or Word document with the community.</p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">University *</label>
            <input required name="university" type="text" placeholder="e.g. Stanford University" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch *</label>
            <input required name="branch" type="text" placeholder="e.g. Computer Science" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year *</label>
            <input required name="year" type="text" placeholder="e.g. Year 2" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Semester *</label>
            <input required name="semester" type="text" placeholder="e.g. Semester 3" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Subject *</label>
            <input required name="subject" type="text" placeholder="e.g. CS161 Data Structures" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
        </div>

        <hr className="border-black/5" />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Resource Title *</label>
            <input required name="title" type="text" placeholder="e.g. Midterm Review Notes" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea required name="description" rows={3} placeholder="Briefly describe what this resource contains..." className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Document File (PDF/DOC) *</label>
            <input required name="document_file" type="file" accept=".pdf,.doc,.docx" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
            <p className="text-xs text-black/40">Upload your PDF or Word document here.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Uploader Name (Optional)</label>
            <input name="uploader_name" type="text" placeholder="Your name or alias" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Submit Resource'}
        </button>
      </form>
    </div>
  );
}
