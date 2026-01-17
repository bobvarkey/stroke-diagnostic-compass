import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  side?: "left" | "right";
}

// 3D Brain icon for Level of Consciousness (1a)
export const BrainIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#be185d" />
      </linearGradient>
      <filter id="brain3d" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#be185d" floodOpacity="0.4"/>
      </filter>
    </defs>
    <ellipse cx="32" cy="36" rx="20" ry="16" fill="url(#brainGrad)" filter="url(#brain3d)" />
    <path d="M18 28 Q22 18, 32 18 Q42 18, 46 28" fill="none" stroke="#fce7f3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M22 32 Q28 26, 32 32 Q36 26, 42 32" fill="none" stroke="#fce7f3" strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 40 Q32 36, 38 40" fill="none" stroke="#fce7f3" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="26" cy="28" r="3" fill="#fce7f3" opacity="0.6"/>
    <ellipse cx="32" cy="22" rx="6" ry="4" fill="#fce7f3" opacity="0.3"/>
  </svg>
);

// 3D Question mark for LOC Questions (1b)
export const QuestionIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="questionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
      <filter id="question3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#4338ca" floodOpacity="0.4"/>
      </filter>
    </defs>
    <circle cx="32" cy="32" r="24" fill="url(#questionGrad)" filter="url(#question3d)" />
    <text x="32" y="42" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="Arial">?</text>
    <ellipse cx="32" cy="12" rx="8" ry="3" fill="white" opacity="0.3"/>
  </svg>
);

// 3D Hand for LOC Commands (1c)
export const HandCommandIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="hand3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#d97706" floodOpacity="0.4"/>
      </filter>
    </defs>
    <path d="M28 52 L28 30 L22 30 L22 40 L18 40 L18 28 Q18 22, 24 22 L28 22 L28 18 Q28 14, 32 14 Q36 14, 36 18 L36 22 L40 22 Q46 22, 46 28 L46 40 L42 40 L42 30 L36 30 L36 52 Z" 
          fill="url(#handGrad)" filter="url(#hand3d)" />
    <rect x="26" y="14" width="12" height="4" rx="2" fill="#fef3c7" opacity="0.5"/>
    <line x1="30" y1="34" x2="30" y2="48" stroke="#fef3c7" strokeWidth="1" opacity="0.4"/>
    <line x1="34" y1="34" x2="34" y2="48" stroke="#fef3c7" strokeWidth="1" opacity="0.4"/>
  </svg>
);

// 3D Eyes for Best Gaze (2)
export const EyesGazeIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e5e7eb" />
      </linearGradient>
      <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="70%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </radialGradient>
      <filter id="eye3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#1e3a8a" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Left eye */}
    <ellipse cx="20" cy="32" rx="12" ry="10" fill="url(#eyeGrad)" filter="url(#eye3d)" stroke="#9ca3af" strokeWidth="1"/>
    <circle cx="22" cy="32" r="6" fill="url(#irisGrad)" />
    <circle cx="22" cy="32" r="3" fill="#0f172a" />
    <circle cx="20" cy="30" r="2" fill="white" opacity="0.8"/>
    {/* Right eye */}
    <ellipse cx="44" cy="32" rx="12" ry="10" fill="url(#eyeGrad)" filter="url(#eye3d)" stroke="#9ca3af" strokeWidth="1"/>
    <circle cx="46" cy="32" r="6" fill="url(#irisGrad)" />
    <circle cx="46" cy="32" r="3" fill="#0f172a" />
    <circle cx="44" cy="30" r="2" fill="white" opacity="0.8"/>
    {/* Arrow indicating gaze direction */}
    <path d="M32 48 L50 48 L46 44 M50 48 L46 52" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

// 3D Visual field icon (3)
export const VisualFieldIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="fieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="field3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#059669" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Eye in center */}
    <circle cx="32" cy="32" r="8" fill="white" stroke="#059669" strokeWidth="2"/>
    <circle cx="32" cy="32" r="4" fill="#1e3a8a"/>
    <circle cx="30" cy="30" r="1.5" fill="white"/>
    {/* Visual field quadrants */}
    <path d="M32 10 L32 20 M32 44 L32 54" stroke="url(#fieldGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#field3d)"/>
    <path d="M10 32 L20 32 M44 32 L54 32" stroke="url(#fieldGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#field3d)"/>
    {/* Quadrant arcs */}
    <path d="M20 20 A17 17 0 0 1 44 20" fill="none" stroke="url(#fieldGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#field3d)"/>
    <path d="M44 44 A17 17 0 0 1 20 44" fill="none" stroke="url(#fieldGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#field3d)"/>
  </svg>
);

