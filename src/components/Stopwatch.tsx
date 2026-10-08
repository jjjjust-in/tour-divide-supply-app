import { useState, useEffect } from 'react';
import { X, Flag, Download } from 'lucide-react';

interface StopwatchProps {
  onClose: () => void;
}

interface Lap {
  title: string;
  time: number;
  recordedAt: number;
}

interface SavedTimer {
  id: string;
  title: string;
  time: number;
  savedAt: number;
  type: 'finish' | 'scratch';
  laps: Lap[];
}

function getSecondFridayInJune(year: number): Date {
  let fridayCount = 0;
  for (let day = 1; day <= 30; day++) {
    const date = new Date(year, 5, day);
    if (date.getDay() === 5) {
      fridayCount++;
      if (fridayCount === 2) {
        return new Date(year, 5, day, 0, 0, 0, 0);
      }
    }
  }
  return new Date(year, 5, 8);
}

// Small confirmation dialog in the same style: centered title, line of text, two buttons
function Dialog({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
  <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label={title}>
    <div className="bg-white rounded-2xl w-full max-w-sm px-5 pt-6 pb-5 shadow-2xl">
      <h3 className="font-display font-bold text-black text-[20px] tracking-[-0.36px] uppercase text-center">{title}</h3>
      {text && <p className="text-[13px] text-black/60 text-center mt-1">{text}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  </div>
);
}

export function Stopwatch({ onClose }: StopwatchProps) {
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>(() => {
    const saved = localStorage.getItem('saved-timers');
    return saved ? JSON.parse(saved) : [];
  });
  const [showLapDialog, setShowLapDialog] = useState(false);
  const [lapTitle, setLapTitle] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showScratchDialog, setShowScratchDialog] = useState(false);
  const [scratchTitle, setScratchTitle] = useState('');
  const [currentLaps, setCurrentLaps] = useState<Lap[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  let targetDate = getSecondFridayInJune(currentYear);
  if (now.getTime() > targetDate.getTime()) {
    targetDate = getSecondFridayInJune(currentYear + 1);
  }

  useEffect(() => {
    const saved = localStorage.getItem('stopwatch');
    if (saved) {
      const { startTime: savedStart, elapsedTime: savedElapsed, isRunning: savedRunning, mode: savedMode } = JSON.parse(saved);
      if (savedMode) setMode(savedMode);
      if (savedRunning && savedStart) {
        setStartTime(savedStart);
        setIsRunning(true);
        setElapsedTime(savedElapsed + (Date.now() - savedStart));
      } else {
        setElapsedTime(savedElapsed);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stopwatch', JSON.stringify({ startTime, elapsedTime, isRunning, mode }));
  }, [startTime, elapsedTime, isRunning, mode]);

  useEffect(() => {
    let interval: number;
    if (mode === 'countdown') {
      interval = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    } else if (isRunning && startTime) {
      interval = window.setInterval(() => setElapsedTime(Date.now() - startTime), 100);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [mode, isRunning, startTime]);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now - elapsedTime);
    setIsRunning(true);
  };

  const handleReset = (skipConfirmation = false) => {
    if (skipConfirmation) {
      setStartTime(null);
      setElapsedTime(0);
      setIsRunning(false);
    } else {
      setShowResetDialog(true);
    }
  };

  const confirmReset = () => {
    setStartTime(null);
    setElapsedTime(0);
    setIsRunning(false);
    setCurrentLaps([]);
    setShowResetDialog(false);
  };

  const handleSaveLap = () => {
    if (lapTitle.trim()) {
      const newLap: Lap = { title: lapTitle.trim(), time: elapsedTime, recordedAt: Date.now() };
      setCurrentLaps([...currentLaps, newLap]);
      setLapTitle('');
      setShowLapDialog(false);
      setConfirmationMessage(`State recorded: ${lapTitle.trim()}`);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    }
  };

  const handleSaveScratch = () => {
    if (scratchTitle.trim() && elapsedTime > 0) {
      const newTimer: SavedTimer = {
        id: `timer-${Date.now()}`,
        title: scratchTitle.trim(),
        time: elapsedTime,
        savedAt: Date.now(),
        type: 'scratch',
        laps: currentLaps
      };
      const updated = [...savedTimers, newTimer];
      setSavedTimers(updated);
      localStorage.setItem('saved-timers', JSON.stringify(updated));
      setScratchTitle('');
      setShowScratchDialog(false);
      setCurrentLaps([]);
      handleReset(true);
    }
  };

  const handleSaveTimer = () => {
    if (saveTitle.trim() && elapsedTime > 0) {
      const newTimer: SavedTimer = {
        id: `timer-${Date.now()}`,
        title: saveTitle.trim(),
        time: elapsedTime,
        savedAt: Date.now(),
        type: 'finish',
        laps: currentLaps
      };
      const updated = [...savedTimers, newTimer];
      setSavedTimers(updated);
      localStorage.setItem('saved-timers', JSON.stringify(updated));
      setSaveTitle('');
      setShowSaveDialog(false);
      setCurrentLaps([]);
      handleReset(true);
    }
  };

  const handleDeleteTimer = (id: string) => {
    const updated = savedTimers.filter(t => t.id !== id);
    setSavedTimers(updated);
    localStorage.setItem('saved-timers', JSON.stringify(updated));
  };

  const handleDownloadTimer = (timer: SavedTimer) => {
    const t = formatTime(timer.time);
    let content = `===============================================\n`;
    content += `${timer.type.toUpperCase()}: ${timer.title}\n`;
    content += `===============================================\n\n`;
    content += `Total Time: ${t.days}d ${t.hours}h ${t.minutes}m ${t.seconds}s\n`;
    content += `Date: ${new Date(timer.savedAt).toLocaleString()}\n\n`;
    if (timer.laps?.length > 0) {
      content += `STATE SPLITS (${timer.laps.length} total)\n\n`;
      timer.laps.forEach((lap, i) => {
        const lt = formatTime(lap.time);
        content += `${i + 1}. ${lap.title}\n   Time: ${lt.days}d ${lt.hours}h ${lt.minutes}m ${lt.seconds}s\n\n`;
      });
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour-divide-${timer.type}-${timer.title.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  let time, modeTitle, infoMessage;
  if (mode === 'countdown') {
    time = formatTime(targetDate.getTime() - currentTime);
    modeTitle = 'Countdown';
    infoMessage = `Tour Divide starts ${targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
  } else {
    time = formatTime(elapsedTime);
    modeTitle = 'Ride Timer';
    infoMessage = isRunning ? 'Running' : elapsedTime === 0 ? 'Tap Start when you roll out' : 'Paused';
  }

  // Shared button styles, matching the main nav and the Add sheet
  const btnLabel = 'uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm';
  const btnFilled = 'w-full border-2 border-[#40C8EF] bg-[#40C8EF] text-white py-2.5 rounded-lg hover:bg-[#00B6EB] hover:border-[#00B6EB] transition-colors disabled:opacity-40';
  const btnOutline = 'w-full border-2 border-[#40C8EF] bg-white text-[#40C8EF] py-2.5 rounded-lg hover:bg-[#F5FCFF] transition-colors';
  const btnDanger = 'w-full border-2 border-[#FF6B35] bg-white text-[#FF6B35] py-2.5 rounded-lg hover:bg-[#FFF4EF] transition-colors';
  const btnDangerFilled = 'w-full border-2 border-[#FF6B35] bg-[#FF6B35] text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40';
  const fieldClass = 'w-full bg-white border-2 border-[#40C8EF] rounded-lg px-4 py-2.5 text-[14px] text-black placeholder:text-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#40C8EF]/40';


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="timer-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 w-11 h-11 flex items-center justify-center text-black/60 hover:text-black transition-colors touch-manipulation"
        >
          <X size={22} />
        </button>

        {/* Header: same title, subheadline and switch as the Route page */}
        <div className="flex flex-col items-center gap-1 text-center px-12 pt-6">
          <h2 id="timer-title" className="font-display font-bold text-black text-[20px] tracking-[-0.36px] uppercase">{modeTitle}</h2>
          <p className="text-[13px] text-black/60">{infoMessage}</p>
        </div>

        <div className="px-5 pt-5">
          <div role="radiogroup" aria-label="Timer mode" className="relative grid grid-cols-2 border-2 border-[#40C8EF] rounded-lg bg-white overflow-hidden">
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-1/2 bg-[#40C8EF] motion-safe:transition-transform motion-safe:duration-200 ease-out ${
                mode === 'stopwatch' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {([
              { key: 'countdown', label: 'Countdown' },
              { key: 'stopwatch', label: 'Stopwatch' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                role="radio"
                aria-checked={mode === key}
                onClick={() => setMode(key)}
                className={`relative z-10 px-4 py-2.5 transition-colors ${mode === key ? 'text-white' : 'text-[#40C8EF] hover:text-[#00B6EB]'}`}
              >
                <span className={btnLabel}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="px-5 pt-6">
          <div className="grid grid-cols-4 gap-2.5" aria-live="off">
            {[{ label: 'Days', val: time.days }, { label: 'Hours', val: time.hours }, { label: 'Min', val: time.minutes }, { label: 'Sec', val: time.seconds }].map(({ label, val }) => (
              <div key={label} className="text-center">
                <div className="border-2 border-[#40C8EF] rounded-lg py-3 flex items-center justify-center">
                  <span className="font-display font-bold text-[26px] leading-none text-black tabular-nums">{String(val).padStart(2, '0')}</span>
                </div>
                <div className="mt-1.5 font-display font-medium text-[11px] uppercase tracking-[0.02em] text-black/60">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {mode === 'stopwatch' && (
          <div className="px-5 pt-6 space-y-4">
            {!isRunning ? (
              <button onClick={handleStart} className={btnFilled}>
                <span className={btnLabel}>{elapsedTime > 0 ? 'Resume' : 'Start'}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowLapDialog(true)} className={btnOutline}>
                    <span className={btnLabel}>Record state</span>
                  </button>
                  <button onClick={() => setShowScratchDialog(true)} className={btnDanger}>
                    <span className={btnLabel}>Scratch</span>
                  </button>
                </div>
                <button onClick={() => setShowSaveDialog(true)} className={btnFilled}>
                  <span className={btnLabel}>Finish</span>
                </button>
              </div>
            )}
            {(isRunning || elapsedTime > 0) && (
              <button onClick={() => handleReset()} className="w-full py-1.5 text-black/50 hover:text-black transition-colors">
                <span className={btnLabel}>Reset</span>
              </button>
            )}

            {currentLaps.length > 0 && (
              <div>
                <h4 className="font-display font-medium text-[12px] uppercase tracking-[-0.2px] text-black mb-1.5">
                  States this ride · {currentLaps.length}
                </h4>
                <ul className="border-2 border-[#40C8EF] rounded-lg divide-y divide-[#40C8EF]/30 max-h-48 overflow-y-auto">
                  {currentLaps.map((lap, i) => {
                    const lt = formatTime(lap.time);
                    return (
                      <li key={i} className="flex justify-between items-center px-4 py-2.5 text-[13px]">
                        <span className="font-display font-medium uppercase text-black">{lap.title}</span>
                        <span className="text-black/60 tabular-nums">{lt.days}d {lt.hours}h {lt.minutes}m</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {savedTimers.length > 0 && (
              <div>
                <h4 className="font-display font-medium text-[12px] uppercase tracking-[-0.2px] text-black mb-1.5">Saved rides</h4>
                <ul className="border-2 border-[#40C8EF] rounded-lg divide-y divide-[#40C8EF]/30">
                  {savedTimers.map((timer) => {
                    const st = formatTime(timer.time);
                    return (
                      <li key={timer.id} className="flex items-start justify-between gap-2 px-4 py-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-medium uppercase text-[13px] text-black truncate">{timer.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-display font-medium uppercase text-white ${timer.type === 'finish' ? 'bg-[#40C8EF]' : 'bg-[#FF6B35]'}`}>
                              {timer.type}
                            </span>
                          </div>
                          <p className="text-[13px] text-black/70 tabular-nums mt-0.5">{st.days}d {st.hours}h {st.minutes}m {st.seconds}s</p>
                          <p className="text-[11px] text-black/50 mt-0.5">
                            {new Date(timer.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {timer.laps?.length > 0 && ` · ${timer.laps.length} state${timer.laps.length !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <div className="flex shrink-0">
                          <button onClick={() => handleDownloadTimer(timer)} aria-label={`Download ${timer.title}`} className="w-10 h-10 flex items-center justify-center text-black/50 hover:text-black">
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setTimerToDelete(timer.id);
                              setShowDeleteDialog(true);
                            }}
                            aria-label={`Delete ${timer.title}`}
                            className="w-10 h-10 flex items-center justify-center text-black/50 hover:text-[#FF6B35]"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="h-6" />

        {/* Dialogs */}
        {showSaveDialog && (
          <Dialog title="Finish Ride" text="Name this ride to save it">
            <input type="text" value={saveTitle} onChange={(e) => setSaveTitle(e.target.value)} placeholder="Tour Divide 2027" className={fieldClass} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveTimer()} />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowSaveDialog(false); setSaveTitle(''); }} className={btnOutline}><span className={btnLabel}>Cancel</span></button>
              <button onClick={handleSaveTimer} disabled={!saveTitle.trim()} className={btnFilled}><span className={btnLabel}>Save</span></button>
            </div>
          </Dialog>
        )}

        {showLapDialog && (
          <Dialog title="Record State" text="Log the time as you cross into a new state">
            <input type="text" value={lapTitle} onChange={(e) => setLapTitle(e.target.value)} placeholder="Montana" className={fieldClass} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveLap()} />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowLapDialog(false); setLapTitle(''); }} className={btnOutline}><span className={btnLabel}>Cancel</span></button>
              <button onClick={handleSaveLap} disabled={!lapTitle.trim()} className={btnFilled}><span className={btnLabel}>Save</span></button>
            </div>
          </Dialog>
        )}

        {showResetDialog && (
          <Dialog title="Reset Timer" text="This clears the current time and states.">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowResetDialog(false)} className={btnOutline}><span className={btnLabel}>Cancel</span></button>
              <button onClick={confirmReset} className={btnDangerFilled}><span className={btnLabel}>Reset</span></button>
            </div>
          </Dialog>
        )}

        {showScratchDialog && (
          <Dialog title="Scratch" text="Where and why you stopped">
            <input type="text" value={scratchTitle} onChange={(e) => setScratchTitle(e.target.value)} placeholder="Lima, MT · knee" className={fieldClass.replace(/#40C8EF/g, '#FF6B35')} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveScratch()} />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowScratchDialog(false); setScratchTitle(''); }} className={btnOutline}><span className={btnLabel}>Cancel</span></button>
              <button onClick={handleSaveScratch} disabled={!scratchTitle.trim()} className={btnDangerFilled}><span className={btnLabel}>Save</span></button>
            </div>
          </Dialog>
        )}

        {showDeleteDialog && (
          <Dialog title="Delete Ride" text="This can’t be undone.">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowDeleteDialog(false)} className={btnOutline}><span className={btnLabel}>Cancel</span></button>
              <button
                onClick={() => {
                  if (timerToDelete) {
                    handleDeleteTimer(timerToDelete);
                    setShowDeleteDialog(false);
                  }
                }}
                className={btnDangerFilled}
              >
                <span className={btnLabel}>Delete</span>
              </button>
            </div>
          </Dialog>
        )}

        {showConfirmation && (
          <div className="fixed top-4 left-4 right-4 z-[70] flex justify-center" role="status">
            <div className="w-full max-w-md bg-[#231F20] text-white rounded-lg px-4 py-3 shadow-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flag size={16} />
                <span className="font-display font-medium text-[13px]">{confirmationMessage}</span>
              </div>
              <button onClick={() => setShowConfirmation(false)} aria-label="Dismiss" className="p-1 text-white/70 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
