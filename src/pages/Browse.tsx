import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Folder } from 'lucide-react';

type Selection = {
  university?: string;
  branch?: string;
  year?: string;
  semester?: string;
  subject?: string;
};

export default function Browse() {
  const [selection, setSelection] = useState<Selection>({});
  const [options, setOptions] = useState<string[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOptions = async (currentSelection: Selection) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(currentSelection as Record<string, string>);
      const res = await fetch(`/api/options?${params.toString()}`);
      const data = await res.json();
      setOptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (currentSelection: Selection) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(currentSelection as Record<string, string>);
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
    if (selection.subject) {
      fetchResources(selection);
    } else {
      fetchOptions(selection);
    }
  }, [selection]);

  const handleSelect = (value: string) => {
    if (!selection.university) setSelection({ ...selection, university: value });
    else if (!selection.branch) setSelection({ ...selection, branch: value });
    else if (!selection.year) setSelection({ ...selection, year: value });
    else if (!selection.semester) setSelection({ ...selection, semester: value });
    else if (!selection.subject) setSelection({ ...selection, subject: value });
  };

  const resetTo = (level: keyof Selection | 'root') => {
    if (level === 'root') setSelection({});
    else if (level === 'university') setSelection({ university: selection.university });
    else if (level === 'branch') setSelection({ university: selection.university, branch: selection.branch });
    else if (level === 'year') setSelection({ university: selection.university, branch: selection.branch, year: selection.year });
    else if (level === 'semester') setSelection({ university: selection.university, branch: selection.branch, year: selection.year, semester: selection.semester });
  };

  const breadcrumbs = [
    { label: 'Universities', level: 'root' as const, active: !selection.university },
    ...(selection.university ? [{ label: selection.university, level: 'university' as const, active: !selection.branch }] : []),
    ...(selection.branch ? [{ label: selection.branch, level: 'branch' as const, active: !selection.year }] : []),
    ...(selection.year ? [{ label: selection.year, level: 'year' as const, active: !selection.semester }] : []),
    ...(selection.semester ? [{ label: selection.semester, level: 'semester' as const, active: !selection.subject }] : []),
    ...(selection.subject ? [{ label: selection.subject, level: 'subject' as const, active: true }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center flex-wrap gap-2 text-sm text-black/60">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.level} className="flex items-center gap-2">
            {idx > 0 && <ChevronRight className="w-4 h-4" />}
            <button
              onClick={() => resetTo(crumb.level)}
              className={`hover:text-black transition-colors ${crumb.active ? 'text-black font-medium' : ''}`}
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-black/40">Loading...</div>
      ) : selection.subject ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-6">Resources for {selection.subject}</h2>
          {resources.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-black/5">
              <p className="text-black/60 mb-4">No resources found for this subject.</p>
              <Link to="/upload" className="text-blue-600 hover:underline">Be the first to upload one</Link>
            </div>
          ) : (
            resources.map(resource => (
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
                    <h3 className="font-medium text-lg mb-1">{resource.title}</h3>
                    <p className="text-sm text-black/60 line-clamp-2 mb-3">{resource.description}</p>
                    <div className="flex items-center gap-4 text-xs text-black/40">
                      <span>Uploaded by {resource.uploader_name || 'Anonymous'}</span>
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {options.length === 0 ? (
            <div className="col-span-full text-center py-12 text-black/60">
              No categories found.
            </div>
          ) : (
            options.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-black/20 hover:shadow-sm transition-all text-left"
              >
                <Folder className="w-5 h-5 text-blue-500" />
                <span className="font-medium">{option}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
