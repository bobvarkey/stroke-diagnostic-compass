import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const GlowBlob = ({ color, top, left, delay }: { color: string; top: string; left: string; delay: number }) => (
  <div
    className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse`}
    style={{
      background: color,
      top,
      left,
      animationDelay: `${delay}s`,
    }}
  />
);

export const HeroSection = ({ onExploreClick }: { onExploreClick: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center pt-20 pb-10">
      {/* Animated background glow blobs */}
      <GlowBlob color="#ff00ff" top="-10%" left="-20%" delay={0} />
      <GlowBlob color="#00ffff" top="50%" left="80%" delay={1} />
      <GlowBlob color="#ff00ff" top="80%" left="10%" delay={2} />

      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Brain Icon with Glow */}
        <div
          className={`mb-8 inline-block transition-all duration-1000 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          style={{
            filter: 'drop-shadow(0 0 30px rgba(255, 0, 255, 0.8)) drop-shadow(0 0 60px rgba(0, 255, 255, 0.5))',
          }}
        >
          <div className="text-8xl animate-pulse" style={{ animationDuration: '3s' }}>
            🧠
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 70%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Every Stroke Scale.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            One App.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-gray-400 text-lg md:text-xl mb-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Evidence-based assessments, validated scales, and clinical tools designed for rapid stroke evaluation.
        </p>

        {/* Rating */}
        <div
          className={`flex items-center justify-center gap-3 mb-12 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-2xl">
                ★
              </span>
            ))}
          </div>
          <span className="text-gray-400 text-sm">Rated 4.9 from 49 reviews</span>
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <button
            onClick={onExploreClick}
            className="px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            Start Assessment
          </button>
          <button
            onClick={onExploreClick}
            className="px-8 py-4 border-2 border-fuchsia-500/50 text-fuchsia-400 font-bold rounded-xl hover:border-fuchsia-400 hover:bg-fuchsia-500/10 transition-all duration-300 w-full sm:w-auto"
          >
            View Pro Plans
          </button>
        </div>
      </div>

      {/* Bounce indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce text-cyan-400" style={{ animationDuration: '2s' }}>
          <ChevronDown size={32} />
        </div>
      </div>
    </section>
  );
};
