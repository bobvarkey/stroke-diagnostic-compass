import { CheckCircle2 } from 'lucide-react';

export const PricingSection = ({ onSelectPlan }: { onSelectPlan: (plan: string) => void }) => {
  return (
    <section className="relative bg-black py-20 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 text-lg">Start free, upgrade when you need advanced features</p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="rounded-2xl p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
            <div className="text-2xl font-bold text-white mb-2">Free</div>
            <div className="text-gray-400 mb-8">Learn the basics</div>

            <div className="text-3xl font-bold text-white mb-8">
              $0<span className="text-lg text-gray-400">/month</span>
            </div>

            <button
              onClick={() => onSelectPlan('free')}
              className="w-full px-6 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-slate-500 hover:bg-slate-900/50 transition-all duration-300 mb-8"
            >
              Get Started
            </button>

            <div className="space-y-4">
              <Feature text="3 assessments/month" />
              <Feature text="Ischemic stroke pathway only" />
              <Feature text="Basic NIHSS & GCS tools" />
              <Feature text="Community support" />
            </div>
          </div>

          {/* Pro Plan - Recommended */}
          <div className="relative rounded-2xl p-8 bg-gradient-to-br from-fuchsia-900/30 to-cyan-900/30 border-2 border-fuchsia-500/50 hover:border-fuchsia-400 transition-all duration-300 shadow-2xl shadow-fuchsia-500/20">
            {/* RECOMMENDED Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-4 py-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-sm font-bold rounded-full">
                RECOMMENDED
              </div>
            </div>

            <div className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Stroke Pro
            </div>
            <div className="text-gray-400 mb-8">Comprehensive stroke management</div>

            {/* Pricing */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">$29.99</span>
                <span className="text-lg text-gray-500 line-through">$49.99</span>
                <span className="text-lg text-gray-400">/year</span>
              </div>
              <div className="text-gray-400 text-sm">Renews at $25.99/year</div>
            </div>

            <button
              onClick={() => onSelectPlan('pro')}
              className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all duration-300 mb-8 transform hover:scale-105"
            >
              Upgrade to Pro
            </button>

            <div className="space-y-4">
              <FeaturePro text="Unlimited assessments" />
              <FeaturePro text="Ischemic stroke pathway" />
              <FeaturePro text="Hemorrhagic stroke pathway" />
              <FeaturePro text="Subarachnoid hemorrhage (SAH)" />
              <FeaturePro text="Subdural hematoma (SDH)" />
              <FeaturePro text="Post-IVT ICH management" />
              <FeaturePro text="All 54+ validated scales" />
              <FeaturePro text="Advanced analytics & reports" />
              <FeaturePro text="Priority support" />
              <FeaturePro text="Team collaboration" />
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-20 rounded-2xl p-8 bg-slate-900/30 border border-slate-700/50">
          <h3 className="text-white font-bold text-xl mb-8">Stroke Pathway Access</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-300 font-semibold mb-4">Free Plan</p>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>✓ Ischemic Stroke Pathway</li>
                <li>✓ NIHSS Calculator</li>
                <li>✓ GCS Calculator</li>
                <li>✓ 3 assessments/month</li>
                <li>✗ Hemorrhagic pathways</li>
                <li>✗ SAH management</li>
                <li>✗ SDH management</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-300 font-semibold mb-4">Pro Plan - Full Access</p>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>✓ Ischemic Stroke Pathway</li>
                <li>✓ Hemorrhagic Stroke Pathway</li>
                <li>✓ Subarachnoid Hemorrhage (SAH)</li>
                <li>✓ Subdural Hematoma (SDH)</li>
                <li>✓ Post-IVT ICH Management</li>
                <li>✓ All 54+ validated scales</li>
                <li>✓ Unlimited assessments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">✓</div>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}

function FeaturePro({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
      <span className="text-gray-200">{text}</span>
    </div>
  );
}
