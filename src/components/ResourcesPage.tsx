import { useState } from 'react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { Resource } from '../types';
import { FileTextIcon } from './icons/FileTextIcon';
import { X } from 'lucide-react';

interface ResourcesPageProps {
  resources: Resource[];
  onClose: () => void;
}

export function ResourcesPage({ resources, onClose }: ResourcesPageProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'gpx' | 'note'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = resources.filter(r => {
    const matchesFilter = activeFilter === 'all' || r.type === activeFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const gpxCount = resources.filter(r => r.type === 'gpx').length;
  const noteCount = resources.filter(r => r.type === 'note').length;

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex-shrink-0"
        style={navBgPattern ? { backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px' } : { backgroundColor: '#febc12' }}
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-['Coordinates:Bold',sans-serif] text-xl text-[#231F20] uppercase tracking-tight">Resources</h1>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 transition-colors">
            <X size={18} className="text-[#231F20]" />
          </button>
        </div>
        <p className="text-sm text-[#231F20]/70">GPX tracks and route notes</p>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search resources..."
          className="w-full px-3 py-2 rounded-xl text-sm bg-white/70 border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#231F20]/30 placeholder-[#231F20]/40 mt-2"
        />
        <div className="flex gap-2 mt-2">
          {[
            { key: 'all', label: `All (${resources.length})` },
            { key: 'gpx', label: `GPX (${gpxCount})` },
            { key: 'note', label: `Notes (${noteCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as typeof activeFilter)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === tab.key ? 'bg-[#231F20] text-white' : 'bg-white/60 text-[#231F20]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">No resources found</div>
        ) : (
          filtered.map(resource => (
            <div key={resource.id} className="px-4 py-3 border-b border-gray-100 flex items-start gap-3">
              <div className={`mt-0.5 flex-shrink-0 p-2 rounded-xl ${resource.type === 'gpx' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                <FileTextIcon size={16} className={resource.type === 'gpx' ? 'text-blue-500' : 'text-amber-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{resource.title}</div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{resource.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    resource.type === 'gpx' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {resource.type}
                  </span>
                  {resource.fileSize && <span className="text-[10px] text-gray-400">{resource.fileSize}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
