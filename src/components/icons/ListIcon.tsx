export function ListIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} fill="none" viewBox="0 0 24 24">
      <g>
        <path d="M8 6H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M8 12H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M8 18H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M3 6H3.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M3 12H3.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M3 18H3.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </g>
    </svg>
  );
}
