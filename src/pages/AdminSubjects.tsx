import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSubjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchSubjects();
  }, [user, navigate]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !semester) return;
    setAdding(true);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?._id}`,
        },
        body: JSON.stringify({ name, semester: parseInt(semester, 10) })
      });
      if (res.ok) {
        setName('');
        setSemester('');
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?._id}` }
      });
      if (res.ok) fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600" /> Manage Subjects
        </h1>
        
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input required type="text" placeholder="Subject Name (e.g. Operating Systems)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div className="w-48">
            <select required value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5">
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" disabled={adding} className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-black/80 flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {adding ? 'Adding...' : 'Add Subject'}
          </button>
        </form>

        {loading ? (
          <div className="text-center py-8 text-black/40">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-8 text-black/40 bg-black/5 rounded-xl">No subjects added yet.</div>
        ) : (
          <div className="space-y-4">
             {[1,2,3,4,5,6,7,8].map(sem => {
               const semSubjects = subjects.filter(s => s.semester === sem);
               if (semSubjects.length === 0) return null;
               return (
                 <div key={sem} className="mb-6">
                   <h3 className="font-semibold text-lg border-b border-black/5 pb-2 mb-4">Semester {sem}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {semSubjects.map(sub => (
                       <div key={sub._id} className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-transparent hover:bg-white hover:border-black/5 hover:shadow-sm transition-all">
                         <span className="font-medium">{sub.name}</span>
                         <button onClick={() => handleDelete(sub._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
}
