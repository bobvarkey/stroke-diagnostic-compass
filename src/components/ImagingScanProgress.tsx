import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Scan, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  Loader2,
  ArrowRight
} from "lucide-react";

export type ScanStatus = "pending" | "in_progress" | "completed" | "not_available" | "skipped";

export interface ScanItem {
  id: string;
  name: string;
  shortName: string;
  status: ScanStatus;
  completedAt?: Date;
  result?: string;
  isRequired?: boolean;
}

interface ImagingScanProgressProps {
  scans: ScanItem[];
  onStatusChange: (scanId: string, status: ScanStatus, result?: string) => void;
  onMarkComplete: (scanId: string) => void;
}

const statusConfig: Record<ScanStatus, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: "text-slate-500 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    label: "Pending"
  },
  in_progress: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "In Progress"
  },
  completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Completed"
  },
  not_available: {
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Not Available"
  },
  skipped: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    label: "Skipped"
  }
};

export default function ImagingScanProgress({ 
  scans, 
  onStatusChange,
  onMarkComplete 
}: ImagingScanProgressProps) {
  // Calculate overall progress
  const completedCount = scans.filter(s => s.status === "completed").length;
  const requiredCount = scans.filter(s => s.isRequired !== false).length;
  const requiredCompletedCount = scans.filter(s => s.isRequired !== false && s.status === "completed").length;
  const progressPercent = requiredCount > 0 ? (requiredCompletedCount / requiredCount) * 100 : 0;

  const getNextStatus = (current: ScanStatus): ScanStatus => {
    const cycle: ScanStatus[] = ["pending", "in_progress", "completed"];
    const currentIndex = cycle.indexOf(current);
    if (currentIndex === -1) return "pending";
    return cycle[(currentIndex + 1) % cycle.length];
  };

  return (
    <Card className="border-cyan-200 dark:border-cyan-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Imaging Workflow
          </div>
          <Badge 
            variant={progressPercent === 100 ? "default" : "secondary"}
            className={progressPercent === 100 ? "bg-green-600" : ""}
          >
            {completedCount}/{scans.length} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Required Scans Progress</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress 
            value={progressPercent} 
            className={`h-2 ${progressPercent === 100 ? "[&>div]:bg-green-600" : ""}`}
          />
        </div>

        {/* Scan Items */}
        <div className="space-y-2">
          {scans.map((scan) => {
            const config = statusConfig[scan.status];
            return (
              <div 
                key={scan.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${config.bgColor} transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{scan.name}</span>
                      {scan.isRequired !== false && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          Required
                        </Badge>
                      )}
                    </div>
                    {scan.result && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {scan.result}
                      </p>
                    )}
                    {scan.completedAt && scan.status === "completed" && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Completed at {scan.completedAt.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`${config.bgColor} ${config.color} border-0 text-xs`}>
                    {config.label}
                  </Badge>
                  {scan.status !== "completed" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => onStatusChange(scan.id, getNextStatus(scan.status))}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                  {scan.status === "in_progress" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onMarkComplete(scan.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Done
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => {
              scans.forEach(scan => {
                if (scan.status === "pending") {
                  onStatusChange(scan.id, "in_progress");
                }
              });
            }}
          >
            Start All Pending
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => {
              scans.forEach(scan => {
                if (scan.status === "in_progress") {
                  onMarkComplete(scan.id);
                }
              });
            }}
          >
            Complete All In-Progress
          </Button>
        </div>

        {/* Imaging Protocol Note */}
        {progressPercent < 100 && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded border">
            <strong>Protocol:</strong> NCCT → CTA → CTP (if extended window or unclear onset)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
