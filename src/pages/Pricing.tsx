import { Link } from "react-router-dom";
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// TODO: Replace with your Razorpay/Stripe payment link when ready.
// When set, the Subscribe button will open the checkout URL instead of the "Coming soon" toast.
const PAYMENT_LINK_URL: string | null = null;
const CONTACT_EMAIL = "support@strokesuite.app";

const features = [
  "All 5 stroke pathways (Ischemic, ICH, SAH, SDH, Post-IVT ICH)",
  "54+ validated clinical scales & calculators",
  "Weight-based drug dosing (Tirofiban, Cangrelor, UFH, tPA/TNK)",
  "UFH monitoring timeline with HIT surveillance",
  "LAI lipid extreme-risk predictor & EMR notes",
  "Antiplatelet switching guide (Clopidogrel/Ticagrelor/Prasugrel)",
  "Lab value entry & auto-flagging",
  "PDF report generation & sharing",
  "Real-time collaboration & auto-save",
  "Priority clinical support",
];

const Pricing = () => {
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (PAYMENT_LINK_URL) {
      window.open(PAYMENT_LINK_URL, "_blank", "noopener,noreferrer");
      return;
    }
    toast({
      title: "Checkout coming soon",
      description: `Subscriptions are launching shortly. Email ${CONTACT_EMAIL} to get early access.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to app
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Simple pricing</h1>
          <p className="text-muted-foreground text-lg">
            One plan. Everything unlocked. Cancel anytime.
          </p>
        </div>

        <div className="relative rounded-2xl border-2 border-primary/40 bg-card p-8 shadow-xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full bg-primary text-primary-foreground">
            LAUNCH PRICING
          </div>

          <div className="mb-6">
            <div className="text-2xl font-bold">Stroke Pro</div>
            <div className="text-muted-foreground">Full clinical suite for stroke teams</div>
          </div>

          <div className="mb-8 flex items-baseline gap-2">
            <span className="text-5xl font-bold">$19.90</span>
            <span className="text-muted-foreground">/ year</span>
          </div>

          <Button size="lg" className="w-full mb-3" onClick={handleSubscribe}>
            {PAYMENT_LINK_URL ? "Subscribe – $19.90/year" : "Coming soon – Notify me"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full mb-8"
            asChild
          >
            <a href={`mailto:${CONTACT_EMAIL}?subject=Stroke%20Pro%20Subscription`}>
              <Mail className="w-4 h-4 mr-2" />
              Contact us
            </a>
          </Button>

          <div className="space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure checkout will be handled by our payment provider. You'll be able to test the
          full flow in sandbox mode before we go live.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
