import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-black/60 mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-black/80 transition-all"
      >
        <Home className="w-5 h-5" />
        Back to Home
      </Link>
    </div>
  );
}
