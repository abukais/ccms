export function ArrowDoodle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none">
      <path d="M4 30 C 30 10, 60 50, 90 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
      <path d="M82 14 L 96 22 L 84 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
export function StarDoodle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L23 17 L36 20 L23 23 L20 36 L17 23 L4 20 L17 17 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
export function UnderlineDoodle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 20" fill="none" preserveAspectRatio="none">
      <path d="M4 14 C 60 4, 150 20, 220 8 S 300 14, 316 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}