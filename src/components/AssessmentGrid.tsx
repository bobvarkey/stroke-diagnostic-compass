import { Lock } from 'lucide-react';
import { useState } from 'react';

interface Assessment {
  id: string;
  name: string;
  description: string;
  proOnly?: boolean;
}

const neonColors = [
  { bg: 'from-fuchsia-900/40 to-pink-900/40', border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/30' },
  { bg: 'from-cyan-900/40 to-blue-900/40', border: 'border-cyan-500/50', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
  { bg: 'from-pink-900/40 to-rose-900/40', border: 'border-pink-500/50', text: 'text-pink-400', glow: 'shadow-pink-500/30' },
  { bg: 'from-lime-900/40 to-green-900/40', border: 'border-lime-500/50', text: 'text-lime-400', glow: 'shadow-lime-500/30' },
  { bg: 'from-orange-900/40 to-amber-900/40', border: 'border-orange-500/50', text: 'text-orange-400', glow: 'shadow-orange-500/30' },
  { bg: 'from-violet-900/40 to-purple-900/40', border: 'border-violet-500/50', text: 'text-violet-400', glow: 'shadow-violet-500/30' },
  { bg: 'from-red-900/40 to-rose-900/40', border: 'border-red-500/50', text: 'text-red-400', glow: 'shadow-red-500/30' },
  { bg: 'from-yellow-900/40 to-amber-900/40', border: 'border-yellow-500/50', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
];

const AssessmentTile = ({
  assessment,
  color,
  onSelect,
  onProClick,
}: {
  assessment: Assessment;
  color: typeof neonColors[0];
  onSelect: () => void;
  onProClick: () => void;
}) => {
  return (
    <div
      onClick={!assessment.proOnly ? onSelect : onProClick}
      className={`relative group rounded-xl p-6 bg-gradient-to-br ${color.bg} border-2 ${color.border} hover:border-opacity-100 transition-all duration-300 cursor-pointer overflow-hidden`}
      style={{
        boxShadow: `0 0 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      }}
    >
      {/* Glow on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl`}
        style={{
          background: `linear-gradient(135deg, ${color.text}, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {assessment.proOnly && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-lg">
            <Lock className="w-4 h-4 text-fuchsia-400" />
            <span className="text-fuchsia-400 text-xs font-bold">PRO</span>
          </div>
        )}

        <h3 className={`font-bold mb-2 ${color.text} group-hover:text-white transition-colors`}>
          {assessment.name}
        </h3>
        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
          {assessment.description}
        </p>

        {assessment.proOnly && (
          <div className="absolute inset-0 bg-black/40 rounded-xl backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center">
              <Lock className="w-8 h-8 text-fuchsia-400 mx-auto mb-2" />
              <p className="text-fuchsia-400 font-semibold text-sm">Unlock Pro</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AssessmentGrid = ({
  assessments,
  onSelectAssessment,
  onUnlockPro,
}: {
  assessments: Assessment[];
  onSelectAssessment: (assessment: Assessment) => void;
  onUnlockPro: () => void;
}) => {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <section className="relative bg-black min-h-screen py-20 px-6">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-black" />

      {/* Background glow blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Ad Banner */}
        <div className="mb-12 rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900 to-slate-800 border border-fuchsia-500/30 hover:border-fuchsia-500/50 transition-all cursor-pointer group overflow-hidden relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/10 to-magenta-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10 flex items-center justify-between flex-col md:flex-row gap-4">
            <div>
              <h3 className="text-white font-bold text-xl md:text-2xl mb-2">✨ Upgrade to Stroke Pro - $29.99/year</h3>
              <p className="text-gray-400">Unlock all 5 stroke pathways: Ischemic, Hemorrhagic, SAH, SDH & Post-IVT ICH + 54+ scales</p>
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-magenta-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Assessment Tools
          </h2>
          <p className="text-gray-400 text-lg">Access validated stroke scales and diagnostic tools</p>
        </div>

        {/* Assessment Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {assessments.map((assessment, index) => (
            <AssessmentTile
              key={assessment.id}
              assessment={assessment}
              color={neonColors[index % neonColors.length]}
              onSelect={() => onSelectAssessment(assessment)}
              onProClick={() => setShowPaywall(true)}
            />
          ))}
        </div>

        {/* Paywall Modal */}
        {showPaywall && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md border border-fuchsia-500/30 relative">
              {/* Close button */}
              <button
                onClick={() => setShowPaywall(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              <Lock className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white text-center mb-4">Pro Feature</h3>
              <p className="text-gray-400 text-center mb-8">
                This assessment requires Stroke Pro. Unlock all 5 stroke pathways: Ischemic, Hemorrhagic, SAH, SDH & Post-IVT ICH plus all 54+ validated scales.
              </p>

              <button
                onClick={() => {
                  onUnlockPro();
                  setShowPaywall(false);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all mb-3"
              >
                Upgrade to Pro - $29.99/year
              </button>

              <button
                onClick={() => setShowPaywall(false)}
                className="w-full px-6 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-slate-500 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
