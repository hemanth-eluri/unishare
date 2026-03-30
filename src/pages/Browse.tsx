import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { academicData } from '../config/academicData';

export default function Browse() {
  const [university, setUniversity] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const branches = academicData.getBranches(university);
  const years = academicData.getYears(university, branch);
  const semesters = academicData.getSemesters(university, branch, year);
  const subjects = academicData.getSubjects(university, branch, year, semester);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (university) params.append('university', university);
      if (branch) params.append('branch', branch);
      if (year) params.append('year', year);
      if (semester) params.append('semester', semester);
      if (subject) params.append('subject', subject);
      
      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [university, branch, year, semester, subject]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-black/80">Filter Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select value={university} onChange={(e) => {
            setUniversity(e.target.value);
            setBranch('');
            setYear('');
            setSemester('');
            setSubject('');
          }} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm">
            <option value="">All Universities</option>
            {academicData.universities.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={branch} disabled={!university} onChange={(e) => { 
            setBranch(e.target.value); 
            setYear('');
            setSemester('');
            setSubject(''); 
          }} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm disabled:opacity-50 disabled:bg-black/5">
            <option value="">{!university ? "Select University First" : "All Branches"}</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={year} disabled={!branch} onChange={(e) => { 
            setYear(e.target.value); 
            setSemester('');
            setSubject(''); 
          }} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm disabled:opacity-50 disabled:bg-black/5">
            <option value="">{!branch ? "Select Branch First" : "All Years"}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={semester} disabled={!year} onChange={(e) => { 
            setSemester(e.target.value); 
            setSubject(''); 
          }} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm disabled:opacity-50 disabled:bg-black/5">
            <option value="">{!year ? "Select Year First" : "All Semesters"}</option>
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!branch || !year || !semester} className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white text-sm disabled:opacity-50 disabled:bg-black/5">
            <option value="">{(!branch || !year || !semester) ? "Select Details First" : "All Subjects"}</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <Link
              key={resource._id}
              to={`/resource/${resource._id}`}
              className="flex flex-col p-6 bg-white rounded-2xl border border-black/5 hover:border-black/20 hover:shadow-md transition-all h-full"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2 leading-tight">{resource.title}</h3>
                </div>
              </div>
              <p className="text-sm text-black/60 line-clamp-3 mb-6 flex-grow">{resource.description}</p>
              
              <div className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-black/5 px-2 py-1 rounded text-xs font-medium text-black/60">{resource.university}</span>
                    <span className="bg-black/5 px-2 py-1 rounded text-xs font-medium text-black/60">{resource.branch}</span>
                    <span className="bg-black/5 px-2 py-1 rounded text-xs font-medium text-black/60">{resource.subject}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-black/40 border-t border-black/5 pt-4">
                  <span className="truncate pr-2">By {resource.uploader_name || 'Anonymous'}</span>
                  <span className="shrink-0">{new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
