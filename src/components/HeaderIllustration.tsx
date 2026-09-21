import React from 'react';

export const HeaderIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-[340px] mx-auto flex items-center justify-center ${className}`}>
      {/* Background abstract brush blobs matching the screenshot */}
      <div className="absolute -top-4 -right-2 w-48 h-36 bg-amber-200/45 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-8 -left-4 w-40 h-40 bg-teal-200/30 rounded-full blur-xl pointer-events-none" />

      <svg
        viewBox="0 0 380 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm select-none"
      >
        <defs>
          <linearGradient id="peachBlob" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Backdrop Peach shape */}
        <path
          d="M170 12 C240 5, 340 18, 360 80 C380 140, 310 180, 260 170 C210 160, 160 165, 120 150 C70 130, 110 20, 170 12 Z"
          fill="url(#peachBlob)"
        />

        {/* Back Code / Analysis Boards */}
        {/* Left Board */}
        <rect x="135" y="24" width="75" height="105" rx="4" fill="#e0f2fe" stroke="#334155" strokeWidth="2.2" />
        <line x1="143" y1="36" x2="160" y2="36" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
        <line x1="143" y1="48" x2="195" y2="48" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="143" y1="58" x2="185" y2="58" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="143" y1="68" x2="190" y2="68" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="143" y1="78" x2="175" y2="78" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="198" cy="36" r="2" fill="#0284c7" />
        <circle cx="198" cy="48" r="2" fill="#0284c7" />
        <circle cx="198" cy="60" r="2" fill="#0284c7" />
        <line x1="143" y1="92" x2="160" y2="92" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
        <line x1="143" y1="104" x2="190" y2="104" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="143" y1="114" x2="180" y2="114" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />

        {/* Top small banner */}
        <rect x="220" y="32" width="60" height="22" rx="4" fill="#a5f3fc" stroke="#334155" strokeWidth="2" />
        <circle cx="232" cy="43" r="4" fill="#0284c7" />
        <path d="M230 43 L231.5 45 L234 41" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="242" y1="43" x2="268" y2="43" stroke="#0e7490" strokeWidth="2" strokeLinecap="round" />

        {/* Right Graph Board */}
        <rect x="224" y="65" width="85" height="75" rx="4" fill="#bae6fd" stroke="#334155" strokeWidth="2.2" />
        <path d="M232 120 L248 95 L266 115 L288 80 L300 95" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M232 120 L248 95 L266 115 L288 80 L300 95 L300 130 L232 130 Z" fill="#38bdf8" fillOpacity="0.25" />

        {/* Work Desk */}
        <rect x="130" y="168" width="130" height="6" rx="2" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
        <line x1="140" y1="174" x2="135" y2="235" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="250" y1="174" x2="255" y2="235" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

        {/* Computer Monitor */}
        <rect x="165" y="112" width="65" height="46" rx="5" fill="url(#screenGrad)" stroke="#334155" strokeWidth="2" />
        <circle cx="185" cy="135" r="10" stroke="#38bdf8" strokeWidth="2" fill="none" />
        <path d="M185 125 A 10 10 0 0 1 195 135 L185 135 Z" fill="#38bdf8" />
        <line x1="202" y1="130" x2="222" y2="130" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        <line x1="202" y1="138" x2="218" y2="138" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Monitor Stand */}
        <path d="M194 158 L194 168 M182 168 L212 168" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="197" cy="155" r="2" fill="#ffffff" />

        {/* Potted Plant */}
        <path d="M250 205 L254 225 L270 225 L274 205 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />
        <path d="M262 205 C255 190, 248 180, 255 170 C262 180, 260 195, 262 205 Z" fill="#86efac" stroke="#334155" strokeWidth="1.5" />
        <path d="M262 205 C270 190, 278 180, 270 170 C263 180, 264 195, 262 205 Z" fill="#4ade80" stroke="#334155" strokeWidth="1.5" />
        <path d="M262 205 C262 185, 262 175, 262 162 C266 175, 265 195, 262 205 Z" fill="#22c55e" stroke="#334155" strokeWidth="1.5" />

        {/* Standing Person 1 (Left - Man with tablet) */}
        {/* Hair */}
        <path d="M68 62 C64 56, 75 52, 85 55 C90 56, 92 63, 88 68 C82 66, 74 66, 68 62 Z" fill="#1e293b" />
        {/* Face */}
        <circle cx="78" cy="68" r="8" fill="#ffedd5" />
        {/* Body Shirt */}
        <path d="M64 85 C66 78, 90 78, 92 85 L98 150 L58 150 Z" fill="#a5f3fc" stroke="#334155" strokeWidth="2" />
        {/* Tablet in hand */}
        <rect x="80" y="98" width="26" height="18" rx="2" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
        <line x1="84" y1="106" x2="98" y2="106" stroke="#0284c7" strokeWidth="1.5" />
        {/* Trousers */}
        <path d="M58 150 L60 220 L74 220 L76 165 L80 220 L94 220 L98 150 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />
        {/* Shoes */}
        <rect x="58" y="220" width="18" height="6" rx="2" fill="#1e293b" />
        <rect x="78" y="220" width="18" height="6" rx="2" fill="#1e293b" />

        {/* Sitting Person 2 (Center - Man in chair typing) */}
        {/* Chair back */}
        <rect x="90" y="140" width="28" height="52" rx="4" fill="#ffffff" stroke="#334155" strokeWidth="2" />
        <line x1="104" y1="192" x2="104" y2="230" stroke="#334155" strokeWidth="2.5" />
        {/* Head */}
        <circle cx="118" cy="112" r="8" fill="#ffedd5" />
        <path d="M109 108 C112 102, 122 102, 126 106 C126 112, 120 112, 114 112 Z" fill="#0f172a" />
        {/* Body Salmon Shirt */}
        <path d="M108 126 C115 122, 130 124, 136 130 L145 178 L114 178 Z" fill="#fed7aa" stroke="#334155" strokeWidth="2" />
        {/* Arms typing */}
        <path d="M132 135 L156 160 L168 156" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Trousers (light blue) */}
        <path d="M118 178 L152 178 L154 210 L136 210 L136 195 L120 195 Z" fill="#bae6fd" stroke="#334155" strokeWidth="2" />
        {/* Boots */}
        <path d="M152 208 L158 232 L144 232 L142 208 Z" fill="#0f172a" />

        {/* Standing Person 3 (Right - Woman with documents) */}
        {/* Hair */}
        <path d="M305 106 C300 112, 300 125, 302 135 C304 125, 326 125, 328 135 C330 125, 330 112, 325 106 C318 102, 310 102, 305 106 Z" fill="#0f172a" />
        {/* Head */}
        <circle cx="315" cy="118" r="8" fill="#ffedd5" />
        {/* Blouse */}
        <path d="M304 132 C308 128, 322 128, 326 132 L332 170 L298 170 Z" fill="#a5f3fc" stroke="#334155" strokeWidth="2" />
        {/* Tray / documents in hand */}
        <rect x="278" y="152" width="32" height="6" rx="2" fill="#ffffff" stroke="#334155" strokeWidth="1.8" />
        <path d="M320 142 L300 156" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        {/* Long Skirt */}
        <path d="M298 170 L292 230 L330 230 L332 170 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />
        {/* Shoes */}
        <ellipse cx="304" cy="233" rx="5" ry="2.5" fill="#334155" />
        <ellipse cx="320" cy="233" rx="5" ry="2.5" fill="#334155" />
      </svg>
    </div>
  );
};
