import { useState, useRef } from 'react';
import type { Town, Resupply } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { resizeImageFile } from '../utils/storage';
import { Image as ImageIcon, X } from 'lucide-react';
import { PageSelect } from './PageLayout';

interface QuickAddNoteProps {
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onClose: () => void;
  onAddResupply: (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onAddJournalEntry: (content: string, imageUrl: string | undefined, townId: string) => void;
}

// Notes and journal entries overlap, so adding from here is Resupply or Journal only.
// Existing town notes still show and can be edited from the town panels.
type Tab = 'resupply' | 'journal';

export function QuickAddNote({ towns, onClose, onAddResupply, onAddJournalEntry }: QuickAddNoteProps) {
  const [activeTab, setActiveTab] = useState<Tab>('journal');
  const [selectedTownId, setSelectedTownId] = useState(towns[0]?.id || '');
  const [journalTownId, setJournalTownId] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [resupply, setResupply] = useState({ name: '', hours: '', phone: '', address: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Downscale before storing so photos don't eat the device's storage quota
    resizeImageFile(file)
      .then((result) => {
        setImageUrl(result);
        setImagePreview(result);
      })
      .catch(() => {
        // Fall back to the original file if the browser can't decode it on canvas
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          setImageUrl(result);
          setImagePreview(result);
        };
        reader.readAsDataURL(file);
      });
  };

  const handleSubmit = () => {
    if (activeTab === 'resupply' && selectedTownId && resupply.name.trim()) {
      onAddResupply(selectedTownId, {
        name: resupply.name.trim(),
        hours: resupply.hours.trim() || 'Hours unknown',
        phone: resupply.phone.trim() || 'No phone',
        address: resupply.address.trim(),
      });
      onClose();
    } else if (activeTab === 'journal' && journalTownId && journalContent.trim()) {
      // Every journal entry is tied to a town
      onAddJournalEntry(journalContent.trim(), imageUrl, journalTownId);
      onClose();
    }
  };

  const canSubmit =
    (activeTab === 'resupply' && !!resupply.name.trim() && !!selectedTownId) ||
    (activeTab === 'journal' && !!journalContent.trim() && !!journalTownId);

  // Field styles shared with the Route page controls: blue 2px border, rounded-lg
  const fieldClass =
    'w-full bg-white border-2 border-[#40C8EF] rounded-lg px-4 py-2.5 text-[14px] text-black placeholder:text-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#40C8EF]/40';
  const labelClass = 'block font-display font-medium text-[12px] uppercase tracking-[-0.2px] text-black mb-1.5';

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-sheet-title"
        className="relative w-full max-w-lg bg-white rounded-t-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 bg-[#231F20]/20 rounded-full" />
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-3 w-11 h-11 flex items-center justify-center text-black/60 hover:text-black transition-colors touch-manipulation"
        >
          <X size={22} />
        </button>

        {/* Header: same title, subheadline and switch as the Route page */}
        <div className="flex flex-col items-center gap-1 text-center px-5 pt-4">
          <h2 id="add-sheet-title" className="font-display font-bold text-black text-[20px] tracking-[-0.36px] uppercase">
            {activeTab === 'journal' ? 'New Entry' : 'New Resupply'}
          </h2>
          <p className="text-[13px] text-black/60">
            {activeTab === 'journal' ? 'Write about a town on the route' : 'Add a store, café or service'}
          </p>
        </div>

        <div className="px-5 pt-5">
          <div role="radiogroup" aria-label="What to add" className="relative grid grid-cols-2 border-2 border-[#40C8EF] rounded-lg bg-white overflow-hidden">
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-1/2 bg-[#40C8EF] motion-safe:transition-transform motion-safe:duration-200 ease-out ${
                activeTab === 'journal' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {([
              { key: 'resupply', label: 'Resupply' },
              { key: 'journal', label: 'Journal' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                role="radio"
                aria-checked={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={`relative z-10 px-4 py-2.5 transition-colors ${
                  activeTab === key ? 'text-white' : 'text-[#40C8EF] hover:text-[#00B6EB]'
                }`}
              >
                <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="px-5 pt-5 pb-2 space-y-4 max-h-[52vh] overflow-y-auto">
          {activeTab === 'resupply' ? (
            <>
              <div>
                <span className={labelClass}>Town</span>
                <PageSelect id="add-resupply-town" label="Town" value={selectedTownId} onChange={setSelectedTownId}>
                  {towns.map((town) => (
                    <option key={town.id} value={town.id}>
                      {town.name}, {town.state}
                    </option>
                  ))}
                </PageSelect>
              </div>
              <div>
                <label htmlFor="add-resupply-name" className={labelClass}>Name</label>
                <input
                  id="add-resupply-name"
                  value={resupply.name}
                  onChange={(e) => setResupply((r) => ({ ...r, name: e.target.value }))}
                  placeholder="Ridley's Family Market"
                  className={fieldClass}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="add-resupply-hours" className={labelClass}>Hours</label>
                <input
                  id="add-resupply-hours"
                  value={resupply.hours}
                  onChange={(e) => setResupply((r) => ({ ...r, hours: e.target.value }))}
                  placeholder="Mon–Sat 8am–6pm"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="add-resupply-phone" className={labelClass}>Phone</label>
                <input
                  id="add-resupply-phone"
                  value={resupply.phone}
                  onChange={(e) => setResupply((r) => ({ ...r, phone: e.target.value }))}
                  placeholder="(307) 367-4131"
                  className={fieldClass}
                  type="tel"
                />
              </div>
              <div>
                <label htmlFor="add-resupply-address" className={labelClass}>Address</label>
                <input
                  id="add-resupply-address"
                  value={resupply.address}
                  onChange={(e) => setResupply((r) => ({ ...r, address: e.target.value }))}
                  placeholder="55 S Fremont Ave, Pinedale, WY"
                  className={fieldClass}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <span className={labelClass}>Town</span>
                <PageSelect id="add-journal-town" label="Town" value={journalTownId} onChange={setJournalTownId}>
                  <option value="" disabled>
                    Choose a town
                  </option>
                  {towns.map((town) => (
                    <option key={town.id} value={town.id}>
                      {town.name}, {town.state}
                    </option>
                  ))}
                </PageSelect>
              </div>
              <div>
                <label htmlFor="add-journal-text" className={labelClass}>Entry</label>
                <textarea
                  id="add-journal-text"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="What happened today?"
                  className={`${fieldClass} resize-none leading-relaxed`}
                  rows={5}
                  autoFocus
                />
              </div>
              <div>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Selected photo" className="w-full h-40 object-cover rounded-lg border-2 border-[#40C8EF]" />
                    <button
                      onClick={() => {
                        setImageUrl(undefined);
                        setImagePreview(undefined);
                      }}
                      aria-label="Remove photo"
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 rounded-lg border-2 border-dashed border-[#40C8EF] text-[#40C8EF] flex items-center justify-center gap-2 hover:bg-[#F5FCFF] transition-colors"
                  >
                    <ImageIcon size={16} />
                    <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px]">Add photo</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </>
          )}
        </div>

        {/* Buttons, styled like the main nav */}
        <div className="flex gap-3 px-5 pt-3 pb-6">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-[#40C8EF] bg-white text-[#40C8EF] py-2.5 rounded-lg hover:bg-[#F5FCFF] transition-colors"
          >
            <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 border-2 border-[#40C8EF] bg-[#40C8EF] text-white py-2.5 rounded-lg hover:bg-[#00B6EB] hover:border-[#00B6EB] transition-colors disabled:opacity-40 disabled:hover:bg-[#40C8EF]"
          >
            <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">
              {activeTab === 'journal' ? 'Add entry' : 'Add resupply'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
