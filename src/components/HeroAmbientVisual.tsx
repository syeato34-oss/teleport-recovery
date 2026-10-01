export function HeroAmbientVisual() {
  return (
    <div
      className="hero-ambient pointer-events-none absolute inset-0 z-[5] hidden overflow-hidden md:block"
      aria-hidden="true"
    >
      <svg
        className="hero-ambient__route"
        viewBox="0 0 660 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ambient-route-gradient" x1="40" y1="460" x2="620" y2="55">
            <stop stopColor="#A78BFA" stopOpacity="0" />
            <stop offset="0.32" stopColor="#A78BFA" stopOpacity="0.38" />
            <stop offset="0.72" stopColor="#C4B5FD" stopOpacity="0.62" />
            <stop offset="1" stopColor="#C4B5FD" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="ambient-node-gradient">
            <stop stopColor="#F5F3FF" />
            <stop offset="0.28" stopColor="#A78BFA" />
            <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          className="hero-ambient__route-glow"
          d="M18 455C126 448 162 367 244 345C345 318 332 228 433 203C524 180 548 92 642 50"
          stroke="url(#ambient-route-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          className="hero-ambient__route-line"
          d="M18 455C126 448 162 367 244 345C345 318 332 228 433 203C524 180 548 92 642 50"
          stroke="#C4B5FD"
          strokeOpacity="0.48"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="7 18"
        />
        <path
          className="hero-ambient__route-highlight"
          d="M18 455C126 448 162 367 244 345C345 318 332 228 433 203C524 180 548 92 642 50"
          stroke="#EDE9FE"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="0.035 0.965"
        />
        <circle className="hero-ambient__node hero-ambient__node--one" cx="244" cy="345" r="14" fill="url(#ambient-node-gradient)" />
        <circle className="hero-ambient__node hero-ambient__node--two" cx="433" cy="203" r="12" fill="url(#ambient-node-gradient)" />
        <circle cx="244" cy="345" r="2.5" fill="#F5F3FF" />
        <circle cx="433" cy="203" r="2.5" fill="#F5F3FF" />
      </svg>

      <div className="hero-ambient__object hero-ambient__object--location">
        <span className="hero-ambient__object-glow" />
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="48" cy="48" r="31" stroke="#C4B5FD" strokeOpacity="0.22" />
          <circle cx="48" cy="48" r="22" stroke="#A78BFA" strokeOpacity="0.15" strokeDasharray="3 7" />
          <path d="M48 23C37.5 23 29 31.2 29 41.4C29 55.5 48 73 48 73C48 73 67 55.5 67 41.4C67 31.2 58.5 23 48 23Z" fill="#1E162B" stroke="#B9A2FF" strokeWidth="2" />
          <path d="M39 43C43 39 47 38 54 39L60 36" stroke="#EDE9FE" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="39" cy="43" r="2.5" fill="#A78BFA" />
          <circle cx="60" cy="36" r="2.5" fill="#F5F3FF" />
        </svg>
      </div>

      <div className="hero-ambient__object hero-ambient__object--recovery">
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="48" cy="48" r="29" stroke="#A78BFA" strokeOpacity="0.2" strokeWidth="7" />
          <circle cx="48" cy="48" r="18" fill="#171021" stroke="#D8CFFF" strokeOpacity="0.5" strokeWidth="1.5" />
          <path d="M49 28V39L58 45" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" />
          <path d="M61 51C68 51 73 56 73 63C73 69 69 74 63 75C58 76 54 73 53 69" stroke="#EDE9FE" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 67L54 72L59 67" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M25 39L31 42M65 29L61 35M29 63L35 59" stroke="#A78BFA" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="hero-ambient__object hero-ambient__object--motion">
        <svg viewBox="0 0 150 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 46C42 46 43 27 65 27H112" stroke="#A78BFA" strokeOpacity="0.38" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 7" />
          <path d="M92 18L119 27L92 36" stroke="#D8CFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M48 42L56 34M58 48L68 38" stroke="#F5F3FF" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="46" r="4" fill="#A78BFA" />
          <circle cx="18" cy="46" r="9" stroke="#A78BFA" strokeOpacity="0.2" />
        </svg>
      </div>
    </div>
  );
}
