import type { ReactNode } from 'react';

// Shared layout for the three main pages (Itinerary, Route, Journal):
// a scrolling page with a centered header (title, count line, one control)
// followed by the page's content. Each page is a normal page, not a layer,
// so only one is ever on screen.

interface PageLayoutProps {
  title: string;
  /** Short line under the title, e.g. "50 entries" */
  meta?: ReactNode;
  /** One control under the header, e.g. a filter or a view switch */
  control?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ title, meta, control, children }: PageLayoutProps) {
  return (
    <div className="relative w-full h-full bg-white overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col items-center px-[20px] md:px-[85px] pt-[40px] pb-[150px] md:pt-[96px] md:pb-[206px]">
        <header className="flex flex-col items-center gap-1 text-center w-full">
          <h1 className="font-display font-bold text-black text-[20px] tracking-[-0.36px] uppercase">{title}</h1>
          {meta && <p className="text-[13px] text-black/60 tabular-nums">{meta}</p>}
        </header>
        {control && <div className="w-[298px] mt-5">{control}</div>}
        <div className="w-full flex flex-col items-center gap-5 mt-6">{children}</div>
      </div>
    </div>
  );
}

/** Select styled to match the app's bordered controls. */
export function PageSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border-2 border-[#40C8EF] rounded-lg pl-4 pr-10 py-2.5 font-display font-medium uppercase tracking-[-0.2px] text-[13px] text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#40C8EF]/40"
      >
        {children}
      </select>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
