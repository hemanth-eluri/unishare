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
    <div className="min-h-screen bg-[#f7f7f5] text-[#37352f] font-sans">
      <header className="sticky top-0 z-10 bg-[#f7f7f5]/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity shrink-0">
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">UniShare</span>
          </Link>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input 
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
                  <Link to="/reports" className="hidden sm:flex flex-row items-center gap-1.5 text-red-600/80 hover:text-red-600 transition-colors border-r border-black/10 pr-4 font-medium">
                    <ShieldAlert className="w-4 h-4" /> Reports
                  </Link>
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
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
