import { useState, useEffect } from 'react';
import { Play, X, Clock, Calendar, Save, Flag, XCircle, Download } from 'lucide-react';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';

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
    modeTitle = 'Countdown to Tour Divide';
    infoMessage = `The second Friday in June is: ${targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  } else {
    time = formatTime(elapsedTime);
    modeTitle = 'Ride Timer';
    infoMessage = isRunning ? 'Your ride timer is running.' : elapsedTime === 0 ? 'Press Start to begin tracking your Tour Divide adventure!' : 'Your ride timer is stopped.';
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden border-2 border-[#40C8EF] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sticky top-0"
          style={{ backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px', backgroundPosition: 'center' }}
        >
          <div className="flex items-center gap-2">
            {mode === 'countdown' ? <Calendar size={20} className="text-[#40C8EF]" /> : <Clock size={20} className="text-[#40C8EF]" />}
            <h2 className="uppercase text-[#40C8EF] font-display font-bold tracking-[-0.36px] text-base">{modeTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F5FCFF] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} className="text-[#40C8EF]" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-[#F5FCFF]">
          <button
            onClick={() => setMode('countdown')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 uppercase font-display font-bold tracking-[-0.36px] text-xs transition-all ${
              mode === 'countdown' ? 'bg-white text-[#40C8EF] border-t-2 border-r-2 border-[#40C8EF]' : 'bg-[#e5e5e5] text-[#666] hover:bg-[#40C8EF]/10 border-b-2 border-[#40C8EF]'
            }`}
          >
            <Calendar size={16} /> Countdown
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 uppercase font-display font-bold tracking-[-0.36px] text-xs transition-all ${
              mode === 'stopwatch' ? 'bg-white text-[#40C8EF] border-t-2 border-l-2 border-[#40C8EF]' : 'bg-[#e5e5e5] text-[#666] hover:bg-[#40C8EF]/10 border-b-2 border-[#40C8EF]'
            }`}
          >
            <Clock size={16} /> Stopwatch
          </button>
        </div>

        {/* Time Display */}
        <div className="p-6 bg-white">
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[{ label: 'Days', val: time.days }, { label: 'Hours', val: time.hours }, { label: 'Minutes', val: time.minutes }, { label: 'Seconds', val: time.seconds }].map(({ label, val }) => (
              <div key={label} className="text-center">
                <div className="bg-white border-2 border-[#40C8EF] rounded-lg p-2 mb-3 min-h-[56px] flex items-center justify-center">
                  <div className="text-2xl font-display font-bold text-[#40C8EF]">{String(val).padStart(2, '0')}</div>
                </div>
                <div className="text-xs uppercase text-gray-600 font-display font-bold">{label}</div>
              </div>
            ))}
          </div>

          {mode === 'stopwatch' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center justify-center gap-2 bg-[#40C8EF] text-white px-6 py-3 rounded-lg hover:bg-[#00B6EB] transition-colors font-display font-bold uppercase tracking-[-0.36px] w-full"
                  >
                    <Play size={20} /> {elapsedTime > 0 ? 'Resume' : 'Start'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLapDialog(true)}
                      className="flex items-center justify-center gap-2 bg-[#febc12] text-[#231f20] px-6 py-3 rounded-lg hover:bg-[#e5aa10] transition-colors font-display font-bold uppercase tracking-[-0.36px] w-full"
                    >
                      <Flag size={20} /> State
                    </button>
                    <button
                      onClick={() => setShowScratchDialog(true)}
                      className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-display font-bold uppercase tracking-[-0.36px] w-full"
                    >
                      <XCircle size={20} /> Scratch
                    </button>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="flex items-center justify-center gap-2 bg-[#40C8EF] text-white px-6 py-3 rounded-lg hover:bg-[#00B6EB] transition-colors font-display font-bold uppercase tracking-[-0.36px] w-full"
                    >
                      <Save size={20} /> Finish
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleReset()}
                  className="text-gray-400 hover:text-gray-600 transition-colors font-display font-bold uppercase tracking-[-0.36px] text-xs py-2"
                >
                  Reset
                </button>
              </div>

              {currentLaps.length > 0 && (
                <div className="mt-5 p-4 bg-[#F5FCFF] border-2 border-[#40C8EF]/20 rounded-lg">
                  <h4 className="text-xs uppercase text-[#40C8EF] font-display font-bold tracking-[-0.36px] mb-4">
                    Current Ride States ({currentLaps.length})
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {currentLaps.map((lap, i) => {
                      const lt = formatTime(lap.time);
                      return (
                        <div key={i} className="flex justify-between items-start text-xs p-2 bg-white rounded border border-[#40C8EF]/10">
                          <div className="font-display font-bold text-gray-700">{i + 1}. {lap.title}</div>
                          <div className="text-gray-500 ml-2">{lt.days}d {lt.hours}h {lt.minutes}m</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {savedTimers.length > 0 && (
                <div className="mt-5 border-2 border-[#40C8EF]/20 rounded-lg overflow-hidden">
                  {savedTimers.map(timer => {
                    const st = formatTime(timer.time);
                    return (
                      <div key={timer.id} className="p-3 hover:bg-[#F5FCFF] transition-colors border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-display font-bold text-[#40C8EF] uppercase tracking-[-0.36px] text-sm">{timer.title}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-display font-bold uppercase ${timer.type === 'finish' ? 'bg-[#40C8EF] text-white' : 'bg-red-500 text-white'}`}>
                                {timer.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{st.days}d {st.hours}h {st.minutes}m {st.seconds}s</div>
                            {timer.laps?.length > 0 && <div className="text-xs text-gray-400">{timer.laps.length} state{timer.laps.length !== 1 ? 's' : ''}</div>}
                            <div className="text-xs text-gray-400">{new Date(timer.savedAt).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleDownloadTimer(timer)} className="p-2 text-[#40C8EF] hover:bg-[#F5FCFF] rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center">
                              <Download size={16} />
                            </button>
                            <button onClick={() => { setTimerToDelete(timer.id); setShowDeleteDialog(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-[#F5FCFF] border-t-2 border-[#40C8EF]/20">
          <p className="text-xs text-gray-600 text-center">{infoMessage}</p>
        </div>

        {/* Dialogs */}
        {showSaveDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm border-2 border-[#40C8EF]">
              <h3 className="uppercase text-[#40C8EF] font-display font-bold tracking-[-0.36px] mb-5">Save Timer</h3>
              <input type="text" value={saveTitle} onChange={e => setSaveTitle(e.target.value)} placeholder="Enter timer title..." className="w-full border-2 border-[#40C8EF] rounded px-3 py-2 mb-5 focus:outline-none" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveTimer()} />
              <div className="flex gap-2">
                <button onClick={() => { setShowSaveDialog(false); setSaveTitle(''); }} className="flex-1 bg-[#999] text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm">Cancel</button>
                <button onClick={handleSaveTimer} disabled={!saveTitle.trim()} className="flex-1 bg-[#40C8EF] text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm disabled:opacity-50">Save</button>
              </div>
            </div>
          </div>
        )}

        {showLapDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm border-2 border-[#40C8EF] max-h-[80vh] overflow-y-auto">
              <h3 className="uppercase text-[#40C8EF] font-display font-bold tracking-[-0.36px] mb-5">Record State</h3>
              {currentLaps.length > 0 && (
                <div className="mb-5 p-3 bg-[#F5FCFF] border-2 border-[#40C8EF]/20 rounded-lg">
                  <div className="text-xs uppercase text-[#40C8EF] font-display font-bold mb-3">States Recorded ({currentLaps.length})</div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {currentLaps.map((lap, i) => {
                      const lt = formatTime(lap.time);
                      return (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="font-display font-bold text-gray-700">{i + 1}. {lap.title}</span>
                          <span className="text-gray-500 ml-2">{lt.days}d {lt.hours}h {lt.minutes}m</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <input type="text" value={lapTitle} onChange={e => setLapTitle(e.target.value)} placeholder="Enter state name..." className="w-full border-2 border-[#40C8EF] rounded px-3 py-2 mb-5 focus:outline-none" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveLap()} />
              <div className="flex gap-2">
                <button onClick={() => { setShowLapDialog(false); setLapTitle(''); }} className="flex-1 bg-[#999] text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm">Cancel</button>
                <button onClick={handleSaveLap} disabled={!lapTitle.trim()} className="flex-1 bg-[#40C8EF] text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm disabled:opacity-50">Save</button>
              </div>
            </div>
          </div>
        )}

        {showResetDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm border-2 border-[#40C8EF]">
              <h3 className="uppercase text-[#40C8EF] font-display font-bold tracking-[-0.36px] mb-5">Reset Timer</h3>
              <p className="text-gray-600 mb-5">Are you sure you want to reset the timer?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetDialog(false)} className="flex-1 bg-[#999] text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm">Cancel</button>
                <button onClick={confirmReset} className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm">Reset</button>
              </div>
            </div>
          </div>
        )}

        {showScratchDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm border-2 border-red-500">
              <h3 className="uppercase text-red-500 font-display font-bold tracking-[-0.36px] mb-5">Record Scratch</h3>
              <input type="text" value={scratchTitle} onChange={e => setScratchTitle(e.target.value)} placeholder="Enter location and reason for scratch..." className="w-full border-2 border-red-500 rounded px-3 py-2 mb-5 focus:outline-none" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveScratch()} />
              <div className="flex gap-2">
                <button onClick={() => { setShowScratchDialog(false); setScratchTitle(''); }} className="flex-1 bg-[#999] text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm">Cancel</button>
                <button onClick={handleSaveScratch} disabled={!scratchTitle.trim()} className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm disabled:opacity-50">Save</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm border-2 border-[#40C8EF]">
              <h3 className="uppercase text-[#40C8EF] font-display font-bold tracking-[-0.36px] mb-5">Delete Timer</h3>
              <p className="text-gray-600 mb-5">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteDialog(false)} className="flex-1 bg-[#999] text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm">Cancel</button>
                <button onClick={() => { if (timerToDelete) { handleDeleteTimer(timerToDelete); setShowDeleteDialog(false); } }} className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-display font-bold uppercase text-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="absolute top-4 left-4 right-4 z-50">
            <div className="bg-[#40C8EF] text-white rounded-lg p-4 shadow-lg border-2 border-[#00B6EB] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flag size={16} />
                <span className="font-display font-bold text-sm">{confirmationMessage}</span>
              </div>
              <button onClick={() => setShowConfirmation(false)} className="p-1 hover:bg-white/20 rounded">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
