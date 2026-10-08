import { ChevronLeft, Ruler, Download, Upload, Trash2, RotateCcw, Instagram, Globe, ExternalLink } from 'lucide-react';
import { socialLinks } from '../data/social';
import { useState } from 'react';
import type { MeasurementSystem } from '../utils/measurements';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import { sampleResources } from '../data/resources';
import { get, set } from 'idb-keyval';
import { STORAGE_KEYS } from '../utils/storage';

interface AboutPageProps {
  measurementSystem: MeasurementSystem;
  onChangeMeasurementSystem: (system: MeasurementSystem) => void;
  onClose: () => void;
}

export function AboutPage({ measurementSystem, onChangeMeasurementSystem, onClose }: AboutPageProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearTarget, setClearTarget] = useState<'notes' | 'resupplies' | 'all' | null>(null);

  const handleExportData = async () => {
    const [notes, resupplies, journalEntries] = await Promise.all([
      get(STORAGE_KEYS.notes),
      get(STORAGE_KEYS.resupplies),
      get(STORAGE_KEYS.journal),
    ]);
    const measurement = localStorage.getItem('tour-divide-measurement-system') || 'imperial';

    const data = {
      notes: notes ?? [],
      resupplies: resupplies ?? [],
      journalEntries: journalEntries ?? [],
      measurementSystem: measurement,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour-divide-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data.notes)) await set(STORAGE_KEYS.notes, data.notes);
          if (Array.isArray(data.resupplies)) await set(STORAGE_KEYS.resupplies, data.resupplies);
          if (Array.isArray(data.journalEntries)) await set(STORAGE_KEYS.journal, data.journalEntries);
          if (data.measurementSystem) {
            localStorage.setItem('tour-divide-measurement-system', data.measurementSystem);
            onChangeMeasurementSystem(data.measurementSystem);
          }
          alert('Backup imported.');
          window.location.reload();
        } catch {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = (target: 'notes' | 'resupplies' | 'all') => {
    setClearTarget(target);
    setShowClearConfirm(true);
  };

  const confirmClearData = async () => {
    if (clearTarget === 'notes' || clearTarget === 'all') {
      await set(STORAGE_KEYS.notes, []);
    }
    if (clearTarget === 'resupplies' || clearTarget === 'all') {
      await set(STORAGE_KEYS.resupplies, []);
    }
    if (clearTarget === 'all') {
      await set(STORAGE_KEYS.journal, []);
    }
    setShowClearConfirm(false);
    setClearTarget(null);
    window.location.reload();
  };

  const handleDownload = (resource: { fileName?: string }) => {
    alert(`Downloading ${resource.fileName}...\n\nIn production, this would download the GPX file from the server.`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) { const weeks = Math.floor(diffDays / 7); return `${weeks} week${weeks === 1 ? '' : 's'} ago`; }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const gpxFiles = sampleResources.filter(r => r.type === 'gpx');
  const rerouteResources = sampleResources.filter(r => r.type === 'reroute');

  return (
    <div className="fixed inset-0 z-50 bg-[#E6F7FD] flex flex-col">
      {/* Sticky header */}
      <div
        className="flex-shrink-0 sticky top-0 z-20 shadow-sm"
        style={{
          backgroundImage: `url(${navBgPattern})`,
          backgroundSize: '300px 300px',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4 border-b-2 border-[#40C8EF]">
          <button
            onClick={onClose}
            className="p-3 bg-white/90 hover:bg-white text-[#40C8EF] transition-all shadow-lg flex items-center justify-center border-2 border-white rounded-full touch-manipulation min-w-[44px] min-h-[44px] shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-[#40C8EF] uppercase font-display font-bold tracking-[-0.36px] text-lg md:text-xl flex-1">
            Settings & About
          </h1>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Background pattern layer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url(${navBgPattern})`,
            backgroundSize: '300px 300px',
            backgroundPosition: 'center'
          }}
        />

        <div className="box-border flex flex-col gap-[20px] items-center justify-start px-[20px] md:px-[85px] py-[40px] relative z-[1] max-w-[600px] mx-auto w-full pb-[80px]">

          {/* About Section */}
          <div className="w-full">
            <div className="space-y-5 text-[#1a1a1a] pr-8">
              <p className="font-display font-bold text-[18px] leading-[1.4] tracking-[-0.01em]">
                <span className="uppercase tracking-[0.02em]">Tour Divide Supply</span> is built by{' '}
                <span className="text-[#40C8EF]">JJJJustin</span>,
                a bikepacker and product designer with over 5,000 miles on the Tour Divide route.
              </p>
              <p className="text-[16px] leading-relaxed">
                After planning and riding the 2,745 miles from Canada to Mexico, Justin built this app to help
                future riders organize their notes and track resupply points. It isn&apos;t a replacement for
                RideWithGPS or your Garmin. It&apos;s a starting place to fill with your own notes and memories.
              </p>
              <p className="text-[16px] leading-relaxed">
                The app features interactive maps, elevation profiles, and a collaborative notes system where riders can
                document their experiences at each town along the route. All data is stored locally in your browser for
                offline access during your ride.
              </p>
            </div>
          </div>

          {/* Social Section */}
          <div className="w-full">
            <div className="flex gap-[10px] items-center justify-center pb-[12px]">
              <p className="font-display font-bold text-[#40c8ef] text-[18px] tracking-[-0.36px] uppercase whitespace-nowrap">
                Social
              </p>
            </div>
            <div className="bg-white relative w-full">
              <div aria-hidden="true" className="absolute border border-[#40c8ef] inset-0 pointer-events-none" />
              <ul className="divide-y divide-[#40C8EF]/30">
                {socialLinks.map((link) => {
                  const Icon = link.platform === 'instagram' ? Instagram : Globe;
                  const content = (
                    <>
                      <Icon size={18} className="text-[#40C8EF] shrink-0" />
                      <span className="font-display font-medium text-[12px] uppercase tracking-tight text-[#231f20] w-[84px] shrink-0">
                        {link.label}
                      </span>
                      <span className={`flex-1 min-w-0 truncate text-[13px] ${link.url ? 'text-[#231f20]' : 'text-[#231f20]/40 italic'}`}>
                        {link.url ? (link.handle || link.url) : 'Link coming soon'}
                      </span>
                      {link.url && <ExternalLink size={14} className="text-[#40C8EF] shrink-0" />}
                    </>
                  );
                  return (
                    <li key={link.platform}>
                      {link.url ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-6 py-4 hover:bg-[#F5FCFF] transition-colors touch-manipulation"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-center gap-3 px-6 py-4">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Resources Section */}
          <div className="w-full">
            <div className="flex gap-[10px] items-center justify-center pb-[12px]">
              <p className="font-display font-bold text-[#40c8ef] text-[18px] tracking-[-0.36px] uppercase whitespace-nowrap">
                Resources
              </p>
            </div>
            <div className="space-y-4">
              {/* Current GPX downloads, one per route */}
              <div className="bg-white relative w-full">
                <div aria-hidden="true" className="absolute border border-[#40c8ef] inset-0 pointer-events-none" />
                <ul className="divide-y divide-[#40C8EF]/30">
                  {gpxFiles.map((resource) => (
                    <li key={resource.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-medium text-[13px] uppercase tracking-tight text-[#231f20]">
                          {resource.title}
                        </p>
                        <p className="text-[13px] text-[#231f20]/70 mt-1">{resource.description}</p>
                        <p className="text-[12px] text-[#231f20]/50 mt-1">
                          {resource.fileName} · {resource.fileSize} · Updated {formatDate(resource.timestamp).replace(/^(Today|Yesterday)$/, (m) => m.toLowerCase())}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(resource)}
                        aria-label={`Download ${resource.title} GPX`}
                        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-[#40C8EF] text-white hover:bg-[#00B6EB] transition-colors touch-manipulation"
                      >
                        <Download size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active reroutes, always red */}
              {rerouteResources.map((resource) => (
                <div key={resource.id} className="border-2 border-[#EF4444] bg-[#FEF2F2] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-bold text-[#231f20] text-base">{resource.title}</h3>
                    <span className="bg-[#EF4444] text-white text-xs px-2 py-1 rounded uppercase font-display font-medium tracking-tight shrink-0">
                      Reroute
                    </span>
                  </div>
                  <p className="text-sm text-[#231f20]/80 mt-3 leading-relaxed">{resource.description}</p>
                  <div className="text-xs text-[#231f20]/50 mt-3">{formatDate(resource.timestamp)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Section */}
          <div className="w-full">
            <div className="flex gap-[10px] items-center justify-center pb-[12px]">
              <p className="font-display font-bold text-[#40c8ef] text-[18px] tracking-[-0.36px] uppercase whitespace-nowrap">
                Settings
              </p>
            </div>
            <div className="bg-white relative w-full">
              <div aria-hidden="true" className="absolute border border-[#40c8ef] inset-0 pointer-events-none" />
              <div className="p-6 space-y-8">

                {/* Measurement System */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Ruler size={16} className="text-[#40C8EF]" />
                    <h3 className="uppercase font-display font-bold tracking-[-0.36px] text-[#40C8EF] text-sm">
                      Measurement System
                    </h3>
                  </div>
                  <div className="flex bg-white border-2 border-[#40C8EF] rounded-lg overflow-hidden">
                    <button
                      onClick={() => onChangeMeasurementSystem('imperial')}
                      className={`flex-1 py-3.5 px-4 transition-all touch-manipulation ${
                        measurementSystem === 'imperial'
                          ? 'bg-[#40C8EF] text-white'
                          : 'bg-gray-100 text-[#999] hover:bg-[#F5FCFF]'
                      }`}
                    >
                      <div className="text-sm uppercase font-display font-medium tracking-[-0.36px]">Imperial</div>
                      <div className="text-xs opacity-80">Miles & Feet</div>
                    </button>
                    <div className="w-px bg-[#40C8EF]" />
                    <button
                      onClick={() => onChangeMeasurementSystem('metric')}
                      className={`flex-1 py-3.5 px-4 transition-all touch-manipulation ${
                        measurementSystem === 'metric'
                          ? 'bg-[#40C8EF] text-white'
                          : 'bg-gray-100 text-[#999] hover:bg-[#F5FCFF]'
                      }`}
                    >
                      <div className="text-sm uppercase font-display font-medium tracking-[-0.36px]">Metric</div>
                      <div className="text-xs opacity-80">Km & Meters</div>
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="space-y-4 pt-3 border-t border-[#40C8EF]/20">
                  <div className="flex items-center gap-2">
                    <Download size={16} className="text-[#40C8EF]" />
                    <h3 className="uppercase font-display font-bold tracking-[-0.36px] text-[#40C8EF] text-sm">
                      Data Management
                    </h3>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="w-full py-3.5 px-4 rounded-lg border-2 border-[#40C8EF] text-[#40C8EF] hover:bg-[#F5FCFF] transition-all flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <Download size={16} />
                    <span className="text-sm uppercase font-display font-medium tracking-[-0.36px]">Export All Data</span>
                  </button>
                  <button
                    onClick={handleImportData}
                    className="w-full py-3.5 px-4 rounded-lg border-2 border-[#40C8EF] text-[#40C8EF] hover:bg-[#F5FCFF] transition-all flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <Upload size={16} />
                    <span className="text-sm uppercase font-display font-medium tracking-[-0.36px]">Import Data</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Backup your notes and resupplies to restore them later or on another device
                  </p>
                </div>

                {/* Clear Data */}
                <div className="space-y-4 pt-3 border-t border-[#40C8EF]/20">
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-[#FF6B35]" />
                    <h3 className="uppercase font-display font-bold tracking-[-0.36px] text-[#FF6B35] text-sm">
                      Clear Data
                    </h3>
                  </div>
                  <button
                    onClick={() => handleClearData('notes')}
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 touch-manipulation text-sm"
                  >
                    <Trash2 size={14} />
                    Clear All Notes
                  </button>
                  <button
                    onClick={() => handleClearData('resupplies')}
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 touch-manipulation text-sm"
                  >
                    <Trash2 size={14} />
                    Clear All Resupplies
                  </button>
                  <button
                    onClick={() => handleClearData('all')}
                    className="w-full py-3 px-4 rounded-lg border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-all flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <RotateCcw size={14} />
                    <span className="text-sm uppercase font-display font-medium tracking-[-0.36px]">Reset All Data</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    ⚠️ This action cannot be undone. ⚠️<br />Export your data first!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border-4 border-[#FF6B35] shadow-2xl">
            <h3 className="text-xl mb-5 uppercase font-display font-bold tracking-[-0.36px] text-[#FF6B35]">
              Confirm Delete
            </h3>
            <p className="text-gray-700 mb-8">
              Are you sure you want to clear {clearTarget === 'all' ? 'all your data' : `all ${clearTarget}`}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowClearConfirm(false); setClearTarget(null); }}
                className="flex-1 py-3.5 px-4 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearData}
                className="flex-1 py-3.5 px-4 rounded-lg bg-[#FF6B35] text-white hover:bg-[#E55A25] transition-all touch-manipulation uppercase font-display font-medium tracking-[-0.36px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
