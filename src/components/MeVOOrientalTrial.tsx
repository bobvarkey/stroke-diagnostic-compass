import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, Info, ExternalLink } from "lucide-react";

const MeVOOrientalTrial = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-violet-500" />
        <h2 className="text-lg font-semibold tracking-tight">ORIENTAL-MeVO Trial</h2>
        <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/30">NEJM 2026</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <span>Does thrombectomy improve outcomes in medium-vessel occlusion (MeVO) stroke with moderate-to-severe deficits?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Three prior trials (DISTAL, ESCAPE-MeVO) were neutral — thrombectomy didn't seem to help. 
            ORIENTAL-MeVO used stricter patient selection (NIHSS ≥6) and found a significant benefit.
          </p>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-semibold">Outcome</th>
              <th className="text-center p-2 font-semibold">Medical Mgmt</th>
              <th className="text-center p-2 font-semibold">Thrombectomy</th>
              <th className="text-center p-2 font-semibold">Benefit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/30">
              <td className="p-2 font-medium">Functional independence (mRS 0–2 @ 90d)</td>
              <td className="p-2 text-center">46.6%</td>
              <td className="p-2 text-center text-green-500 font-semibold">58.6%</td>
              <td className="p-2 text-center">aRR 1.24, p=0.004</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="p-2 font-medium">Excellent outcome (mRS 0–1)</td>
              <td className="p-2 text-center">33.2%</td>
              <td className="p-2 text-center text-green-500 font-semibold">48.9%</td>
              <td className="p-2 text-center">aRR 1.47, p&lt;0.001</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="p-2 font-medium">Median mRS at 90 days</td>
              <td className="p-2 text-center">3</td>
              <td className="p-2 text-center text-green-500 font-semibold">2</td>
              <td className="p-2 text-center">Better by 1 point</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="p-2 font-medium">Vessel patency (24–72h)</td>
              <td className="p-2 text-center">46.2%</td>
              <td className="p-2 text-center text-green-500 font-semibold">82.1%</td>
              <td className="p-2 text-center">Huge difference</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="p-2 font-medium">sICH</td>
              <td className="p-2 text-center">2.2%</td>
              <td className="p-2 text-center text-amber-500">4.7%</td>
              <td className="p-2 text-center text-muted-foreground">NS</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Mortality</td>
              <td className="p-2 text-center">10.2%</td>
              <td className="p-2 text-center text-amber-500">11.1%</td>
              <td className="p-2 text-center text-muted-foreground">NS</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Card className="bg-green-500/5 border-green-500/30">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-green-500">NNT = 8</p>
          <p className="text-xs text-muted-foreground">To get one additional patient to functional independence (mRS 0–2)</p>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Critical nuance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Benefit was <strong>not seen</strong> in patients with NIHSS &lt;8 — explaining why earlier trials (which enrolled milder strokes) were negative.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>Lesson:</strong> MeVO thrombectomy works, but <strong>only in patients with moderate-to-severe deficits</strong>.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-red-500/5 border-red-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4 text-red-500" />
            Design caveats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p><strong>Open-label design</strong> — no blinding of patients, clinicians, or outcome assessors.</p>
          <p>Prespecified primary endpoint (ordinal mRS shift) <strong>violated the proportional odds assumption</strong>, so the primary result relied on a prespecified alternative (mRS 0–2).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bottom line</CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="text-xs italic text-muted-foreground border-l-2 border-violet-500 pl-3 py-1">
            "MeVO thrombectomy is not a routine default, but it is not dead. The signal looks strongest when we select higher-NIHSS, clearly disabling patients."
          </blockquote>
          <p className="text-xs text-muted-foreground mt-2">
            Purpose-built distal devices (from DISTALS trial) also help improve safety and technical success.
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            <span>Source: Nogueira R, Jing XZ, Hu W et al. NEJM 2026. ISC Feb 2026.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeVOOrientalTrial;
