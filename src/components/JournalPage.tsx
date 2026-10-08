import { useState } from 'react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { Note, JournalEntry, Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface JournalPageProps {
  notes: Note[];
  journalEntries: JournalEntry[];
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onDeleteNote: (noteId: string) => void;
  onDeleteJournalEntry: (entryId: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onEditJournalEntry: (entryId: string, content: string, imageUrl?: string) => void;
  onTownSelect: (townId: string) => void;
  onClose?: () => void;
}

export function JournalPage({
  journalEntries,
  towns,
  onDeleteJournalEntry,
  onEditJournalEntry,
  onTownSelect,
  onClose,
}: JournalPageProps) {
  const [filterTownId, setFilterTownId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const getTownName = (townId?: string) => {
    if (!townId) return null;
    const town = towns.find(t => t.id === townId);
    return town ? `${town.name}, ${town.state}` : null;
  };

  const filtered = filterTownId === 'all'
    ? journalEntries
    : journalEntries.filter(e => e.townId === filterTownId);

  const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);

  const handleSaveEdit = (entry: JournalEntry) => {
    if (editingContent.trim()) {
      onEditJournalEntry(entry.id, editingContent.trim(), entry.imageUrl);
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-30 bg-white flex flex-col">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex-shrink-0"
        style={navBgPattern ? { backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px' } : { backgroundColor: '#febc12' }}
      >
        <div className="flex items-center justify-between mb-0.5">
          <h1 className="font-display font-bold text-xl text-[#231F20] uppercase tracking-tight">Journal</h1>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10">
              <X size={18} className="text-[#231F20]" />
            </button>
          )}
        </div>
        <p className="text-sm text-[#231F20]/70 mt-0.5">{journalEntries.length} entries</p>
        <div className="mt-2">
          <select
            value={filterTownId}
            onChange={e => setFilterTownId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm bg-white/70 border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#231F20]/30"
          >
            <option value="all">All towns</option>
            {towns.map(town => (
              <option key={town.id} value={town.id}>
                {town.name}, {town.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            No journal entries yet. Tap + to add one.
          </div>
        ) : (
          sorted.map(entry => {
            const townName = getTownName(entry.townId);
            return (
              <div key={entry.id} className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {townName && (
                      <button
                        onClick={() => entry.townId && onTownSelect(entry.townId)}
                        className="text-xs text-[#febc12] font-semibold uppercase tracking-wide hover:underline"
                      >
                        {townName}
                      </button>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  </div>
                  {editingId !== entry.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingId(entry.id); setEditingContent(entry.content); }}
                        className="text-gray-300 hover:text-[#231F20]"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => onDeleteJournalEntry(entry.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === entry.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      className="w-full text-sm border border-[#febc12] rounded-lg px-2 py-1.5 resize-none focus:outline-none"
                      rows={5}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(entry)} className="flex items-center gap-1 px-2 py-1 bg-[#febc12] text-[#231F20] rounded-lg text-xs font-medium">
                        <Check size={12} /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-2 py-1 text-gray-400 text-xs">
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
