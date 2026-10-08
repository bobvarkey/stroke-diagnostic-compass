import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { goBack } from "@/lib/navHistory";

/** Back + Home buttons for every page other than the main workspace (which has them in its header). */
export default function GlobalNavButtons() {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === "/") return null;
  const home = () => { navigate("/"); window.scrollTo({ top: 0 }); };
  return (
    <div className="fixed top-3 left-3 z-[60] flex gap-2 safe-top">
      <Button variant="secondary" size="icon" className="h-11 w-11 shadow-lg" onClick={() => goBack(home)} aria-label="Go back" title="Back">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Button variant="secondary" size="icon" className="h-11 w-11 shadow-lg" onClick={home} aria-label="Go to home page" title="Home">
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
}
