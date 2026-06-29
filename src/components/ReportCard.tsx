import type { Tables } from "@/integrations/supabase/types";
import { MapPin, Phone, Mail, User, Clock } from "lucide-react";

type Report = Tables<"reports">;

const categoryLabels: Record<string, string> = {
  water: "Água",
  food: "Comida",
  shelter: "Abrigo",
  medicine: "Medicamentos",
  rescue: "Resgate",
  volunteer: "Voluntário",
  transport: "Transporte",
  other: "Outro",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  resolved: "Resolvido",
};

const statusClasses: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  resolved: "bg-green-100 text-green-700",
};

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ReportCard({ report, onClick, isSelected }: ReportCardProps) {
  const isNeed = report.type === "need";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isNeed ? "bg-destructive/10 text-destructive" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isNeed ? "Necessidade" : "Oferta"}
          </span>
          <span className="text-xs text-muted-foreground">
            {categoryLabels[report.category] ?? report.category}
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[report.status]}`}
        >
          {statusLabels[report.status]}
        </span>
      </div>

      <h3 className="mt-2 font-semibold text-sm text-foreground">{report.title}</h3>

      {report.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{report.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {report.location_name && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.location_name}
          </span>
        )}
        {report.contact_name && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {report.contact_name}
          </span>
        )}
        {report.contact_phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {report.contact_phone}
          </span>
        )}
        {report.contact_email && (
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {report.contact_email}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Urgência {report.urgency}/5</span>
      </div>
    </div>
  );
}
