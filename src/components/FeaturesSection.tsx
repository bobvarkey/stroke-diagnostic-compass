import { useEffect, useState } from 'react';

const FeatureCard = ({
  icon,
  title,
  description,
  accentColor,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`relative group rounded-2xl p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } hover:shadow-lg overflow-hidden`}
      style={{
        boxShadow: isVisible ? `inset 0 1px 0 rgba(${accentColor}, 0.1)` : 'none',
      }}
    >
      {/* Gradient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, rgb(${accentColor}), transparent)`,
        }}
      />

      <div className="relative z-10">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
        <div
          className="mt-4 h-1 w-12 rounded-full"
          style={{ background: `rgb(${accentColor})` }}
        />
      </div>
    </div>
  );
};

export const FeaturesSection = () => {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: '🧠',
      title: 'Ischemic Stroke',
      description: 'Evidence-based protocols for acute ischemic stroke evaluation and treatment decisions',
      accentColor: '234, 179, 8', // yellow
    },
    {
      icon: '🔴',
      title: 'Hemorrhagic Stroke',
      description: 'Comprehensive assessment tools for intracerebral hemorrhage management',
      accentColor: '239, 68, 68', // red
    },
    {
      icon: '⭐',
      title: 'SAH & SDH',
      description: 'Specialized scales for subarachnoid and subdural hematoma grading',
      accentColor: '236, 72, 153', // pink/fuchsia
    },
    {
      icon: '🛡️',
      title: 'Post-IVT ICH',
      description: 'Management protocols for intracranial hemorrhage after thrombolysis',
      accentColor: '6, 182, 212', // cyan
    },
  ];

  const stats = [
    { value: '54+', label: 'Validated Scales' },
    { value: '9', label: 'Stroke Types' },
    { value: '500+', label: 'Hospitals' },
    { value: 'Free', label: 'To Start' },
  ];

  return (
    <section className="relative bg-black py-20 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-black opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>

        {/* Stats Bar */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-1000 ${
            statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 text-center group"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:drop-shadow-lg transition-all">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
