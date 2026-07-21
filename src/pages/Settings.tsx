import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Palette, Ruler, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [glossaryOn, setGlossaryOn] = useState(() => localStorage.getItem("stroke-app:glossary") !== "off");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("stroke-app:glossary", glossaryOn ? "on" : "off");
  }, [glossaryOn]);

  return (
    <div className="min-h-screen relative bg-background">
      <div className="bg-orb bg-orb-1"/>
      <div className="bg-orb bg-orb-2"/>

      <header className="sticky top-0 z-40 glass-strong border-b">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>Home</Button></Link>
          <h1 className="font-bold text-lg text-gradient-sunset">Settings</h1>
        </div>
        <div className="h-[2px] bg-gradient-sunset opacity-70"/>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-5 bg-card/70 backdrop-blur">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="h-5 w-5" style={{ color: "hsl(var(--accent-coral))" }}/>
            <h2 className="font-semibold">Appearance</h2>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">Dark mode</div>
              <div className="text-xs text-muted-foreground">Sunset Blaze palette on deep backdrop</div>
            </div>
            <Switch checked={dark} onCheckedChange={setDark}/>
          </div>
        </Card>

        <Card className="p-5 bg-card/70 backdrop-blur">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-5 w-5" style={{ color: "hsl(var(--accent-magenta))" }}/>
            <h2 className="font-semibold">Glossary</h2>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">Show acronym tooltips</div>
              <div className="text-xs text-muted-foreground">Hover for short definition, click for full entry</div>
            </div>
            <Switch checked={glossaryOn} onCheckedChange={setGlossaryOn}/>
          </div>
        </Card>

        <Card className="p-5 bg-card/70 backdrop-blur">
          <div className="flex items-center gap-3 mb-3">
            <Ruler className="h-5 w-5" style={{ color: "hsl(var(--accent-amber))" }}/>
            <h2 className="font-semibold">Dose rounding</h2>
          </div>
          <p className="text-xs text-muted-foreground">Configured per-calculator in the Meds Formulary.</p>
        </Card>

        {user && (
          <Card className="p-5 bg-card/70 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{user.email}</div>
                <div className="text-xs text-muted-foreground">Signed in</div>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1"/>Sign out</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
