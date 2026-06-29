import type { Tables } from "@/integrations/supabase/types";
import { MapPin, Phone, User, Clock, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AttachmentsGallery } from "./AttachmentsGallery";


type Report = Tables<"reports">;

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
  isSelected?: boolean;
  distanceLabel?: string;
}

export function ReportCard({ report, onClick, isSelected, distanceLabel }: ReportCardProps) {
  const { t } = useI18n();
  const isNeed = report.type === "need";

  const statusLabels: Record<string, string> = {
    pending: t("pending"),
    in_progress: t("statusInProgress"),
    resolved: t("statusResolved"),
  };
  const statusClasses: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-green-100 text-green-700",
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md hover:border-primary/50 ${
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              isNeed ? "bg-destructive/10 text-destructive" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isNeed ? t("need") : t("offer")}
          </span>
          <span className="text-xs text-muted-foreground">
            {t(`cat_${report.category}` as never)}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClasses[report.status]}`}
        >
          {statusLabels[report.status]}
        </span>
      </div>

      <h3 className="mt-2 font-semibold text-sm text-foreground line-clamp-2">{report.title}</h3>

      {report.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{report.description}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {report.location_name && (
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{report.location_name}</span>
          </span>
        )}
        {distanceLabel && <span className="text-primary font-medium">{distanceLabel}</span>}
        {report.contact_phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {report.contact_phone}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {report.urgency}/5
        </span>
        {report.assigned_to_name && (
          <span className="flex items-center gap-1 text-amber-700">
            <User className="h-3 w-3" />
            {report.assigned_to_name}
          </span>
        )}
        {report.status === "resolved" && (
          <CheckCircle2 className="h-3 w-3 text-green-600" />
        )}
      </div>
    </div>
  );
}