// 3D Face for Facial Palsy (4)
export const FacialPalsyIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fcd9bd" />
        <stop offset="50%" stopColor="#f5b68c" />
        <stop offset="100%" stopColor="#e09460" />
      </linearGradient>
      <filter id="face3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#c2410c" floodOpacity="0.3"/>
      </filter>
    </defs>
    {/* Head */}
    <ellipse cx="32" cy="34" rx="22" ry="24" fill="url(#faceGrad)" filter="url(#face3d)" />
    {/* Normal side (left) */}
    <ellipse cx="22" cy="28" rx="5" ry="3" fill="white" stroke="#374151" strokeWidth="1"/>
    <circle cx="22" cy="28" r="2" fill="#374151"/>
    <path d="M16 24 Q22 20, 28 24" fill="none" stroke="#374151" strokeWidth="1.5"/>
    <path d="M18 42 Q22 46, 28 42" fill="none" stroke="#374151" strokeWidth="2"/>
    {/* Affected side (right) - drooping */}
    <ellipse cx="42" cy="30" rx="5" ry="2.5" fill="white" stroke="#374151" strokeWidth="1"/>
    <circle cx="42" cy="30" r="2" fill="#374151"/>
    <path d="M36 26 L48 28" fill="none" stroke="#374151" strokeWidth="1.5"/>
    <path d="M36 44 Q42 42, 48 46" fill="none" stroke="#ef4444" strokeWidth="2"/>
    {/* Dividing line */}
    <line x1="32" y1="12" x2="32" y2="56" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" opacity="0.6"/>
  </svg>
);

// 3D Arm for Motor Arms (5a, 5b)
export const ArmMotorIcon3D: React.FC<IconProps> = ({ className = "", size = 48, side = "left" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id={`armGrad${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
      <filter id={`arm3d${side}`}>
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#ea580c" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Shoulder */}
    <circle cx="16" cy="20" r="8" fill={`url(#armGrad${side})`} filter={`url(#arm3d${side})`} />
    {/* Upper arm */}
    <rect x="14" y="24" width="8" height="16" rx="4" fill={`url(#armGrad${side})`} filter={`url(#arm3d${side})`} />
    {/* Forearm extended */}
    <rect x="20" y="28" width="30" height="8" rx="4" fill={`url(#armGrad${side})`} filter={`url(#arm3d${side})`} transform="rotate(-10 20 32)"/>
    {/* Hand */}
    <circle cx="50" cy="26" r="6" fill={`url(#armGrad${side})`} filter={`url(#arm3d${side})`} />
    {/* Drift arrow */}
    <path d="M50 38 L50 52 L46 48 M50 52 L54 48" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Label */}
    <text x="8" y="56" fill="currentColor" fontSize="10" fontWeight="bold">{side === "left" ? "L" : "R"}</text>
  </svg>
);

// 3D Leg for Motor Legs (6a, 6b)
export const LegMotorIcon3D: React.FC<IconProps> = ({ className = "", size = 48, side = "left" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id={`legGrad${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <filter id={`leg3d${side}`}>
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Hip joint */}
    <circle cx="16" cy="16" r="8" fill={`url(#legGrad${side})`} filter={`url(#leg3d${side})`} />
    {/* Thigh - raised at 30 degrees */}
    <rect x="12" y="20" width="10" height="24" rx="5" fill={`url(#legGrad${side})`} filter={`url(#leg3d${side})`} transform="rotate(-30 17 32)"/>
    {/* Lower leg */}
    <rect x="24" y="8" width="8" height="22" rx="4" fill={`url(#legGrad${side})`} filter={`url(#leg3d${side})`} />
    {/* Foot */}
    <ellipse cx="34" cy="10" rx="8" ry="5" fill={`url(#legGrad${side})`} filter={`url(#leg3d${side})`} />
    {/* Drift arrow */}
    <path d="M40 36 L40 52 L36 48 M40 52 L44 48" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Angle indicator */}
    <path d="M16 16 L30 6" stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2"/>
    <text x="28" y="18" fill="#22c55e" fontSize="8">30°</text>
    {/* Label */}
    <text x="8" y="56" fill="currentColor" fontSize="10" fontWeight="bold">{side === "left" ? "L" : "R"}</text>
  </svg>
);

// 3D Target for Limb Ataxia (7)
export const AtaxiaIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <filter id="target3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#dc2626" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Target rings */}
    <circle cx="32" cy="32" r="24" fill="#fee2e2" stroke="#ef4444" strokeWidth="3" filter="url(#target3d)"/>
    <circle cx="32" cy="32" r="16" fill="#fecaca" stroke="#dc2626" strokeWidth="2"/>
    <circle cx="32" cy="32" r="8" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2"/>
    <circle cx="32" cy="32" r="3" fill="#dc2626"/>
    {/* Finger pointer missing target */}
    <path d="M50 14 L38 26" stroke="#f97316" strokeWidth="4" strokeLinecap="round" filter="url(#target3d)"/>
    <circle cx="50" cy="14" r="4" fill="#f97316"/>
    {/* Miss indicator */}
    <path d="M40 28 Q42 30, 44 28" stroke="#dc2626" strokeWidth="2" fill="none"/>
  </svg>
);

// 3D Hand sensory for Sensory (8)
export const SensoryIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="sensoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2dd4bf" />
        <stop offset="50%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#0d9488" />
      </linearGradient>
      <filter id="sensory3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#0d9488" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Open palm */}
    <path d="M20 50 L20 28 Q20 22, 26 22 L26 18 Q26 14, 30 14 Q34 14, 34 18 L34 22 L38 22 Q44 22, 44 28 L44 50 Z" 
          fill="url(#sensoryGrad)" filter="url(#sensory3d)" />
    {/* Finger divisions */}
    <line x1="26" y1="22" x2="26" y2="12" stroke="#99f6e4" strokeWidth="2" strokeLinecap="round"/>
    <line x1="30" y1="22" x2="30" y2="10" stroke="#99f6e4" strokeWidth="2" strokeLinecap="round"/>
    <line x1="34" y1="22" x2="34" y2="12" stroke="#99f6e4" strokeWidth="2" strokeLinecap="round"/>
    <line x1="38" y1="22" x2="38" y2="16" stroke="#99f6e4" strokeWidth="2" strokeLinecap="round"/>
    {/* Sensory points */}
    <circle cx="24" cy="34" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="32" cy="30" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="40" cy="34" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

// 3D Speech bubble for Language (9)
export const LanguageIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="speechGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <filter id="speech3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Speech bubble */}
    <path d="M8 12 L56 12 Q60 12, 60 16 L60 36 Q60 40, 56 40 L20 40 L12 52 L14 40 L8 40 Q4 40, 4 36 L4 16 Q4 12, 8 12 Z" 
          fill="url(#speechGrad)" filter="url(#speech3d)" />
    {/* Text lines representing speech */}
    <line x1="12" y1="20" x2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="26" x2="52" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="32" x2="36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    {/* Scrambled indicator */}
    <text x="44" y="22" fill="#fef3c7" fontSize="10" fontWeight="bold">?!</text>
  </svg>
);

