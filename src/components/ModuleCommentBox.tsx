import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";

interface ModuleCommentBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const ModuleCommentBox: React.FC<ModuleCommentBoxProps> = ({
  value,
  onChange,
  placeholder = "Add any additional comments, clinical notes, or observations here...",
  label = "Additional Comments"
}) => {
  return (
    <div className="mt-4 pt-4 border-t border-border">
      <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
        <MessageSquare className="h-4 w-4" />
        {label}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-y text-sm"
      />
    </div>
  );
};

export default ModuleCommentBox;
