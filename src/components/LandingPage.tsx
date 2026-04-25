import { useState } from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { AssessmentGrid } from './AssessmentGrid';

interface Assessment {
  id: string;
  name: string;
  description: string;
  proOnly?: boolean;
}

const mockAssessments: Assessment[] = [
  { id: '1', name: 'NIHSS', description: 'National Institutes of Health Stroke Scale' },
  { id: '2', name: 'GCS', description: 'Glasgow Coma Scale' },
  { id: '3', name: 'mRS', description: 'Modified Rankin Scale', proOnly: true },
  { id: '4', name: 'TOAST', description: 'Trial of Org 10172 in Acute Stroke' },
  { id: '5', name: 'CTP Analysis', description: 'Computed Tomography Perfusion', proOnly: true },
  { id: '6', name: 'ASPECTS', description: 'Alberta Stroke Program Early CT Score' },
  { id: '7', name: 'DRAGON', description: 'Stroke Outcome Predictor', proOnly: true },
  { id: '8', name: 'ABCD2', description: 'TIA Risk Stratification' },
  { id: '9', name: 'ICH Score', description: 'Intracerebral Hemorrhage Outcome', proOnly: true },
  { id: '10', name: 'Fisher Scale', description: 'SAH Grading' },
  { id: '11', name: 'ETCH Score', description: 'Endothelial Treatment', proOnly: true },
  { id: '12', name: 'Collateral Score', description: 'Vessel Collateral Grade' },
];

export const LandingPage = ({
  onExploreClick,
  onSelectAssessment,
}: {
  onExploreClick: () => void;
  onSelectAssessment: (assessment: Assessment) => void;
}) => {
  const [showProModal, setShowProModal] = useState(false);

  return (
    <div className="bg-black">
      <HeroSection onExploreClick={onExploreClick} />
      <FeaturesSection />
      <PricingSection onSelectPlan={(plan) => console.log('Selected plan:', plan)} />
      <AssessmentGrid
        assessments={mockAssessments}
        onSelectAssessment={onSelectAssessment}
        onUnlockPro={() => setShowProModal(true)}
      />
    </div>
  );
};
