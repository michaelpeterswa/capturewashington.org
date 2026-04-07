import { Badge } from "@/components/ui/badge";
import { EntryStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<EntryStatus, { label: string; className: string }> =
  {
    [EntryStatus.DRAFT]: {
      label: "Draft",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    },
    [EntryStatus.PUBLISHED]: {
      label: "Published",
      className: "bg-primary/10 text-primary",
    },
    [EntryStatus.ARCHIVED]: {
      label: "Archived",
      className: "bg-muted text-muted-foreground",
    },
  };

export function StatusBadge({ status }: { status: EntryStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
