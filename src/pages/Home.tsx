import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Upload, Users } from 'lucide-react';

export default function Home() {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold mb-2">Organized Hierarchy</h3>
          <p className="text-sm text-black/60">Find exactly what you need by navigating through University, Branch, Year, Semester, and Subject.</p>
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
