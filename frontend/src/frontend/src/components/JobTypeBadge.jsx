import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function JobTypeBadge({ type }) {
  const isJob = type === "job";
  return (
    <Badge variant="outline"
      className={cn("text-xs font-medium",
        isJob ? "bg-purple-100 text-purple-800 border-purple-200"
              : "bg-teal-100 text-teal-800 border-teal-200")}>
      {isJob ? "Job" : "Internship"}
    </Badge>
  );
}
