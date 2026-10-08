import { useState } from 'react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { Note, Resupply, Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { milesToKm } from '../utils/measurements';
import { X, Plus, Trash2, Edit2, Check, ShoppingCart } from 'lucide-react';

interface NotesPanelProps {
  selectedTown: Town;
  notes: Note[];
  resupplies: Resupply[];
  measurementSystem: MeasurementSystem;
  onAddNote: (townId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onAddResupply: (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onDeleteResupply: (resupplyId: string) => void;
  onEditResupply: (resupplyId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onClose: () => void;
  onNavigateToTown: () => void;
}

export function NotesPanel({
  selectedTown,
  measurementSystem,
  notes,
  resupplies,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onAddResupply,
  onDeleteResupply,
  onClose,
}: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'resupply'>('resupply');
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showAddResupply, setShowAddResupply] = useState(false);
  const [newResupplyName, setNewResupplyName] = useState('');
  const [newResupplyHours, setNewResupplyHours] = useState('');

  const townNotes = notes.filter(n => n.townId === selectedTown.id);
  const townResupplies = resupplies.filter(r => r.townId === selectedTown.id);

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(selectedTown.id, newNote.trim());
      setNewNote('');
    }
  };

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

  const handleAddResupply = () => {
    if (newResupplyName.trim()) {
      onAddResupply(selectedTown.id, {
        name: newResupplyName.trim(),
        hours: newResupplyHours.trim() || 'Hours unknown',
        phone: 'No phone',
        address: '',
      });
      setNewResupplyName('');
      setNewResupplyHours('');
      setShowAddResupply(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-30 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex-shrink-0"
        style={navBgPattern ? { backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px' } : { backgroundColor: '#febc12' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-[#231F20] uppercase tracking-tight">{selectedTown.name}</h2>
            <p className="text-xs text-[#231F20]/70">{selectedTown.state} · {measurementSystem === 'metric' ? `Km ${milesToKm(selectedTown.mileage)}` : `Mile ${selectedTown.mileage}`}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 transition-colors mt-1">
            <X size={16} className="text-[#231F20]" />
          </button>
        </div>
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'notes' ? 'bg-[#231F20] text-white' : 'bg-white/60 text-[#231F20]'
            }`}
          >
            Journal ({townNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('resupply')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'resupply' ? 'bg-[#231F20] text-white' : 'bg-white/60 text-[#231F20]'
            }`}
          >
            Resupply ({townResupplies.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {activeTab === 'notes' ? (
          townNotes.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No journal entries yet</div>
          ) : (
            townNotes.map(note => (
              <div key={note.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      className="w-full text-sm border border-[#febc12] rounded-lg px-2 py-1.5 resize-none focus:outline-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="flex items-center gap-1 px-2 py-2 bg-[#febc12] text-[#231F20] rounded-lg text-xs font-medium">
                        <Check size={12} /> Save
                      </button>
                      <button onClick={() => setEditingNoteId(null)} className="px-2 py-2 text-gray-400 text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-gray-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleStartEdit(note)} className="text-gray-400 hover:text-[#231F20]">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => onDeleteNote(note.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )
        ) : (
          <>
            {townResupplies.length === 0 && !showAddResupply && (
              <div className="text-center text-gray-400 py-8 text-sm">No resupply options yet</div>
            )}
            {townResupplies.map(rs => (
              <div key={rs.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={14} className="text-[#febc12] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{rs.name}</div>
                      <div className="text-xs text-gray-500">{rs.hours}</div>
                    </div>
                  </div>
                  <button onClick={() => onDeleteResupply(rs.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {showAddResupply && (
              <div className="bg-gray-50 rounded-xl p-3 border border-[#febc12] space-y-3">
                <input
                  value={newResupplyName}
                  onChange={e => setNewResupplyName(e.target.value)}
                  placeholder="Store or service name"
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#febc12]"
                  autoFocus
                />
                <input
                  value={newResupplyHours}
                  onChange={e => setNewResupplyHours(e.target.value)}
                  placeholder="Hours (e.g. Mon-Sat 8am-6pm)"
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#febc12]"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddResupply} className="flex items-center gap-1 px-2 py-2 bg-[#febc12] text-[#231F20] rounded-lg text-xs font-medium">
                    <Check size={12} /> Add
                  </button>
                  <button onClick={() => setShowAddResupply(false)} className="px-2 py-2 text-gray-400 text-xs">Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">
        {activeTab === 'notes' ? (
          <div className="flex gap-2">
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Write a journal entry..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#febc12] focus:border-transparent"
              rows={2}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddNote(); }}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="px-3 bg-[#febc12] text-[#231F20] font-semibold rounded-xl text-sm disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddResupply(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#febc12] text-[#231F20] rounded-xl text-sm font-semibold"
          >
            <Plus size={16} /> Add Resupply
          </button>
        )}
      </div>
    </div>
  );
}
