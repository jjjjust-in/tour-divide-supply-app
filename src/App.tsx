import { useState, useEffect, useCallback, useRef } from 'react';
import { SimpleRouteMap } from './components/SimpleRouteMap';
import { TownsList } from './components/TownsList';
import { NotesPage } from './components/NotesPage';
import { JournalPage } from './components/JournalPage';
import { QuickAddNote } from './components/QuickAddNote';
import { SplashScreen } from './components/SplashScreen';
import { AboutPage } from './components/AboutPage';
import { Stopwatch } from './components/Stopwatch';
import { towns } from './data/towns';
import { sampleResupplies } from './data/sampleResupplies';
import { sampleJournalEntries } from './data/sampleJournalEntries';
import type { Note, Resupply, JournalEntry } from './types';
import type { MeasurementSystem } from './utils/measurements';
import { inRideOrder, loadDirection, saveDirection, type RideDirection } from './utils/direction';
import { loadCollection, saveCollection, requestPersistentStorage, STORAGE_KEYS } from './utils/storage';
import { loadSession, saveSession, type ActivePage } from './utils/session';
import { Plus, Clock, Check } from 'lucide-react';
import { MapPage } from './components/MapPage';
import { Wordmark } from './components/Wordmark';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import svgPaths from './imports/svg-do3t78tvh5';

