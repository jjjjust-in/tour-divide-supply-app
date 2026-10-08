import type { Town } from '../types';
import { itinerary } from '../data/itinerary';
import type { MeasurementSystem } from '../utils/measurements';
import { formatDistance, formatElevation, milesToKm } from '../utils/measurements';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import type { Note, Resupply } from '../types';

interface SimpleRouteMapProps {
  towns: Town[];
  selectedTownId: string | null;
  onTownSelect: (townId: string) => void;
  notesCount: Record<string, number>;
  measurementSystem: MeasurementSystem;
  onClose?: () => void;
  onOpenTimer?: () => void;
  notes: Note[];
  resupplies: Resupply[];
  onAddNote: (townId: string, content: string, imageUrl?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, content: string, imageUrl?: string) => void;
  onAddResupply: (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onDeleteResupply: (resupplyId: string) => void;
  onEditResupply: (resupplyId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
}

function ItineraryRow({
  mileage,
  location,
  isClickable,
  linkedTownId,
  town,
  towns,
  measurementSystem,
  notes,
  resupplies,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onAddResupply,
  onDeleteResupply,
  onEditResupply
}: {
  mileage: number;
  location: string;
  isClickable: boolean;
  linkedTownId?: string;
  town?: Town;
  towns: Town[];
  measurementSystem: MeasurementSystem;
  notes: Note[];
  resupplies: Resupply[];
  onAddNote: (townId: string, content: string, imageUrl?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, content: string, imageUrl?: string) => void;
  onAddResupply: (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onDeleteResupply: (resupplyId: string) => void;
  onEditResupply: (resupplyId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'resupplies'>('resupplies');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showResupplyForm, setShowResupplyForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editingResupplyId, setEditingResupplyId] = useState<string | null>(null);
  const [editResupply, setEditResupply] = useState({
    name: '',
    hours: '',
    phone: '',
    address: ''
  });
  const [newResupply, setNewResupply] = useState({
    name: '',
    hours: '',
    phone: '',
    address: ''
  });

  const handleClick = () => {
    if (isClickable && linkedTownId) {
      setIsExpanded(!isExpanded);
      if (!isExpanded) {
        setActiveTab('resupplies');
        setShowNoteForm(false);
        setShowResupplyForm(false);
      }
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setActiveTab('resupplies');
      setShowNoteForm(false);
      setShowResupplyForm(false);
    }
  };

  const mileageToNext = town ? (() => {
    const townIndex = towns.findIndex(t => t.id === town.id);
    const nextTown = townIndex < towns.length - 1 ? towns[townIndex + 1] : null;
    return nextTown ? nextTown.mileage - town.mileage : null;
  })() : null;

  const townNotes = town ? notes.filter(note => note.townId === town.id) : [];
  const townResupplies = town ? resupplies.filter(resupply => resupply.townId === town.id) : [];

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim() && town) {
      onAddNote(town.id, newNote.trim());
      setNewNote('');
      setShowNoteForm(false);
    }
  };

  const handleSubmitResupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResupply.name.trim() && town) {
      onAddResupply(town.id, newResupply);
      setNewResupply({ name: '', hours: '', phone: '', address: '' });
      setShowResupplyForm(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
  };

  const handleSaveNote = () => {
    if (editingNoteId && editNoteContent.trim()) {
      onEditNote(editingNoteId, editNoteContent.trim());
      setEditingNoteId(null);
      setEditNoteContent('');
    }
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  const handleEditResupply = (resupply: Resupply) => {
    setEditingResupplyId(resupply.id);
    setEditResupply({
      name: resupply.name,
      hours: resupply.hours || '',
      phone: resupply.phone || '',
      address: resupply.address || ''
    });
  };

  const handleSaveResupply = () => {
    if (editingResupplyId && editResupply.name.trim()) {
      onEditResupply(editingResupplyId, editResupply);
      setEditingResupplyId(null);
      setEditResupply({ name: '', hours: '', phone: '', address: '' });
    }
  };

  const handleCancelEditResupply = () => {
    setEditingResupplyId(null);
    setEditResupply({ name: '', hours: '', phone: '', address: '' });
  };

  return (
    <>
      <div
        className={`content-stretch flex h-[24px] items-center min-h-px min-w-px relative shrink-0 w-full ${
          isClickable ? 'cursor-pointer hover:bg-[#40c8ef]/5 active:bg-[#40c8ef]/10 transition-colors' : ''
        }`}
        onClick={handleClick}
      >
        <div className="content-stretch flex gap-[10px] h-full items-center justify-center relative shrink-0">
          <div aria-hidden="true" className="absolute border border-[#40c8ef] border-solid inset-0 pointer-events-none" />
          <div className="flex flex-col font-display font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-black text-[12px] text-center uppercase w-[60px]">
            <p className="leading-[normal]">{measurementSystem === 'metric' ? milesToKm(mileage) : mileage}</p>
          </div>
        </div>
        <div className="h-full min-h-px min-w-px relative shrink-0 flex-1">
          <div aria-hidden="true" className="absolute border border-[#40c8ef] border-solid inset-0 pointer-events-none" />
          <div className="flex flex-row items-center justify-center size-full">
            <div
              className={`box-border content-stretch flex gap-[10px] items-center justify-between p-[12px] relative size-full ${
                isClickable ? 'cursor-pointer transition-colors' : ''
              }`}
            >
              <p className={`flex-1 font-display font-medium leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-black text-[12px] uppercase ${
                ''
              }`}>
                {location}
              </p>
              {isClickable && town && (
                <button
                  onClick={handleToggle}
                  className="flex-shrink-0 ml-2 p-1 hover:bg-[#40c8ef]/10 rounded transition-colors"
                  aria-label={isExpanded ? "Collapse details" : "Expand details"}
                >
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-[#40c8ef]" />
                  ) : (
                    <ChevronDown size={14} className="text-[#40c8ef]" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Town Details */}
      {isExpanded && isClickable && town && (
        <div className="w-full bg-[#F5FCFF] border-x border-b border-[#40c8ef]">
          <div className="p-3 space-y-3">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-black uppercase font-display font-medium tracking-[-0.36px] text-[12px] mb-1">
                  ELEV
                </div>
                <div className="text-black text-[14px] font-display font-medium leading-[120%]">
                  {formatElevation(town.elevation, measurementSystem)}
                </div>
              </div>
              {town.population && (
                <div>
                  <div className="text-black uppercase font-display font-medium tracking-[-0.36px] text-[12px] mb-1">
                    POP
                  </div>
                  <div className="text-black text-[14px] font-display font-medium leading-[120%]">
                    {town.population.toLocaleString()}
                  </div>
                </div>
              )}
              {mileageToNext !== null && (
                <div>
                  <div className="text-black uppercase font-display font-medium tracking-[-0.36px] text-[12px] mb-1">
                    TO NEXT
                  </div>
                  <div className="text-black text-[14px] font-display font-medium leading-[120%]">
                    {formatDistance(mileageToNext, measurementSystem)}
                  </div>
                </div>
              )}
            </div>

            {/* Fun Facts */}
            {town.funFacts && town.funFacts.length > 0 && (
              <div className="pt-2 border-t border-[#40c8ef]/20">
                <div className="space-y-1.5">
                  {town.funFacts.map((fact, index) => (
                    <div key={index} className="text-[13px] text-black flex items-start gap-1.5">
                      <span className="text-black flex-shrink-0 text-[13px] leading-[120%]">•</span>
                      <span className="flex-1 leading-[120%]">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="pt-2 border-t border-[#40c8ef]/20 space-y-3">
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setActiveTab('resupplies');
                    setShowNoteForm(false);
                    setShowResupplyForm(false);
                  }}
                  className={`flex-1 px-2 py-2 text-[12px] font-display font-medium uppercase tracking-[-0.2px] rounded transition-colors flex items-center justify-center gap-1 ${
                    activeTab === 'resupplies'
                      ? 'bg-[#40c8ef] text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  Resupplies ({townResupplies.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('notes');
                    setShowNoteForm(false);
                    setShowResupplyForm(false);
                  }}
                  className={`flex-1 px-2 py-2 text-[12px] font-display font-medium uppercase tracking-[-0.2px] rounded transition-colors flex items-center justify-center gap-1 ${
                    activeTab === 'notes'
                      ? 'bg-[#40c8ef] text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  Journal ({townNotes.length})
                </button>
              </div>

              {/* Notes Tab Content */}
              {activeTab === 'notes' && (
                <div className="space-y-2">
                  {townNotes.length === 0 ? (
                    <p className="text-[13px] text-black italic leading-[120%]">No journal entries yet</p>
                  ) : (
                    townNotes.map(note => (
                      <div key={note.id} className="bg-white/50 border border-[#40c8ef]/20 rounded p-1.5 group">
                        {editingNoteId === note.id ? (
                          <div className="space-y-1.5">
                            <textarea
                              value={editNoteContent}
                              onChange={(e) => setEditNoteContent(e.target.value)}
                              className="w-full border border-[#40c8ef] rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 resize-none text-[13px] leading-[120%]"
                              rows={2}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleCancelEditNote}
                                className="flex-1 bg-gray-300 text-black py-2 px-1.5 rounded hover:bg-gray-400 transition-colors text-[11px] font-display font-medium uppercase"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveNote}
                                disabled={!editNoteContent.trim()}
                                className="flex-1 bg-[#40c8ef] text-white py-2 px-1.5 rounded hover:bg-[#00B6EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-display font-medium uppercase"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-1">
                            <p className="flex-1 text-[13px] text-black leading-[120%]">{note.content}</p>
                            <div className="flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="text-[#999] hover:text-[#40c8ef] transition-colors p-0.5"
                                aria-label="Edit journal entry"
                              >
                                <Edit2 size={10} />
                              </button>
                              <button
                                onClick={() => onDeleteNote(note.id)}
                                className="text-[#999] hover:text-[#FF6B35] transition-colors p-0.5"
                                aria-label="Delete journal entry"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {!showNoteForm ? (
                    <button
                      onClick={() => setShowNoteForm(true)}
                      className="w-full bg-[#40c8ef] text-white py-2.5 px-2 rounded hover:bg-[#00B6EB] transition-colors flex items-center justify-center gap-1 text-[11px] font-display font-medium uppercase tracking-[-0.2px]"
                    >
                      <Plus size={10} />
                      Add Entry
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitNote} className="space-y-1.5">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write a journal entry..."
                        className="w-full border border-[#40c8ef] rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 resize-none text-[13px] leading-[120%]"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNoteForm(false);
                            setNewNote('');
                          }}
                          className="flex-1 bg-gray-300 text-black py-2 px-1.5 rounded hover:bg-gray-400 transition-colors text-[11px] font-display font-medium uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newNote.trim()}
                          className="flex-1 bg-[#40c8ef] text-white py-2 px-1.5 rounded hover:bg-[#00B6EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-display font-medium uppercase"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Resupplies Tab Content */}
              {activeTab === 'resupplies' && (
                <div className="space-y-2">
                  {townResupplies.length === 0 ? (
                    <p className="text-[13px] text-black italic leading-[120%]">No resupplies yet</p>
                  ) : (
                    townResupplies.map(resupply => (
                      <div key={resupply.id} className="bg-[#FFFAEB] border border-[#febc12]/40 rounded p-1.5 group">
                        {editingResupplyId === resupply.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editResupply.name}
                              onChange={(e) => setEditResupply({ ...editResupply, name: e.target.value })}
                              placeholder="Store name *"
                              className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                            />
                            <input
                              type="text"
                              value={editResupply.hours}
                              onChange={(e) => setEditResupply({ ...editResupply, hours: e.target.value })}
                              placeholder="Hours (optional)"
                              className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                            />
                            <input
                              type="text"
                              value={editResupply.phone}
                              onChange={(e) => setEditResupply({ ...editResupply, phone: e.target.value })}
                              placeholder="Phone (optional)"
                              className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                            />
                            <input
                              type="text"
                              value={editResupply.address}
                              onChange={(e) => setEditResupply({ ...editResupply, address: e.target.value })}
                              placeholder="Address (optional)"
                              className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleCancelEditResupply}
                                className="flex-1 bg-gray-300 text-black py-2 px-1.5 rounded hover:bg-gray-400 transition-colors text-[11px] font-display font-medium uppercase"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveResupply}
                                disabled={!editResupply.name.trim()}
                                className="flex-1 bg-[#40c8ef] text-white py-2 px-1.5 rounded hover:bg-[#00B6EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-display font-medium uppercase"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1">
                              <h4 className="text-black font-display font-bold uppercase text-[13px] leading-[120%]">
                                {resupply.name}
                              </h4>
                              {resupply.hours && (
                                <p className="text-[10px] text-black leading-[120%] mt-1">
                                  <span className="font-display font-medium text-black">Hours:</span> {resupply.hours}
                                </p>
                              )}
                              {resupply.phone && (
                                <p className="text-[10px] text-black leading-[120%] mt-1">
                                  <span className="font-display font-medium text-black">Phone:</span> {resupply.phone}
                                </p>
                              )}
                              {resupply.address && (
                                <p className="text-[10px] text-black leading-[120%] mt-1">
                                  <span className="font-display font-medium text-black">Address:</span>{' '}
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resupply.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-black hover:underline"
                                  >
                                    {resupply.address}
                                  </a>
                                </p>
                              )}
                            </div>
                            <div className="flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditResupply(resupply)}
                                className="text-[#999] hover:text-[#febc12] transition-colors p-0.5"
                                aria-label="Edit resupply"
                              >
                                <Edit2 size={10} />
                              </button>
                              <button
                                onClick={() => onDeleteResupply(resupply.id)}
                                className="text-[#999] hover:text-[#FF6B35] transition-colors p-0.5"
                                aria-label="Delete resupply"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {!showResupplyForm ? (
                    <button
                      onClick={() => setShowResupplyForm(true)}
                      className="w-full bg-[#40c8ef] text-white py-2.5 px-2 rounded hover:bg-[#00B6EB] transition-colors flex items-center justify-center gap-1 text-[11px] font-display font-medium uppercase tracking-[-0.2px]"
                    >
                      <Plus size={10} />
                      Add Resupply
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitResupply} className="space-y-1.5">
                      <input
                        type="text"
                        value={newResupply.name}
                        onChange={(e) => setNewResupply({ ...newResupply, name: e.target.value })}
                        placeholder="Store name *"
                        className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                        required
                        autoFocus
                      />
                      <input
                        type="text"
                        value={newResupply.hours}
                        onChange={(e) => setNewResupply({ ...newResupply, hours: e.target.value })}
                        placeholder="Hours (optional)"
                        className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                      />
                      <input
                        type="text"
                        value={newResupply.phone}
                        onChange={(e) => setNewResupply({ ...newResupply, phone: e.target.value })}
                        placeholder="Phone (optional)"
                        className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                      />
                      <input
                        type="text"
                        value={newResupply.address}
                        onChange={(e) => setNewResupply({ ...newResupply, address: e.target.value })}
                        placeholder="Address (optional)"
                        className="w-full border border-[#40c8ef] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#40c8ef]/50 text-[13px]"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowResupplyForm(false);
                            setNewResupply({ name: '', hours: '', phone: '', address: '' });
                          }}
                          className="flex-1 bg-gray-300 text-black py-2 px-1.5 rounded hover:bg-gray-400 transition-colors text-[11px] font-display font-medium uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newResupply.name.trim()}
                          className="flex-1 bg-[#40c8ef] text-white py-2 px-1.5 rounded hover:bg-[#00B6EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-display font-medium uppercase"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SimpleRouteMap({ towns, measurementSystem, notes, resupplies, onAddNote, onDeleteNote, onEditNote, onAddResupply, onDeleteResupply, onEditResupply }: SimpleRouteMapProps) {
  const mappedStops = itinerary;

  return (
    <div className="relative w-full h-full flex items-center justify-start bg-white overflow-auto">
      <div className="flex flex-col items-center justify-start size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center px-[20px] md:px-[85px] py-[40px] pb-[150px] md:py-[96px] md:pb-[206px] relative">
          {/* Title */}
          <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[24px] pt-0 px-0 relative shrink-0 w-full h-[94px]">
            <p className="font-display font-bold leading-[normal] not-italic relative shrink-0 text-black text-[20px] text-nowrap tracking-[-0.36px] uppercase whitespace-pre">The Route</p>
          </div>

          {/* Itinerary List */}
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-[298px] border border-[#40C8EF]">
            {mappedStops.map((stop) => {
              const linkedTown = stop.linkedTownId ? towns.find(t => t.id === stop.linkedTownId) : undefined;
              return (
                <ItineraryRow
                  key={stop.id}
                  mileage={stop.mileage}
                  location={stop.location}
                  isClickable={stop.isClickable}
                  linkedTownId={stop.linkedTownId}
                  town={linkedTown}
                  towns={towns}
                  measurementSystem={measurementSystem}
                  notes={notes}
                  resupplies={resupplies}
                  onAddNote={onAddNote}
                  onDeleteNote={onDeleteNote}
                  onEditNote={onEditNote}
                  onAddResupply={onAddResupply}
                  onDeleteResupply={onDeleteResupply}
                  onEditResupply={onEditResupply}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
