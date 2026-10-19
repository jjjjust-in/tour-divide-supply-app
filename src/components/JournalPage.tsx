import { useEffect, useMemo, useState } from 'react';
import type { Note, JournalEntry, Resupply, Town } from '../types';
import type { MeasurementSystem } from '../utils/measurements';
import { Trash2, Edit2 } from 'lucide-react';
import { PageLayout, PageSelect } from './PageLayout';
import { inRideOrder, type RideDirection } from '../utils/direction';
import { PhotoViewer, type ViewerPhoto } from './PhotoViewer';
import { RidePage } from './RidePage';

interface JournalPageProps {
  direction: RideDirection;
  notes: Note[];
  journalEntries: JournalEntry[];
  towns: Town[];
  resupplies: Resupply[];
  measurementSystem: MeasurementSystem;
  onDeleteNote: (noteId: string) => void;
  onDeleteJournalEntry: (entryId: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onEditJournalEntry: (entryId: string, content: string, imageUrl?: string) => void;
  onTownSelect: (townId: string) => void;
}

// Journal: same layout as the Itinerary. Title, count, a Words / Photos
// switch, the town filter (and a year picker once there's more than one
// year), a Your Ride button, then the entries in a bordered list or the
// photos in a grid. Numbers and the Race Recap live on the Your Ride page.
export function JournalPage({ direction, journalEntries, towns, resupplies, onDeleteJournalEntry, onEditJournalEntry, onTownSelect }: JournalPageProps) {
  const [filterTownId, setFilterTownId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showRide, setShowRide] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  // Words or Photos, remembered on this device
  const [view, setView] = useState<'words' | 'photos'>(() => {
    try {
      return localStorage.getItem('tour-divide-journal-view') === 'photos' ? 'photos' : 'words';
    } catch {
      return 'words';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('tour-divide-journal-view', view);
    } catch {
      // not critical
    }
  }, [view]);

  // Each year's race is its own journal: newest year first, picked from a menu once there's more than one
  const years = useMemo(
    () => [...new Set(journalEntries.map((e) => new Date(e.timestamp).getFullYear()))].sort((a, b) => b - a),
    [journalEntries],
  );
  // A year, or 'all' to scroll back through every year under its own heading
  const [pickedYear, setPickedYear] = useState<number | 'all' | null>(null);
  const allYears = pickedYear === 'all' && years.length > 1;
  const year = allYears ? undefined : typeof pickedYear === 'number' && years.includes(pickedYear) ? pickedYear : years[0];
  // Your Ride is one year's ride: the year being read, or the newest when showing all
  const rideYear = year ?? years[0] ?? new Date().getFullYear();

  const townsInRouteOrder = inRideOrder([...towns].sort((a, b) => a.mileage - b.mileage), direction);
  const townLabel = (townId?: string) => {
    const town = towns.find((t) => t.id === townId);
    return town ? `${town.name}, ${town.state}` : null;
  };

  const yearEntries = year === undefined ? journalEntries : journalEntries.filter((e) => new Date(e.timestamp).getFullYear() === year);
  const filtered = filterTownId === 'all' ? yearEntries : yearEntries.filter((e) => e.townId === filterTownId);
  // Itinerary order: by town along the route, oldest first within a town,
  // entries without a town at the end
  const routeIndex = new Map(townsInRouteOrder.map((t, i) => [t.id, i]));
  const townRank = (townId?: string) => (townId !== undefined ? routeIndex.get(townId) : undefined) ?? Infinity;
  const yearOf = (e: JournalEntry) => new Date(e.timestamp).getFullYear();
  // With every year showing, newest year first, then route order within each year
  const sorted = [...filtered].sort(
    (a, b) => (allYears ? yearOf(b) - yearOf(a) : 0) || townRank(a.townId) - townRank(b.townId) || a.timestamp - b.timestamp,
  );
  const toPhoto = (e: JournalEntry): ViewerPhoto => ({ id: e.id, src: e.imageUrl!, place: townLabel(e.townId), timestamp: e.timestamp, caption: e.content });
  // One group per year when showing all years; a single unlabeled group otherwise.
  // Photos keep one running order so the viewer steps straight across years.
  const groups: { year: number | null; entries: JournalEntry[]; photos: ViewerPhoto[]; photoStart: number }[] = [];
  let photoCount = 0;
  for (const e of sorted) {
    const y = allYears ? yearOf(e) : null;
    let g = groups[groups.length - 1];
    if (!g || g.year !== y) {
      g = { year: y, entries: [], photos: [], photoStart: photoCount };
      groups.push(g);
    }
    g.entries.push(e);
    if (e.imageUrl) {
      g.photos.push(toPhoto(e));
      photoCount++;
    }
  }
  const photos: ViewerPhoto[] = groups.flatMap((g) => g.photos);
  const count = (n: number) =>
    view === 'photos' ? `${n} ${n === 1 ? 'photo' : 'photos'}` : `${n} ${n === 1 ? 'entry' : 'entries'}`;
  const shown = view === 'photos' ? photos.length : sorted.length;
  const inYear = years.length > 1 && year !== undefined ? ` in ${year}` : '';

  const yearHeading = (y: number, n: number) => (
    <h2 className="w-[298px] flex items-baseline justify-between">
      <span className="font-display font-bold text-[#40C8EF] text-[18px] tracking-[-0.36px] tabular-nums">{y}</span>
      <span className="text-[12px] text-black/50 tabular-nums">{count(n)}</span>
    </h2>
  );

  const saveEdit = (entry: JournalEntry) => {
    // Text can be cleared as long as the entry still has its photo
    if (!editingContent.trim() && !entry.imageUrl) return;
    onEditJournalEntry(entry.id, editingContent.trim(), entry.imageUrl);
    setEditingId(null);
  };

  return (
    <PageLayout
      title="Journal"
      meta={filterTownId === 'all' ? `${count(shown)}${inYear}` : `${count(shown)} in ${townLabel(filterTownId)}`}
      control={
        <div className="space-y-2">
          {/* Words / Photos: same sliding switch as the Route page */}
          <div role="radiogroup" aria-label="Journal view" className="relative grid grid-cols-2 border-2 border-[#40C8EF] rounded-lg bg-white overflow-hidden">
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-1/2 bg-[#40C8EF] motion-safe:transition-transform motion-safe:duration-200 ease-out ${
                view === 'photos' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {([
              { key: 'words', label: 'Words' },
              { key: 'photos', label: 'Photos' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                role="radio"
                aria-checked={view === key}
                onClick={() => setView(key)}
                className={`relative z-10 px-4 py-2.5 transition-colors ${view === key ? 'text-white' : 'text-[#40C8EF] hover:text-[#00B6EB]'}`}
              >
                <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">{label}</span>
              </button>
            ))}
          </div>

          <div className={years.length > 1 ? 'grid grid-cols-[1fr_96px] gap-2' : ''}>
            <PageSelect id="journal-filter" label="Filter by town" value={filterTownId} onChange={setFilterTownId}>
              <option value="all">All towns</option>
              {townsInRouteOrder.map((town) => (
                <option key={town.id} value={town.id}>
                  {town.name}, {town.state}
                </option>
              ))}
            </PageSelect>
            {years.length > 1 && (
              <PageSelect
                id="journal-year"
                label="Year"
                value={allYears ? 'all' : String(year)}
                onChange={(v) => setPickedYear(v === 'all' ? 'all' : Number(v))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
                <option value="all">All</option>
              </PageSelect>
            )}
          </div>

          {/* Numbers, the Ride Passport and the Race Recap, on their own page */}
          <button
            onClick={() => setShowRide(true)}
            className="w-full h-11 border-2 border-[#40C8EF] bg-white text-[#40C8EF] px-4 rounded-lg hover:bg-[#F5FCFF] transition-colors"
          >
            <span className="uppercase font-display font-medium tracking-[-0.36px] text-[13px] md:text-sm">Your {rideYear} Ride</span>
          </button>
        </div>
      }
    >
      {showRide && (
        <RidePage
          initialYear={rideYear}
          direction={direction}
          journalEntries={journalEntries}
          towns={towns}
          resupplies={resupplies}
          onOpenTown={(y, townId) => {
            setPickedYear(y);
            setFilterTownId(townId);
            setView('words');
            setShowRide(false);
          }}
          onOpenPhotos={(y) => {
            setPickedYear(y);
            setFilterTownId('all');
            setView('photos');
            setShowRide(false);
          }}
          onClose={() => setShowRide(false)}
        />
      )}
      {viewerIndex !== null && (
        <PhotoViewer photos={photos} index={viewerIndex} onIndexChange={setViewerIndex} onClose={() => setViewerIndex(null)} />
      )}
      {view === 'photos' ? (
        photos.length === 0 ? (
          <div className="w-[298px] border-2 border-[#40C8EF] px-6 py-10 text-center">
            <p className="font-display font-medium text-[13px] uppercase text-black">No photos yet</p>
            <p className="text-[13px] text-black/60 mt-2">Add a photo to a journal entry with + and it shows up here.</p>
          </div>
        ) : (
          // Square thumbnails divided by the app's blue lines, in the same order as the entries
          <>
            {groups
              .filter((g) => g.photos.length > 0)
              .map((g) => (
                <section key={g.year ?? 'photos'} className="flex flex-col items-center gap-3">
                  {g.year !== null && yearHeading(g.year, g.photos.length)}
                  <ul className="w-[298px] border-2 border-[#40C8EF] bg-[#40C8EF] grid grid-cols-3 gap-[2px]">
                    {g.photos.map((photo, i) => (
                      <li key={photo.id} className="aspect-square bg-white">
                        <button onClick={() => setViewerIndex(g.photoStart + i)} aria-label={`Open photo from ${photo.place ?? 'the route'}`} className="block w-full h-full">
                          <img src={photo.src} alt="" loading="lazy" className="w-full h-full object-cover" />
                        </button>
                      </li>
                    ))}
                    {/* White cells finish the last row so it doesn't show solid blue */}
                    {Array.from({ length: (3 - (g.photos.length % 3)) % 3 }, (_, i) => (
                      <li key={`fill-${i}`} aria-hidden="true" className="aspect-square bg-white" />
                    ))}
                  </ul>
                </section>
              ))}
          </>
        )
      ) : sorted.length === 0 ? (
        <div className="w-[298px] border-2 border-[#40C8EF] px-6 py-10 text-center">
          <p className="font-display font-medium text-[13px] uppercase text-black">No entries yet</p>
          <p className="text-[13px] text-black/60 mt-2">Tap + to write your first journal entry.</p>
        </div>
      ) : (
        <>
        {groups.map((g) => (
        <section key={g.year ?? 'entries'} className="flex flex-col items-center gap-3">
        {g.year !== null && yearHeading(g.year, g.entries.length)}
        <ul className="w-[298px] border-2 border-[#40C8EF] divide-y-2 divide-[#40C8EF]">
          {g.entries.map((entry) => {
            const town = townLabel(entry.townId);
            const isEditing = editingId === entry.id;
            return (
              <li key={entry.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {town && (
                      <button
                        onClick={() => entry.townId && onTownSelect(entry.townId)}
                        className="block font-display font-medium text-[12px] uppercase tracking-[-0.2px] text-black hover:text-[#00B6EB] text-left"
                      >
                        {town}
                      </button>
                    )}
                    <p className="text-[11px] text-black/50 mt-1">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {!isEditing && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditingContent(entry.content);
                        }}
                        aria-label="Edit entry"
                        className="p-1.5 text-black/40 hover:text-black transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteJournalEntry(entry.id)}
                        aria-label="Delete entry"
                        className="p-1.5 text-black/40 hover:text-[#FF6B35] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {entry.imageUrl && <img src={entry.imageUrl} alt="" className="mt-3 w-full h-auto" />}

                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full text-[14px] leading-relaxed border-2 border-[#40C8EF] rounded-lg px-3 py-2 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#40C8EF]/40"
                      rows={6}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-gray-200 text-black py-2.5 rounded text-[12px] font-display font-medium uppercase hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(entry)}
                        disabled={!editingContent.trim() && !entry.imageUrl}
                        className="flex-1 bg-[#40c8ef] text-white py-2.5 rounded text-[12px] font-display font-medium uppercase hover:bg-[#00B6EB] transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : entry.content ? (
                  <p className="mt-3 text-[14px] leading-relaxed text-black whitespace-pre-wrap">{entry.content}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
        </section>
        ))}
        </>
      )}
    </PageLayout>
  );
}
