import { useState } from 'react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { Note, Resupply, Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { Search, Trash2, Edit2, Check, X, Clock } from 'lucide-react';

interface NotesPageProps {
  notes: Note[];
  resupplies: Resupply[];
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onDeleteNote: (noteId: string) => void;
  onDeleteResupply: (resupplyId: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onEditResupply: (resupplyId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onTownSelect: (townId: string) => void;
  onOpenTimer: () => void;
}

type FilterTab = 'all' | 'notes' | 'resupply';

export function NotesPage({
  notes,
  resupplies,
  towns,
  onDeleteNote,
  onDeleteResupply,
  onEditNote,
  onTownSelect,
  onOpenTimer,
}: NotesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const getTownName = (townId: string) => {
    const town = towns.find(t => t.id === townId);
    return town ? `${town.name}, ${town.state}` : 'Unknown';
  };

  const filteredNotes = notes.filter(n => {
    const town = towns.find(t => t.id === n.townId);
    const matches = n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (town?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matches && (filterTab === 'all' || filterTab === 'notes');
  });

  const filteredResupplies = resupplies.filter(r => {
    const town = towns.find(t => t.id === r.townId);
    const matches = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (town?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matches && (filterTab === 'all' || filterTab === 'resupply');
  });

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editingContent.trim()) {
      onEditNote(editingNoteId, editingContent.trim());
      setEditingNoteId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-30 bg-white flex flex-col">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex-shrink-0"
        style={navBgPattern ? { backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px' } : { backgroundColor: '#febc12' }}
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display font-bold text-xl text-[#231F20] uppercase tracking-tight font-bold">Notes</h1>
          <button onClick={onOpenTimer} className="p-1.5 rounded-full hover:bg-black/10">
            <Clock size={16} className="text-[#231F20]" />
          </button>
        </div>
        <p className="text-sm text-[#231F20]/70">{notes.length} notes · {resupplies.length} resupply options</p>
        <div className="mt-2 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#231F20]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm bg-white/70 border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#231F20]/30 placeholder-[#231F20]/40"
          />
        </div>
        <div className="flex gap-1 mt-2">
          {(['all', 'notes', 'resupply'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                filterTab === tab ? 'bg-[#231F20] text-white' : 'bg-white/60 text-[#231F20]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.map(note => (
          <div key={note.id} className="px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => onTownSelect(note.townId)}
              className="text-xs text-[#febc12] font-semibold uppercase tracking-wide mb-1 hover:underline"
            >
              {getTownName(note.townId)}
            </button>
            {editingNoteId === note.id ? (
              <div className="space-y-2">
                <textarea
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  className="w-full text-sm border border-[#febc12] rounded-lg px-2 py-1.5 resize-none focus:outline-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="flex items-center gap-1 px-2 py-1 bg-[#febc12] text-[#231F20] rounded-lg text-xs font-medium">
                    <Check size={12} /> Save
                  </button>
                  <button onClick={() => setEditingNoteId(null)} className="flex items-center gap-1 px-2 py-1 text-gray-400 text-xs">
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleStartEdit(note)} className="text-gray-300 hover:text-[#231F20]">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => onDeleteNote(note.id)} className="text-gray-300 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {filteredResupplies.map(rs => (
          <div key={rs.id} className="px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => onTownSelect(rs.townId)}
              className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1 hover:underline"
            >
              {getTownName(rs.townId)} · Resupply
            </button>
            <p className="text-sm font-medium text-gray-800">{rs.name}</p>
            <p className="text-xs text-gray-500">{rs.hours}</p>
            <div className="flex items-center justify-end mt-1.5">
              <button onClick={() => onDeleteResupply(rs.id)} className="text-gray-300 hover:text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && filteredResupplies.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            {searchQuery ? 'No results found' : 'No notes yet. Tap + to add one.'}
          </div>
        )}
      </div>
    </div>
  );
}
