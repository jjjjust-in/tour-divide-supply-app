import { useState } from 'react';
import type { Note, JournalEntry, Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { Trash2, Edit2 } from 'lucide-react';
import { PageLayout, PageSelect } from './PageLayout';

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
}

// Journal: same layout as the Itinerary. Title, entry count, town filter,
// then the entries in a bordered list.
export function JournalPage({ journalEntries, towns, onDeleteJournalEntry, onEditJournalEntry, onTownSelect }: JournalPageProps) {
  const [filterTownId, setFilterTownId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const townsInRouteOrder = [...towns].sort((a, b) => a.mileage - b.mileage);
  const townLabel = (townId?: string) => {
    const town = towns.find((t) => t.id === townId);
    return town ? `${town.name}, ${town.state}` : null;
  };

  const filtered = filterTownId === 'all' ? journalEntries : journalEntries.filter((e) => e.townId === filterTownId);
  const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  const count = (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`;

  const saveEdit = (entry: JournalEntry) => {
    if (!editingContent.trim()) return;
    onEditJournalEntry(entry.id, editingContent.trim(), entry.imageUrl);
    setEditingId(null);
  };

  return (
    <PageLayout
      title="Journal"
      meta={filterTownId === 'all' ? count(journalEntries.length) : `${count(filtered.length)} in ${townLabel(filterTownId)}`}
      control={
        <PageSelect id="journal-filter" label="Filter by town" value={filterTownId} onChange={setFilterTownId}>
          <option value="all">All towns</option>
          {townsInRouteOrder.map((town) => (
            <option key={town.id} value={town.id}>
              {town.name}, {town.state}
            </option>
          ))}
        </PageSelect>
      }
    >
      {sorted.length === 0 ? (
        <div className="w-[298px] border border-[#40C8EF] px-6 py-10 text-center">
          <p className="font-display font-medium text-[13px] uppercase text-black">No entries yet</p>
          <p className="text-[13px] text-black/60 mt-2">Tap + to write your first journal entry.</p>
        </div>
      ) : (
        <ul className="w-[298px] border border-[#40C8EF] divide-y divide-[#40C8EF]">
          {sorted.map((entry) => {
            const town = townLabel(entry.townId);
            const isEditing = editingId === entry.id;
            return (
              <li key={entry.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {town && (
                      <button
                        onClick={() => entry.townId && onTownSelect(entry.townId)}
                        className="block font-display font-medium text-[12px] uppercase tracking-[-0.2px] text-black underline decoration-[#40c8ef] decoration-2 underline-offset-4 hover:text-[#00B6EB] text-left"
                      >
                        {town}
                      </button>
                    )}
                    <p className="text-[11px] text-black/50 mt-1">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {!isEditing && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditingContent(entry.content);
                        }}
                        aria-label="Edit entry"
                        className="p-1.5 text-black/40 hover:text-black transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteJournalEntry(entry.id)}
                        aria-label="Delete entry"
                        className="p-1.5 text-black/40 hover:text-[#FF6B35] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {entry.imageUrl && <img src={entry.imageUrl} alt="" className="mt-3 w-full h-auto" />}

                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full text-[14px] leading-relaxed border border-[#40c8ef] rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50"
                      rows={6}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-gray-200 text-black py-2.5 rounded text-[12px] font-display font-medium uppercase hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(entry)}
                        disabled={!editingContent.trim()}
                        className="flex-1 bg-[#40c8ef] text-white py-2.5 rounded text-[12px] font-display font-medium uppercase hover:bg-[#00B6EB] transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-[14px] leading-relaxed text-black whitespace-pre-wrap">{entry.content}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PageLayout>
  );
}
