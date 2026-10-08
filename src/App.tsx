import { useState, useEffect, useCallback } from 'react';
import { SimpleRouteMap } from './components/SimpleRouteMap';
import { NotesPanel } from './components/NotesPanel';
import { TownsList } from './components/TownsList';
import { NotesPage } from './components/NotesPage';
import { JournalPage } from './components/JournalPage';
import { QuickAddNote } from './components/QuickAddNote';
import { SplashScreen } from './components/SplashScreen';
import { AboutPage } from './components/AboutPage';
import { Stopwatch } from './components/Stopwatch';
import { MeasurementSelector } from './components/MeasurementSelector';
import { towns } from './data/towns';
import { sampleResupplies } from './data/sampleResupplies';
import { sampleJournalEntries } from './data/sampleJournalEntries';
import type { Note, Resupply, JournalEntry } from './types';
import type { MeasurementSystem } from './utils/measurements';
import { loadCollection, saveCollection, requestPersistentStorage, STORAGE_KEYS } from './utils/storage';
import { Plus, Clock, BookOpen, ListOrdered, MapIcon } from 'lucide-react';
import { MapPage } from './components/MapPage';
import { AnimatePresence } from 'motion/react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import svgPaths from './imports/svg-do3t78tvh5';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showMeasurementSelector, setShowMeasurementSelector] = useState(false);
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>(() => {
    const saved = localStorage.getItem('tour-divide-measurement-system');
    if (saved) {
      return saved as MeasurementSystem;
    }
    return 'imperial'; // Default, will show selector on first load
  });
  const [selectedTownId, setSelectedTownId] = useState<string | null>(null);
  // Saved data loads asynchronously from IndexedDB. Sample data is only
  // used on a true first launch, so clearing your data stays cleared.
  const [resupplies, setResupplies] = useState<Resupply[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [legacyNotes, r, j] = await Promise.all([
        loadCollection<Note>(STORAGE_KEYS.notes, []),
        loadCollection<Resupply>(STORAGE_KEYS.resupplies, sampleResupplies),
        loadCollection<JournalEntry>(STORAGE_KEYS.journal, sampleJournalEntries),
      ]);
      if (cancelled) return;
      // Town notes are now journal entries. Fold any saved notes into the
      // journal once, keeping their town and date, then empty the old store.
      let journal = j;
      if (legacyNotes.length > 0) {
        const existing = new Set(j.map(e => e.id));
        const converted: JournalEntry[] = legacyNotes
          .filter(note => !existing.has(note.id))
          .map(note => ({ id: note.id, townId: note.townId, content: note.content, timestamp: note.timestamp }));
        journal = [...j, ...converted];
        await saveCollection(STORAGE_KEYS.journal, journal);
        await saveCollection(STORAGE_KEYS.notes, []);
      }
      setResupplies(r);
      setJournalEntries(journal);
      setDataLoaded(true);
    })();
    requestPersistentStorage();
    return () => { cancelled = true; };
  }, []);
  // Single active page — enforces one-page-at-a-time
  type ActivePage = 'route' | 'map' | 'journal' | 'towns' | 'notes' | null;
  const [activePage, setActivePage] = useState<ActivePage>('route');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showStopwatch, setShowStopwatch] = useState(false);

  // Derived from activePage for backwards compatibility
  const showRoute = activePage === 'route';
  const showList = activePage === 'towns';
  const showAllNotes = activePage === 'notes';
  const showJournal = activePage === 'journal';
  const showMap = activePage === 'map';
  const [routeFocusTownId, setRouteFocusTownId] = useState<string | null>(null);
  const clearRouteFocus = useCallback(() => setRouteFocusTownId(null), []);

  // Check if this is first time opening the app
  useEffect(() => {
    const hasSeenMeasurementSelector = localStorage.getItem('tour-divide-measurement-system');
    if (!hasSeenMeasurementSelector) {
      // Wait for splash screen to finish, then show measurement selector
      const timer = setTimeout(() => {
        setShowMeasurementSelector(true);
      }, 2500); // Match splash screen duration
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist changes, but never before the initial load finishes
  // (otherwise the empty starting arrays would overwrite saved data).
  useEffect(() => {
    if (dataLoaded) saveCollection(STORAGE_KEYS.resupplies, resupplies);
  }, [resupplies, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) saveCollection(STORAGE_KEYS.journal, journalEntries);
  }, [journalEntries, dataLoaded]);

  useEffect(() => {
    localStorage.setItem('tour-divide-measurement-system', measurementSystem);
  }, [measurementSystem]);

  const selectedTown = towns.find(t => t.id === selectedTownId) || null;

  // Town panels and lists still speak in "notes"; they now show the
  // journal entries tied to each town.
  const notes: Note[] = journalEntries
    .filter(entry => entry.townId)
    .map(entry => ({ id: entry.id, townId: entry.townId as string, content: entry.content, timestamp: entry.timestamp }));

  const notesCount = notes.reduce((acc, note) => {
    acc[note.townId] = (acc[note.townId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAddNote = (townId: string, content: string) => {
    handleAddJournalEntry(content, undefined, townId);
  };

  const handleDeleteNote = (entryId: string) => {
    handleDeleteJournalEntry(entryId);
  };

  const handleEditNote = (entryId: string, content: string) => {
    setJournalEntries(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, content, timestamp: Date.now() } : entry
    ));
  };

  const handleAddResupply = (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => {
    const newResupply: Resupply = {
      id: `resupply-${Date.now()}-${Math.random()}`,
      townId,
      ...resupply,
      timestamp: Date.now(),
    };
    setResupplies(prev => [...prev, newResupply]);
  };

  const handleDeleteResupply = (resupplyId: string) => {
    if (window.confirm('Are you sure you want to delete this resupply? This action cannot be undone.')) {
      setResupplies(prev => prev.filter(r => r.id !== resupplyId));
    }
  };

  const handleEditResupply = (resupplyId: string, updatedResupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => {
    setResupplies(prev => prev.map(resupply =>
      resupply.id === resupplyId
        ? { ...resupply, ...updatedResupply, timestamp: Date.now() }
        : resupply
    ));
  };

  const handleAddJournalEntry = (content: string, imageUrl: string | undefined, townId: string) => {
    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}-${Math.random()}`,
      content,
      timestamp: Date.now(),
      imageUrl,
      townId,
    };
    setJournalEntries(prev => [...prev, newEntry]);
  };

  const handleDeleteJournalEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      setJournalEntries(prev => prev.filter(e => e.id !== entryId));
    }
  };

  const handleEditJournalEntry = (entryId: string, content: string, imageUrl?: string) => {
    setJournalEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, content, imageUrl, timestamp: Date.now() }
        : entry
    ));
  };

  const handleTownSelect = (townId: string) => {
    setSelectedTownId(townId);
    setActivePage('route');
  };

  const handleClosePanel = () => {
    setSelectedTownId(null);
  };

  const handleMeasurementSelect = (system: MeasurementSystem) => {
    setMeasurementSystem(system);
    setShowMeasurementSelector(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {showMeasurementSelector && (
        <MeasurementSelector onSelect={handleMeasurementSelect} />
      )}

      {activePage === 'route' && (
        <SimpleRouteMap
          towns={towns}
          selectedTownId={selectedTownId}
          onTownSelect={handleTownSelect}
          notesCount={notesCount}
          measurementSystem={measurementSystem}
          focusTownId={routeFocusTownId}
          onFocusHandled={clearRouteFocus}
          onClose={undefined}
          onOpenTimer={() => setShowStopwatch(true)}
          notes={notes}
          resupplies={resupplies}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onEditNote={handleEditNote}
          onAddResupply={handleAddResupply}
          onDeleteResupply={handleDeleteResupply}
          onEditResupply={handleEditResupply}
        />
      )}

      {showMap && (
        <MapPage
          towns={towns}
          measurementSystem={measurementSystem}
          onOpenTown={(townId) => {
            setRouteFocusTownId(townId);
            setActivePage('route');
          }}
        />
      )}

      {showList && (
        <TownsList
          towns={towns}
          notes={notes}
          resupplies={resupplies}
          notesCount={notesCount}
          measurementSystem={measurementSystem}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onEditNote={handleEditNote}
          onAddResupply={handleAddResupply}
          onDeleteResupply={handleDeleteResupply}
          onEditResupply={handleEditResupply}
          onClose={() => setActivePage('route')}
          onOpenTimer={() => setShowStopwatch(true)}
        />
      )}

      {/* Bottom Navigation - Hidden on splash, always visible elsewhere */}
      {!showSplash && (
        <div
          className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto z-50 flex flex-col gap-4 px-3 py-[18px] md:px-2 md:py-[18px] md:rounded-xl items-center md:items-start border-t-2 border-[#40C8EF] md:border-t-0"
          style={{
            backgroundImage: `url(${navBgPattern})`,
            backgroundSize: '300px 300px',
            backgroundPosition: 'center'
          }}
        >
          <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => setActivePage('route')}
            className={`border-2 px-3 md:px-4 py-2.5 rounded-lg transition-all shadow-lg flex items-center gap-2 ${
              showRoute
                ? 'bg-[#40C8EF] text-white border-[#40C8EF]'
                : 'bg-white text-[#40C8EF] border-[#40C8EF] hover:bg-[#F5FCFF]'
            }`}
            aria-label="Itinerary"
          >
            <ListOrdered size={16} className={showRoute ? 'text-white' : 'text-[#40C8EF]'} />
            <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">
              Itinerary
            </span>
          </button>
          <button
            onClick={() => setActivePage('map')}
            className={`border-2 px-3 md:px-4 py-2.5 rounded-lg transition-all shadow-lg flex items-center gap-2 ${
              showMap
                ? 'bg-[#40C8EF] text-white border-[#40C8EF]'
                : 'bg-white text-[#40C8EF] border-[#40C8EF] hover:bg-[#F5FCFF]'
            }`}
            aria-label="Route"
          >
            <MapIcon size={16} className={showMap ? 'text-white' : 'text-[#40C8EF]'} />
            <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">
              Route
            </span>
          </button>
          <button
            onClick={() => setActivePage('journal')}
            className={`border-2 px-3 md:px-4 py-2.5 rounded-lg transition-all shadow-lg flex items-center gap-2 ${
              showJournal
                ? 'bg-[#40C8EF] text-white border-[#40C8EF]'
                : 'bg-white text-[#40C8EF] border-[#40C8EF] hover:bg-[#F5FCFF]'
            }`}
            aria-label="Journal"
          >
            <BookOpen size={16} className={showJournal ? 'text-white' : 'text-[#40C8EF]'} />
            <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">
              Journal
            </span>
          </button>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="bg-[#40C8EF] text-white p-3 md:p-3.5 rounded-lg hover:bg-[#00B6EB] transition-all shadow-lg flex items-center justify-center"
            aria-label="Add"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
          </div>

          {/* Logo Lockup - 150% size */}
          <div
            className="content-stretch flex gap-[3.06px] items-center relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowAbout(true)}
          >
            <div className="h-[22px] relative shrink-0 w-[22px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path d={svgPaths.pee90000} fill="var(--fill-0, #40C8EF)" />
              </svg>
            </div>
            <p className="font-display font-medium leading-[normal] not-italic relative shrink-0 text-[#40c8ef] text-[11px] text-nowrap tracking-[-0.22px] uppercase whitespace-pre">
              tourdividesupp<span className="tracking-[-1.37px]">l</span>
              <span className="tracking-[-2.64px]">y</span>
              <span className="tracking-[-1.56px]">.</span>com
            </p>
          </div>
        </div>
      )}

      {selectedTown && (
        <NotesPanel
          selectedTown={selectedTown}
          notes={notes}
          resupplies={resupplies}
          measurementSystem={measurementSystem}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onEditNote={handleEditNote}
          onAddResupply={handleAddResupply}
          onDeleteResupply={handleDeleteResupply}
          onEditResupply={handleEditResupply}
          onClose={handleClosePanel}
          onNavigateToTown={() => setActivePage('towns')}
        />
      )}

      {showAllNotes && (
        <NotesPage
          notes={notes}
          resupplies={resupplies}
          towns={towns}
          measurementSystem={measurementSystem}
          onDeleteNote={handleDeleteNote}
          onDeleteResupply={handleDeleteResupply}
          onEditNote={handleEditNote}
          onEditResupply={handleEditResupply}
          onTownSelect={handleTownSelect}
          onOpenTimer={() => setShowStopwatch(true)}
        />
      )}

      {showQuickAdd && (
        <AnimatePresence>
          <QuickAddNote
            towns={towns}
            measurementSystem={measurementSystem}
            onClose={() => setShowQuickAdd(false)}
            onAddResupply={handleAddResupply}
            onAddJournalEntry={handleAddJournalEntry}
          />
        </AnimatePresence>
      )}

      {showAbout && (
        <AboutPage
          measurementSystem={measurementSystem}
          onChangeMeasurementSystem={setMeasurementSystem}
          onClose={() => setShowAbout(false)}
        />
      )}

      {showJournal && (
        <JournalPage
          notes={[]}
          journalEntries={journalEntries}
          towns={towns}
          measurementSystem={measurementSystem}
          onDeleteNote={handleDeleteNote}
          onDeleteJournalEntry={handleDeleteJournalEntry}
          onEditNote={handleEditNote}
          onEditJournalEntry={handleEditJournalEntry}
          onTownSelect={handleTownSelect}
          onClose={() => setActivePage(null)}
        />
      )}

      {/* Floating Timer Button - Upper Right */}
      {!showSplash && !showStopwatch && (
        <button
          onClick={() => setShowStopwatch(true)}
          className="absolute top-4 right-4 z-40 bg-[#febc12] text-[#231f20] w-14 h-14 rounded-full hover:bg-[#feca3d] transition-all shadow-lg flex items-center justify-center touch-manipulation"
          aria-label="Ride Timer"
        >
          <Clock size={24} />
        </button>
      )}

      {/* Stopwatch Modal */}
      {showStopwatch && (
        <Stopwatch onClose={() => setShowStopwatch(false)} />
      )}
    </div>
  );
}
