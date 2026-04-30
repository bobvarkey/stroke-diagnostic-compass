import MobilePreviewLanding from "@/components/MobilePreviewLanding";

export default function Preview() {
  return <MobilePreviewLanding onOpenAppShell={() => window.location.assign("/")} onShowAuth={() => window.location.assign("/")} />;
}
