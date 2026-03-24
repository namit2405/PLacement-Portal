import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  APPLIED:      { label: "Applied",      className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  pending:      { label: "Pending",      className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  SHORTLISTED:  { label: "Shortlisted",  className: "bg-blue-100 text-blue-800 border-blue-200" },
  shortlisted:  { label: "Shortlisted",  className: "bg-blue-100 text-blue-800 border-blue-200" },
  SELECTED:     { label: "Selected",     className: "bg-green-100 text-green-800 border-green-200" },
  selected:     { label: "Selected",     className: "bg-green-100 text-green-800 border-green-200" },
  REJECTED:     { label: "Rejected",     className: "bg-red-100 text-red-800 border-red-200" },
  rejected:     { label: "Rejected",     className: "bg-red-100 text-red-800 border-red-200" },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-800" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
