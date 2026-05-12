import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, Search, Library, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f5] text-[#37352f] font-sans">
      <header className="sticky top-0 z-10 bg-[#f7f7f5]/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity shrink-0">
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">UniShare</span>
          </Link>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input 
              id="searchQuery"
              name="searchQuery"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search title, subject, university..." 
              className="w-full pl-9 pr-4 py-1.5 bg-black/5 border border-transparent rounded-md text-sm focus:outline-none focus:bg-white focus:border-black/10 focus:ring-2 focus:ring-black/5 transition-all" 
            />
          </form>

          <nav className="flex items-center gap-4 text-sm shrink-0">
            <Link to="/browse" className="hidden sm:flex items-center gap-1.5 text-black/60 hover:text-black transition-colors">
              <Library className="w-4 h-4" />
              Browse
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                  <Link to="/reports" className="hidden sm:flex flex-row items-center gap-1.5 text-red-600/80 hover:text-red-600 transition-colors border-r border-black/10 pr-4 font-medium">
                    <ShieldAlert className="w-4 h-4" /> Reports
                  </Link>
                  <Link to="/admin/subjects" className="hidden sm:flex flex-row items-center gap-1.5 text-blue-600/80 hover:text-blue-600 transition-colors border-r border-black/10 pr-4 font-medium">
                    <BookOpen className="w-4 h-4" /> Subjects
                  </Link>
                  </>
                )}
                <div className="hidden sm:flex items-center gap-1.5 text-black/60 border-r border-black/10 pr-4">
                  <UserIcon className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">{user.email.split('@')[0]}</span>
                </div>
                <Link to="/upload" className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-md hover:bg-black/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload
                </Link>
                <button onClick={logout} title="Logout" className="text-black/60 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-md hover:bg-black/80 transition-colors">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-grow">
        <Outlet />
      </main>
      <footer className="mt-auto py-10 border-t border-black/5 bg-gradient-to-b from-transparent to-black/[0.02]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-black/70 flex items-center gap-2">
            Built by <span className="font-bold text-black tracking-wide">ELURI HEMANTH</span>
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-black/60 flex-wrap justify-center">
            <a href="mailto:hemanthsocial9@gmail.com" className="hover:text-black transition-all flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <span className="text-base">📧</span> hemanthsocial9@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/hemanth-eluri/" target="_blank" rel="noopener noreferrer" className="hover:text-[#0a66c2] transition-all flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <span className="text-base">🔗</span> LinkedIn
            </a>
          </div>
          <div className="mt-4 px-4 py-1.5 rounded-full bg-black/5 text-xs font-mono tracking-widest text-black/50 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            It is vibe coded
          </div>
        </div>
      </footer>
    </div>
  );
}
