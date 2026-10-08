import { useState, useRef } from 'react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { Town, Resupply } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { resizeImageFile } from '../utils/storage';
import { BookOpen, ShoppingCart, FileText, Image as ImageIcon, X } from 'lucide-react';

interface QuickAddNoteProps {
  towns: Town[];
  measurementSystem: MeasurementSystem;
  onClose: () => void;
  onAddNote: (townId: string, content: string) => void;
  onAddResupply: (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => void;
  onAddJournalEntry: (content: string, imageUrl?: string, townId?: string) => void;
}

type Tab = 'note' | 'resupply' | 'journal';

export function QuickAddNote({ towns, onClose, onAddNote, onAddResupply, onAddJournalEntry }: QuickAddNoteProps) {
  const [activeTab, setActiveTab] = useState<Tab>('note');
  const [selectedTownId, setSelectedTownId] = useState(towns[0]?.id || '');
  const [journalTownId, setJournalTownId] = useState('');
  const [content, setContent] = useState('');
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
    if (activeTab === 'note' && selectedTownId && content.trim()) {
      onAddNote(selectedTownId, content.trim());
      onClose();
    } else if (activeTab === 'resupply' && selectedTownId && resupply.name.trim()) {
      onAddResupply(selectedTownId, {
        name: resupply.name.trim(),
        hours: resupply.hours.trim() || 'Hours unknown',
        phone: resupply.phone.trim() || 'No phone',
        address: resupply.address.trim(),
      });
      onClose();
    } else if (activeTab === 'journal' && journalContent.trim()) {
      onAddJournalEntry(journalContent.trim(), imageUrl, journalTownId || undefined);
      onClose();
    }
  };

  const canSubmit =
    (activeTab === 'note' && !!content.trim() && !!selectedTownId) ||
    (activeTab === 'resupply' && !!resupply.name.trim() && !!selectedTownId) ||
    (activeTab === 'journal' && !!journalContent.trim());

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'note', label: 'Note', icon: <FileText size={13} /> },
    { key: 'resupply', label: 'Resupply', icon: <ShoppingCart size={13} /> },
    { key: 'journal', label: 'Journal', icon: <BookOpen size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="px-4 pt-3 pb-0"
          style={navBgPattern ? { backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px' } : { backgroundColor: '#febc12' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-['Coordinates:Bold',sans-serif] text-base text-[#231F20] uppercase tracking-tight font-bold">Add</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
              <X size={16} className="text-[#231F20]" />
            </button>
          </div>
        </div>

        {/* Tabs — flush against content */}
        <div className="flex px-4 pt-0 -mb-[2px] relative z-10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors rounded-t-lg border-2 mr-1 ${
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

        {/* Content */}
        <div className="mx-4 border-2 border-[#40C8EF] rounded-b-xl rounded-tr-xl overflow-hidden">
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto bg-white">
          {/* Town selector (Note and Resupply) */}
          {(activeTab === 'note' || activeTab === 'resupply') && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Town</label>
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

          {/* Note tab */}
          {activeTab === 'note' && (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What do you want to remember about this town?"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#40C8EF]"
              rows={4}
              autoFocus
            />
          )}

          {/* Resupply tab */}
          {activeTab === 'resupply' && (
            <div className="space-y-2">
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
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Town (optional)</label>
                <select
                  value={journalTownId}
                  onChange={e => setJournalTownId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#40C8EF] bg-white"
                >
                  <option value="">No town</option>
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
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400 flex items-center justify-center gap-2 hover:border-[#40C8EF] hover:text-[#40C8EF] transition-colors"
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
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-xl bg-[#40C8EF] text-white text-sm font-bold disabled:opacity-40 hover:bg-[#00B6EB] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
