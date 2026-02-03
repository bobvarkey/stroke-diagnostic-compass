import React, { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleModuleProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  badge?: ReactNode;
  subtitle?: string;
}

const CollapsibleModule: React.FC<CollapsibleModuleProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  className,
  headerClassName,
  badge,
  subtitle,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={cn("border-border", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className={cn("cursor-pointer hover:bg-muted/50 transition-colors", headerClassName)}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <div>
                  <span className="text-base">{title}</span>
                  {subtitle && (
                    <p className="text-sm font-normal text-muted-foreground mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge}
                <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleModule;
