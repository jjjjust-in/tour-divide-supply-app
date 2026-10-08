import { useState, useRef } from 'react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { Town, Resupply } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { resizeImageFile } from '../utils/storage';
import { BookOpen, ShoppingCart, Image as ImageIcon, X } from 'lucide-react';

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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'resupply', label: 'Resupply', icon: <ShoppingCart size={13} /> },
    { key: 'journal', label: 'Journal', icon: <BookOpen size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header: handle, title and tabs share one patterned band */}
        <div
          className="rounded-t-2xl"
          style={{ backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px' }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-[#231F20]/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="font-display font-bold text-[16px] text-[#231F20] uppercase tracking-tight">Add</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors touch-manipulation"
            >
              <X size={18} className="text-[#231F20]" />
            </button>
          </div>

          {/* Tabs sit on the band and connect to the content box below */}
          <div className="flex px-4 -mb-[2px] relative z-10">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors rounded-t-lg border-2 mr-1 ${
                  activeTab === tab.key
                    ? 'border-[#40C8EF] border-b-white bg-white text-[#40C8EF]'
                    : 'border-[#40C8EF] bg-[#E6F7FD] text-[#40C8EF]/70 hover:bg-[#d0f0fb]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mx-4 border-2 border-[#40C8EF] rounded-b-xl rounded-tr-xl overflow-hidden">
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto bg-white">
          {/* Town selector (Resupply) */}
          {activeTab === 'resupply' && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Town</label>
              <select
                value={selectedTownId}
                onChange={e => setSelectedTownId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C8EF] bg-white"
              >
                {towns.map(town => (
                  <option key={town.id} value={town.id}>
                    {town.name}, {town.state}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Resupply tab */}
          {activeTab === 'resupply' && (
            <div className="space-y-3">
              <input
                value={resupply.name}
                onChange={e => setResupply(r => ({ ...r, name: e.target.value }))}
                placeholder="Store or service name *"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C8EF]"
                autoFocus
              />
              <input
                value={resupply.hours}
                onChange={e => setResupply(r => ({ ...r, hours: e.target.value }))}
                placeholder="Hours (e.g. Mon–Sat 8am–6pm)"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C8EF]"
              />
              <input
                value={resupply.phone}
                onChange={e => setResupply(r => ({ ...r, phone: e.target.value }))}
                placeholder="Phone number"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C8EF]"
                type="tel"
              />
              <input
                value={resupply.address}
                onChange={e => setResupply(r => ({ ...r, address: e.target.value }))}
                placeholder="Address"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C8EF]"
              />
            </div>
          )}

          {/* Journal tab */}
          {activeTab === 'journal' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Town</label>
                <select
                  value={journalTownId}
                  onChange={e => setJournalTownId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C8EF] bg-white"
                >
                  <option value="" disabled>Choose a town</option>
                  {towns.map(town => (
                    <option key={town.id} value={town.id}>
                      {town.name}, {town.state}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={journalContent}
                onChange={e => setJournalContent(e.target.value)}
                placeholder="Write your journal entry..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#40C8EF]"
                rows={4}
                autoFocus
              />
              {/* Image upload */}
              <div>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                    <button
                      onClick={() => { setImageUrl(undefined); setImagePreview(undefined); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400 flex items-center justify-center gap-2 hover:border-[#40C8EF] hover:text-[#40C8EF] transition-colors"
                  >
                    <ImageIcon size={14} />
                    Add photo
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          )}
        </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-4 pb-6 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-3 rounded-xl bg-[#40C8EF] text-white text-sm font-bold disabled:opacity-40 hover:bg-[#00B6EB] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
