import { useState } from 'react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { Town, Note, Resupply } from '../types';
import { formatDistance, formatElevation } from '../utils/measurements';
import type { MeasurementSystem } from '../utils/measurements';
import { X, Clock, Search, Plus, Trash2, Edit2, Check, ShoppingCart } from 'lucide-react';

interface TownsListProps {
  towns: Town[];
  notes: Note[];
  resupplies: Resupply[];
  notesCount: Record<string, number>;
  measurementSystem: MeasurementSystem;
  onAddNote: (townId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onAddResupply: (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onDeleteResupply: (resupplyId: string) => void;
  onEditResupply: (resupplyId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onClose: () => void;
  onOpenTimer: () => void;
}

export function TownsList({
  towns,
  notes,
  resupplies,
  notesCount,
  measurementSystem,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onAddResupply,
  onDeleteResupply,
  onClose,
  onOpenTimer,
}: TownsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTown, setExpandedTown] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [addingResupplyFor, setAddingResupplyFor] = useState<string | null>(null);
  const [newResupplyName, setNewResupplyName] = useState('');

  const filteredTowns = towns.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTownNotes = (townId: string) => notes.filter(n => n.townId === townId);
  const getTownResupplies = (townId: string) => resupplies.filter(r => r.townId === townId);

  const handleAddNote = (townId: string) => {
    if (newNote.trim()) {
      onAddNote(townId, newNote.trim());
      setNewNote('');
      setAddingNoteFor(null);
    }
  };

  const handleAddResupply = (townId: string) => {
    if (newResupplyName.trim()) {
      onAddResupply(townId, { name: newResupplyName.trim(), hours: 'Hours unknown', phone: 'No phone', address: '' });
      setNewResupplyName('');
      setAddingResupplyFor(null);
    }
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
          <h1 className="font-display font-bold text-xl text-[#231F20] uppercase tracking-tight font-bold">Towns</h1>
          <div className="flex gap-1">
            <button onClick={onOpenTimer} className="p-1.5 rounded-full hover:bg-black/10">
              <Clock size={16} className="text-[#231F20]" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10">
              <X size={18} className="text-[#231F20]" />
            </button>
          </div>
        </div>
        <p className="text-sm text-[#231F20]/70">{towns.length} stops along the route</p>
        <div className="mt-2 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#231F20]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search towns..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm bg-white/70 border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#231F20]/30 placeholder-[#231F20]/40"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTowns.map((town) => {
          const isExpanded = expandedTown === town.id;
          const townNotes = getTownNotes(town.id);
          const townResupplies = getTownResupplies(town.id);
          const count = notesCount[town.id] || 0;

          return (
            <div key={town.id} className="border-b border-gray-100">
              <button
                onClick={() => setExpandedTown(isExpanded ? null : town.id)}
                className="w-full flex items-start justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{town.name}</span>
                    <span className="text-xs text-gray-400 font-medium">{town.state}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{formatDistance(town.mileage, measurementSystem)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{formatElevation(town.elevation, measurementSystem)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">Pop. {town.population.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  {count > 0 && (
                    <span className="bg-[#febc12] text-[#231F20] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
                  )}
                  {townResupplies.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <ShoppingCart size={9} /> {townResupplies.length}
                    </span>
                  )}
                  <span className={`text-gray-400 text-lg transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 bg-gray-50 space-y-3">
                  {/* Fun facts */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">About {town.name}</h4>
                    <ul className="space-y-1">
                      {town.funFacts.map((fact, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-[#febc12] flex-shrink-0">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">My Notes</h4>
                      <button onClick={() => setAddingNoteFor(town.id)} className="text-[10px] text-[#febc12] font-semibold flex items-center gap-0.5">
                        <Plus size={10} /> Add
                      </button>
                    </div>
                    {addingNoteFor === town.id && (
                      <div className="space-y-1.5 mb-2">
                        <textarea
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="w-full text-xs border border-[#febc12] rounded-lg px-2 py-1.5 resize-none focus:outline-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button onClick={() => handleAddNote(town.id)} className="flex items-center gap-1 px-2 py-1 bg-[#febc12] text-[#231F20] rounded-lg text-[10px] font-semibold">
                            <Check size={10} /> Save
                          </button>
                          <button onClick={() => { setAddingNoteFor(null); setNewNote(''); }} className="px-2 py-1 text-gray-400 text-[10px]">Cancel</button>
                        </div>
                      </div>
                    )}
                    {townNotes.length === 0 && !addingNoteFor ? (
                      <p className="text-xs text-gray-400 italic">No notes yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {townNotes.slice(0, 2).map(note => (
                          <div key={note.id} className="bg-white rounded-lg p-2 border border-gray-100">
                            {editingNoteId === note.id ? (
                              <div className="space-y-1">
                                <textarea
                                  value={editingContent}
                                  onChange={e => setEditingContent(e.target.value)}
                                  className="w-full text-xs border border-[#febc12] rounded px-1.5 py-1 resize-none focus:outline-none"
                                  rows={2}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <button onClick={handleSaveEdit} className="flex items-center gap-1 px-2 py-0.5 bg-[#febc12] text-[#231F20] rounded text-[10px] font-semibold">
                                    <Check size={9} /> Save
                                  </button>
                                  <button onClick={() => setEditingNoteId(null)} className="text-gray-400 text-[10px] px-1">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-xs text-gray-700 line-clamp-2 flex-1">{note.content}</p>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button onClick={() => { setEditingNoteId(note.id); setEditingContent(note.content); }} className="text-gray-300 hover:text-[#231F20]">
                                    <Edit2 size={10} />
                                  </button>
                                  <button onClick={() => onDeleteNote(note.id)} className="text-gray-300 hover:text-red-400">
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {townNotes.length > 2 && (
                          <p className="text-[10px] text-gray-400 text-center">+{townNotes.length - 2} more</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resupply */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Resupply</h4>
                      <button onClick={() => setAddingResupplyFor(town.id)} className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                        <Plus size={10} /> Add
                      </button>
                    </div>
                    {addingResupplyFor === town.id && (
                      <div className="space-y-1.5 mb-2">
                        <input
                          value={newResupplyName}
                          onChange={e => setNewResupplyName(e.target.value)}
                          placeholder="Store or service name"
                          className="w-full text-xs border border-green-400 rounded-lg px-2 py-1.5 focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button onClick={() => handleAddResupply(town.id)} className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-[10px] font-semibold">
                            <Check size={10} /> Save
                          </button>
                          <button onClick={() => { setAddingResupplyFor(null); setNewResupplyName(''); }} className="px-2 py-1 text-gray-400 text-[10px]">Cancel</button>
                        </div>
                      </div>
                    )}
                    {townResupplies.length === 0 && !addingResupplyFor ? (
                      <p className="text-xs text-gray-400 italic">No resupply options</p>
                    ) : (
                      <div className="space-y-1.5">
                        {townResupplies.map(rs => (
                          <div key={rs.id} className="bg-white rounded-lg p-2 border border-gray-100 flex items-start justify-between">
                            <div>
                              <div className="font-medium text-xs text-gray-900">{rs.name}</div>
                              <div className="text-[10px] text-gray-500">{rs.hours}</div>
                            </div>
                            <button onClick={() => onDeleteResupply(rs.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