export default function App() {
  // Returning riders pick up where they left off; the splash only shows on a first launch
  const [savedSession] = useState(loadSession);
  const [showSplash, setShowSplash] = useState(savedSession === null);
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>(() => {
    const saved = localStorage.getItem('tour-divide-measurement-system');
    if (saved) {
      return saved as MeasurementSystem;
    }
    return 'imperial'; // Default; change it in Settings
  });
  const [selectedTownId] = useState<string | null>(null);
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
  // Exactly one main page is open at a time
  const [activePage, setActivePage] = useState<ActivePage>(savedSession?.page ?? 'route');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  // Page switches slide toward the tapped tab: right for tabs to the right, left for tabs to the left
  const reduceMotion = useReducedMotion();
  const pageOrder: ActivePage[] = ['route', 'towns', 'notes', 'map', 'journal'];
  const prevPageRef = useRef<ActivePage>(activePage);
  const pageDirRef = useRef(1);
  if (prevPageRef.current !== activePage) {
    // Set once per switch so re-renders mid-animation keep the same direction
    pageDirRef.current = pageOrder.indexOf(activePage) > pageOrder.indexOf(prevPageRef.current) ? 1 : -1;
    prevPageRef.current = activePage;
  }
  const pageDir = pageDirRef.current;
  const shift = reduceMotion ? 0 : 28;
  const pageVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * shift }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -shift }),
  };
  const [showAbout, setShowAbout] = useState(false);
  const [showStopwatch, setShowStopwatch] = useState(false);

  // Derived from activePage for backwards compatibility
  const showList = activePage === 'towns';
  const showAllNotes = activePage === 'notes';
  const showJournal = activePage === 'journal';
  const showMap = activePage === 'map';
  const [routeFocusTownId, setRouteFocusTownId] = useState<string | null>(
    savedSession?.page === 'route' ? savedSession.townId : null
  );
  const clearRouteFocus = useCallback(() => setRouteFocusTownId(null), []);
  // Town open on the Itinerary, remembered for next launch
  const [expandedTownId, setExpandedTownId] = useState<string | null>(null);

  useEffect(() => {
    saveSession({ page: activePage, townId: activePage === 'route' ? expandedTownId : null });
  }, [activePage, expandedTownId]);

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

  // Southbound (Banff first) or northbound (Antelope Wells first)
  const [direction, setDirection] = useState<RideDirection>(loadDirection);
  useEffect(() => saveDirection(direction), [direction]);

  // Whether the route map may use GPS; on unless the rider turns it off in Settings
  const [locationEnabled, setLocationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tour-divide-location') !== 'off';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('tour-divide-location', locationEnabled ? 'on' : 'off');
    } catch {
      // not critical
    }
  }, [locationEnabled]);

  // Town panels and lists still speak in "notes"; they now show the
  // journal entries tied to each town.
  const notes: Note[] = journalEntries
    .filter(entry => entry.townId)
    .map(entry => ({ id: entry.id, townId: entry.townId as string, content: entry.content, imageUrl: entry.imageUrl, timestamp: entry.timestamp }));

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

  // Every panel that's scrolled down goes back to the top
  const scrollPageToTop = () => {
    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.scrollTop > 0) el.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  };

  // Brief confirmation in the middle of the screen after something is saved
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1400);
    return () => window.clearTimeout(t);
  }, [toast]);
  const showToast = (message: string) => setToast({ id: Date.now(), message });

  const handleAddResupply = (townId: string, resupply: Omit<Resupply, 'id' | 'townId' | 'timestamp'>) => {
    const newResupply: Resupply = {
      id: `resupply-${Date.now()}-${Math.random()}`,
      townId,
      ...resupply,
      timestamp: Date.now(),
    };
    setResupplies(prev => [...prev, newResupply]);
    showToast('Resupply Saved');
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
    showToast('Journal Entry Saved');
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

  // Opening a town from anywhere: show it expanded in the Itinerary
  const handleTownSelect = (townId: string) => {
    setRouteFocusTownId(townId);
    setActivePage('route');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Main pages: a short slide and fade when switching */}
      <AnimatePresence initial={false} custom={pageDir}>
        <motion.div
          key={activePage}
          custom={pageDir}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
            {activePage === 'route' && (
              <SimpleRouteMap
                towns={towns}
                selectedTownId={selectedTownId}
                onTownSelect={handleTownSelect}
                notesCount={notesCount}
                measurementSystem={measurementSystem}
                direction={direction}
                focusTownId={routeFocusTownId}
                onFocusHandled={clearRouteFocus}
                onExpandedTownChange={setExpandedTownId}
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
                direction={direction}
                towns={towns}
                measurementSystem={measurementSystem}
                locationEnabled={locationEnabled}
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

            {showJournal && (
              <JournalPage
                direction={direction}
                notes={[]}
                journalEntries={journalEntries}
                towns={towns}
                resupplies={resupplies}
                measurementSystem={measurementSystem}
                onDeleteNote={handleDeleteNote}
                onDeleteJournalEntry={handleDeleteJournalEntry}
                onEditNote={handleEditNote}
                onEditJournalEntry={handleEditJournalEntry}
                onTownSelect={handleTownSelect}
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
        </motion.div>
      </AnimatePresence>

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
          {/* The blue fill slides to the tapped tab with the same timing as the page,
              so the button and the page move as one */}
          {([
            { page: 'route', label: 'Itinerary' },
            { page: 'map', label: 'Route' },
            { page: 'journal', label: 'Journal' },
          ] as const).map(({ page, label }) => {
            const active = activePage === page;
            return (
              <motion.button
                key={page}
                onClick={() => setActivePage(page)}
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                className={`relative border-2 border-[#40C8EF] bg-white px-3 md:px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 ${
                  active ? '' : 'hover:bg-[#F5FCFF]'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    aria-hidden="true"
                    className="absolute -inset-[2px] rounded-lg bg-[#40C8EF]"
                    transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span
                  className={`relative uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm transition-colors duration-200 ${
                    active ? 'text-white' : 'text-[#40C8EF]'
                  }`}
                >
                  {label}
                </span>
              </motion.button>
            );
          })}
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
            <Wordmark className="w-[130px] h-auto text-[#40c8ef] shrink-0" />
          </div>
        </div>
      )}

      {showQuickAdd && (
        <AnimatePresence>
          <QuickAddNote
            towns={inRideOrder(towns, direction)}
            measurementSystem={measurementSystem}
            onClose={() => setShowQuickAdd(false)}
            onAddResupply={handleAddResupply}
            onAddJournalEntry={handleAddJournalEntry}
          />
        </AnimatePresence>
      )}

      {/* Saved confirmation: a short popup in the middle of the screen */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
            role="status"
          >
            <div className="flex flex-col items-center gap-3 bg-white border-2 border-[#40C8EF] rounded-2xl px-8 py-6 shadow-[0_6px_24px_rgba(35,31,32,0.18)]">
              <span className="w-12 h-12 rounded-full bg-[#40C8EF] text-white flex items-center justify-center">
                <Check size={26} strokeWidth={3} />
              </span>
              <span className="font-display font-bold uppercase tracking-[-0.36px] text-[16px] text-[#231F20] whitespace-nowrap">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAbout && (
        <AboutPage
          measurementSystem={measurementSystem}
          onChangeMeasurementSystem={setMeasurementSystem}
          direction={direction}
          onChangeDirection={setDirection}
          locationEnabled={locationEnabled}
          onChangeLocationEnabled={setLocationEnabled}
          onClose={() => setShowAbout(false)}
        />
      )}

      {/* Floating Timer Button - Upper Right */}
      {!showSplash && !showStopwatch && (
        <button
          onClick={() => setShowStopwatch(true)}
          className="absolute top-[calc(1rem+var(--sat))] right-4 z-40 bg-[#febc12] text-[#231f20] w-14 h-14 rounded-full hover:bg-[#feca3d] transition-all shadow-lg flex items-center justify-center touch-manipulation"
          aria-label="Ride Timer"
        >
          <Clock size={24} />
        </button>
      )}

      {/* Stopwatch Modal */}
      {showStopwatch && (
        <Stopwatch onClose={() => setShowStopwatch(false)} />
      )}
      {/* Frosted band under the phone's status bar */}
      {!showSplash && (
        <div aria-hidden="true" className="status-blur">
          <span />
          <span />
          <span />
        </div>
      )}

      {/* Tap the status bar to go back to the top, like other iPhone apps. The
          pages scroll inside their own panels, so iOS can't do this by itself. */}
      {!showSplash && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={scrollPageToTop}
          className="fixed top-0 left-0 right-0 z-[45] h-[var(--sat)] cursor-default"
        />
      )}
    </div>
  );
}
