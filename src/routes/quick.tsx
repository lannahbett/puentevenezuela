import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, ArrowRight } from "lucide-react";
import { QuickReportForm } from "@/components/QuickReportForm";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/quick")({
  head: () => ({
    meta: [
      { title: "Reporte rápido offline — Puente Venezuela y Colombia" },
      {
        name: "description",
        content:
          "Envía una necesidad u oferta de ayuda en segundos, incluso sin internet: el reporte se guarda y se sincroniza solo al recuperar la señal.",
      },
      { property: "og:title", content: "Reporte rápido offline — Puente Venezuela y Colombia" },
      {
        property: "og:description",
        content: "Reporta ayuda en segundos, funciona sin conexión y sincroniza automáticamente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Reporte rápido offline — Puente Venezuela y Colombia" },
      {
        name: "twitter:description",
        content: "Reporta ayuda en segundos, funciona sin conexión y sincroniza automáticamente.",
      },
    ],
    links: [{ rel: "canonical", href: "https://puentevenezuela.lovable.app/quick" }],
  }),
  component: QuickPage,
});

function QuickPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            {t("quickBadge")}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {t("quickTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("quickSubtitle")}</p>
        </div>

        <QuickReportForm />

        <div className="mt-8 text-center">
          <Link
            to="/map"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("quickFullForm")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
