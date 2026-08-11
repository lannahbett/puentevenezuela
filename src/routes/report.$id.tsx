import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, ArrowLeft, Clock, User } from "lucide-react";
import { getReport } from "@/lib/reports.functions";
import { useI18n } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/countries";
import { AttachmentsGallery } from "@/components/AttachmentsGallery";
import { ReportItems } from "@/components/ReportItems";
import { ReportUpdates } from "@/components/ReportUpdates";

export const Route = createFileRoute("/report/$id")({
  loader: async ({ params }) => {
    const report = await getReport({ data: { id: params.id } });
    if (!report) throw notFound();
    return { report };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Reporte no disponible — Puente Venezuela y Colombia" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const r = loaderData.report;
    const where = r.location_name ?? `${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}`;
    const title = `${r.title} — Puente Venezuela y Colombia`;
    const description = `${r.type === "need" ? "Necesidad" : "Oferta de ayuda"} en ${where}. ${
      r.description ?? ""
    }`.slice(0, 155);
    const url = `https://puentevenezuela.lovable.app/report/${params.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ReportPage,
  errorComponent: () => <NotFound />,
  notFoundComponent: () => <NotFound />,
});

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">Reporte no encontrado / Report not found</p>
      <Link
        to="/map"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Mapa
      </Link>
    </div>
  );
}

function ReportPage() {
  const { report } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const isNeed = report.type === "need";
  const cc = (report.country ?? "VE") as "VE" | "CO";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        to="/map"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("openInMap")}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isNeed ? "bg-destructive text-destructive-foreground" : "bg-emerald-600 text-white"
          }`}
        >
          {isNeed ? t("need") : t("offer")}
        </span>
        <span className="text-xs text-muted-foreground">
          {t(`cat_${report.category}` as never)} · {report.urgency}/5
        </span>
        <span className="text-xs text-muted-foreground">
          {COUNTRIES[cc].flag} {t(`country_${cc}` as never)}
        </span>
      </div>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{report.title}</h1>

      {report.description && (
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{report.description}</p>
      )}

      <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
        {report.location_name && (
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {report.location_name}
          </span>
        )}
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t("postedAt")}:{" "}
          {new Date(report.created_at).toLocaleString(lang === "es" ? "es-VE" : "en-US")}
        </span>
        {report.assigned_to_name && (
          <span className="flex items-center gap-2 text-amber-700">
            <User className="h-4 w-4" />
            {t("assignedTo")}: {report.assigned_to_name}
          </span>
        )}
      </div>

      <div className="mt-6">
        <AttachmentsGallery reportId={report.id} variant="full" />
      </div>

      <div className="mt-8 space-y-8">
        <ReportItems reportId={report.id} />
        <ReportUpdates reportId={report.id} />
      </div>
    </div>
  );
}
