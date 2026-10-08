import { useEffect, useState } from 'react';
import type { Note, JournalEntry, Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { Trash2, Edit2 } from 'lucide-react';
import { PageLayout, PageSelect } from './PageLayout';
import { inRideOrder, type RideDirection } from '../utils/direction';

interface JournalPageProps {
  direction: RideDirection;
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
export function JournalPage({ direction, journalEntries, towns, onDeleteJournalEntry, onEditJournalEntry, onTownSelect }: JournalPageProps) {
  const [filterTownId, setFilterTownId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  // Newest first by default; remembered on this device
  const [order, setOrder] = useState<'newest' | 'oldest'>(() => {
    try {
      return localStorage.getItem('tour-divide-journal-order') === 'oldest' ? 'oldest' : 'newest';
    } catch {
      return 'newest';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('tour-divide-journal-order', order);
    } catch {
      // not critical
    }
  }, [order]);

  const townsInRouteOrder = inRideOrder([...towns].sort((a, b) => a.mileage - b.mileage), direction);
  const townLabel = (townId?: string) => {
    const town = towns.find((t) => t.id === townId);
    return town ? `${town.name}, ${town.state}` : null;
  };

  const filtered = filterTownId === 'all' ? journalEntries : journalEntries.filter((e) => e.townId === filterTownId);
  const sorted = [...filtered].sort((a, b) => (order === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
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
        <div className="space-y-3">
          <PageSelect id="journal-filter" label="Filter by town" value={filterTownId} onChange={setFilterTownId}>
            <option value="all">All towns</option>
            {townsInRouteOrder.map((town) => (
              <option key={town.id} value={town.id}>
                {town.name}, {town.state}
              </option>
            ))}
          </PageSelect>

          {/* Newest / Oldest: same sliding switch as the Route page */}
          <div role="radiogroup" aria-label="Sort entries" className="relative grid grid-cols-2 border-2 border-[#40C8EF] rounded-lg bg-white overflow-hidden">
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-1/2 bg-[#40C8EF] motion-safe:transition-transform motion-safe:duration-200 ease-out ${
                order === 'oldest' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {([
              { key: 'newest', label: 'Newest first' },
              { key: 'oldest', label: 'Oldest first' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                role="radio"
                aria-checked={order === key}
                onClick={() => setOrder(key)}
                className={`relative z-10 px-4 py-2.5 transition-colors ${order === key ? 'text-white' : 'text-[#40C8EF] hover:text-[#00B6EB]'}`}
              >
                <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      }
    >
      {sorted.length === 0 ? (
        <div className="w-[298px] border-2 border-[#40C8EF] px-6 py-10 text-center">
          <p className="font-display font-medium text-[13px] uppercase text-black">No entries yet</p>
          <p className="text-[13px] text-black/60 mt-2">Tap + to write your first journal entry.</p>
        </div>
      ) : (
        <ul className="w-[298px] border-2 border-[#40C8EF] divide-y-2 divide-[#40C8EF]">
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
                      className="w-full text-[14px] leading-relaxed border-2 border-[#40C8EF] rounded-lg px-3 py-2 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#40C8EF]/40"
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
