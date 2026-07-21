import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ChevronUp } from "lucide-react";

/**
 * Global floating buttons: quick "back to Home" and "back to Top".
 * Mounted once in App.tsx so it appears on every route.
 */
export default function FloatingNavButtons() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = location.pathname === "/";

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 safe-bottom pointer-events-none">
      {!isHome && (
        <Button
          onClick={() => navigate("/")}
          size="icon"
          aria-label="Back to home"
          title="Back to home"
          className="pointer-events-auto rounded-full shadow-lg h-12 w-12 bg-gradient-sunset text-primary-foreground hover:opacity-90 border-0"
        >
          <Home className="h-5 w-5" />
        </Button>
      )}
      {showTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          size="icon"
          aria-label="Back to top"
          title="Back to top"
          className="pointer-events-auto rounded-full shadow-lg h-12 w-12 bg-primary/90 hover:bg-primary backdrop-blur-sm"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
