import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, Search, Library } from 'lucide-react';

export default function Layout() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
            <Link to="/upload" className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-md hover:bg-black/80 transition-colors">
              <Upload className="w-4 h-4" />
              Upload
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
