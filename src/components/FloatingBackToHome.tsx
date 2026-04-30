import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FloatingBackToHome: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on home page
  if (location.pathname === "/") {
    return null;
  }

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleBackToHome}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "flex items-center justify-center",
          "animate-in fade-in slide-in-from-bottom-2"
        )}
        aria-label="Back to Home"
      >
        <Home className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FloatingBackToHome;