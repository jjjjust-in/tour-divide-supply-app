import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface ViewerPhoto {
  id: string;
  src: string;
  /** e.g. "Pinedale, WY" */
  place: string | null;
  timestamp: number;
  caption: string;
}

interface PhotoViewerProps {
  photos: ViewerPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

// Full-screen photo from the journal gallery: arrows or a swipe step through
// the photos in the same order as the grid; Escape or × closes it.
export function PhotoViewer({ photos, index, onIndexChange, onClose }: PhotoViewerProps) {
  const photo = photos[index];
  const swipeStart = useRef<number | null>(null);
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && hasPrev) onIndexChange(index - 1);
      else if (e.key === 'ArrowRight' && hasNext) onIndexChange(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, hasPrev, hasNext, onClose, onIndexChange]);

  if (!photo) return null;

  const date = new Date(photo.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const arrow =
    'absolute top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-0 transition-opacity touch-manipulation';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo"
      className="fixed inset-0 z-[60] bg-[#231F20] flex flex-col pt-[var(--sat)] pb-[env(safe-area-inset-bottom)]"
      onTouchStart={(e) => (swipeStart.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = swipeStart.current;
        const end = e.changedTouches[0]?.clientX;
        swipeStart.current = null;
        if (start === null || end === undefined) return;
        if (end - start > 50 && hasPrev) onIndexChange(index - 1);
        else if (start - end > 50 && hasNext) onIndexChange(index + 1);
      }}
    >
      <div className="flex items-center justify-between px-4 h-14 shrink-0 text-white">
        <span className="text-[12px] font-display font-medium uppercase tracking-[0.02em] text-white/60 tabular-nums">
          {index + 1} of {photos.length}
        </span>
        <button onClick={onClose} aria-label="Close" className="w-11 h-11 -mr-2 flex items-center justify-center text-white/80 hover:text-white touch-manipulation">
          <X size={22} />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4">
        <img key={photo.id} src={photo.src} alt={photo.caption || `Photo from ${photo.place ?? 'the route'}`} className="max-w-full max-h-full object-contain select-none" draggable={false} />
        <button onClick={() => onIndexChange(index - 1)} disabled={!hasPrev} aria-label="Previous photo" className={`${arrow} left-2`}>
          <ChevronLeft size={22} />
        </button>
        <button onClick={() => onIndexChange(index + 1)} disabled={!hasNext} aria-label="Next photo" className={`${arrow} right-2`}>
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="shrink-0 px-5 pt-4 pb-6 text-white">
        {photo.place && <p className="font-display font-medium text-[13px] uppercase tracking-[-0.2px]">{photo.place}</p>}
        <p className="text-[12px] text-white/60 mt-0.5">{date}</p>
        {photo.caption && <p className="text-[14px] leading-relaxed text-white/90 mt-2 line-clamp-3">{photo.caption}</p>}
      </div>
    </div>,
    document.body,
  );
}
