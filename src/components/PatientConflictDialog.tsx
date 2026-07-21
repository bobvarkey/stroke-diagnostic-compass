import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export interface ConflictInfo {
  remoteUpdatedAt: string;
  remoteEditorLabel: string;
  localSavedAt: string;
}

interface Props {
  open: boolean;
  info: ConflictInfo | null;
  onKeepMine: () => void;
  onKeepRemote: () => void;
  onCancel: () => void;
}

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export default function PatientConflictDialog({ open, info, onKeepMine, onKeepRemote, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Sync conflict detected
          </DialogTitle>
          <DialogDescription>
            This patient was edited on another device while you were working. Choose which version to keep — the other will be overwritten.
          </DialogDescription>
        </DialogHeader>

        {info && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div className="rounded-lg border p-3 bg-card/60 backdrop-blur-sm">
              <Badge variant="secondary" className="mb-2">This device</Badge>
              <p className="text-xs text-muted-foreground">Last local edit</p>
              <p className="text-sm font-medium">{fmt(info.localSavedAt)}</p>
            </div>
            <div className="rounded-lg border p-3 bg-card/60 backdrop-blur-sm">
              <Badge variant="secondary" className="mb-2">Cloud version</Badge>
              <p className="text-xs text-muted-foreground">Edited by {info.remoteEditorLabel}</p>
              <p className="text-sm font-medium">{fmt(info.remoteUpdatedAt)}</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="secondary" onClick={onKeepRemote}>Keep cloud version</Button>
          <Button onClick={onKeepMine} className="bg-gradient-sunset text-primary-foreground border-0">
            Keep my version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