// 3D Mouth for Dysarthria (10)
export const DysarthriaIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="mouthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <filter id="mouth3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#dc2626" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Lips/mouth outline */}
    <ellipse cx="32" cy="32" rx="24" ry="16" fill="url(#mouthGrad)" filter="url(#mouth3d)" />
    {/* Inner mouth */}
    <ellipse cx="32" cy="34" rx="16" ry="10" fill="#7f1d1d"/>
    {/* Teeth top */}
    <rect x="18" y="26" width="28" height="6" rx="2" fill="white"/>
    {/* Tongue */}
    <ellipse cx="32" cy="40" rx="10" ry="6" fill="#fca5a5"/>
    {/* Sound waves */}
    <path d="M52 24 Q56 28, 52 32 Q56 36, 52 40" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.8"/>
    <path d="M56 22 Q62 28, 56 34 Q62 40, 56 46" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.5"/>
  </svg>
);

// 3D Magnifying glass for Extinction/Inattention (11)
export const ExtinctionIcon3D: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="50%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="lens3d">
        <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#8b5cf6" floodOpacity="0.4"/>
      </filter>
    </defs>
    {/* Magnifying glass lens */}
    <circle cx="26" cy="26" r="18" fill="url(#lensGrad)" filter="url(#lens3d)" stroke="#6d28d9" strokeWidth="3"/>
    <circle cx="26" cy="26" r="12" fill="#ede9fe" opacity="0.6"/>
    {/* Handle */}
    <rect x="38" y="38" width="18" height="6" rx="3" fill="#6d28d9" transform="rotate(45 38 38)" filter="url(#lens3d)"/>
    {/* Split vision - left side visible */}
    <circle cx="22" cy="22" r="4" fill="#22c55e"/>
    {/* Right side faded/missing */}
    <circle cx="30" cy="30" r="4" fill="#dc2626" opacity="0.3" strokeDasharray="2,2" stroke="#dc2626"/>
    {/* X mark for neglected side */}
    <path d="M28 28 L34 34 M34 28 L28 34" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

// Export icon map for easy lookup
export const nihssIconMap: Record<string, React.FC<IconProps>> = {
  "1a": BrainIcon3D,
  "1b": QuestionIcon3D,
  "1c": HandCommandIcon3D,
  "2": EyesGazeIcon3D,
  "3": VisualFieldIcon3D,
  "4": FacialPalsyIcon3D,
  "5a": (props) => <ArmMotorIcon3D {...props} side="left" />,
  "5b": (props) => <ArmMotorIcon3D {...props} side="right" />,
  "6a": (props) => <LegMotorIcon3D {...props} side="left" />,
  "6b": (props) => <LegMotorIcon3D {...props} side="right" />,
  "7": AtaxiaIcon3D,
  "8": SensoryIcon3D,
  "9": LanguageIcon3D,
  "10": DysarthriaIcon3D,
  "11": ExtinctionIcon3D,
};
