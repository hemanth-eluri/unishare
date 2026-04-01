import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileText, Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-black/60">
          {q ? `Showing results for "${q}"` : 'Enter a search term to find resources.'}
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-black/40">Searching...</div>
      ) : results.length === 0 && q ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-black/5 shadow-sm">
          <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-6 h-6 text-black/40" />
          </div>
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-black/60 mb-6">We couldn't find any resources matching your search.</p>
          <Link to="/upload" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-black/80 transition-colors">
            Upload a Resource
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(resource => (
            <Link
              key={resource._id}
              to={`/resource/${resource._id}`}
              className="block p-5 bg-white rounded-xl border border-black/5 hover:border-black/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-medium text-black/60">
                    <span className="bg-black/5 px-2 py-1 rounded">Sem {resource.semester}</span>
                    <span>•</span>
                    <span className="bg-black/5 px-2 py-1 rounded">{resource.subject}</span>
                    <span>•</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{resource.resource_type || 'General'}</span>
                    {resource.document_type && (
                      <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded">[{resource.document_type}]</span>
                    )}
                    {resource.verified && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium flex items-center gap-1">✔ Verified by Admin</span>
                    )}
                  </div>
                  <h3 className="font-medium text-lg mb-1">{resource.title}</h3>
                  <p className="text-sm text-black/60 mb-3">
                    {resource.description?.length > 120 ? (
                      <>
                        {resource.description.substring(0, 120)}...<span className="text-blue-600 hover:underline ml-1">read more</span>
                      </>
                    ) : (
                      resource.description
                    )}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-black/40">
                    <span>Uploaded by {resource.uploader_name || 'Anonymous'}</span>
                    <span className="font-medium text-black/60">⬇ {resource.download_count || 0} downloads</span>
                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
