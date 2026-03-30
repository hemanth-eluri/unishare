import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { academicData } from '../config/academicData';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Dropdown states for dependent logic
  const [university, setUniversity] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');

  const branches = academicData.getBranches(university);
  const years = academicData.getYears(university, branch);
  const semesters = academicData.getSemesters(university, branch, year);
  const subjects = academicData.getSubjects(university, branch, year, semester);

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

  if (!user) return null;

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
            <select
              required
              name="university"
              value={university}
              onChange={(e) => {
                setUniversity(e.target.value);
                setBranch('');
                setYear('');
                setSemester('');
                setSubject('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
            >
              <option value="">Select University</option>
              {academicData.universities.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch *</label>
            <select
              required
              name="branch"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setSubject('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
            >
              <option value="">{(!university) ? "Select University First" : "Select Branch"}</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year *</label>
            <select
              required
              name="year"
              disabled={!branch}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setSemester('');
                setSubject('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white disabled:opacity-50 disabled:bg-black/5"
            >
              <option value="">{(!branch) ? "Select Branch First" : "Select Year"}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Semester *</label>
            <select
              required
              name="semester"
              disabled={!year}
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setSubject('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white disabled:opacity-50 disabled:bg-black/5"
            >
              <option value="">{(!year) ? "Select Year First" : "Select Semester"}</option>
              {semesters.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Subject *</label>
            <select
              required
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!branch || !year || !semester}
              className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white disabled:opacity-50 disabled:bg-black/5"
            >
              <option value="">{(!branch || !year || !semester) ? "Select Branch, Year and Semester first" : "Select Subject"}</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
            <input name="uploader_name" type="text" defaultValue={user?.email.split('@')[0]} placeholder="Your name" className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
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
