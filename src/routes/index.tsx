import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listReports } from "@/lib/reports.functions";
import { Button } from "@/components/ui/button";
import {
  Map as MapIcon,
  Plus,
  ShieldCheck,
  Users,
  HeartHandshake,
  Phone,
  ArrowRight,
  Droplets,
  UtensilsCrossed,
  Home as HomeIcon,
  Stethoscope,
  LifeBuoy,
  HandHeart,
  Truck,
  Package,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import heroAsset from "@/assets/hero-landing.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Puente Venezuela y Colombia — Coordinación humanitaria en tiempo real" },
      {
        name: "description",
        content:
          "Plataforma abierta que conecta necesidades y ofertas de ayuda tras los terremotos en Venezuela y Colombia. Mapa en vivo, sin registro, gratis.",
      },
      {
        property: "og:title",
        content: "Puente Venezuela y Colombia — Coordinación humanitaria en tiempo real",
      },
      {
        property: "og:description",
        content: "Mapa en vivo de necesidades y ofertas de ayuda en Venezuela y Colombia.",
      },
      { property: "og:image", content: heroAsset.url },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://puentevenezuela.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Puente Venezuela y Colombia — Coordinación humanitaria en tiempo real",
      },
      {
        name: "twitter:description",
        content: "Mapa en vivo de necesidades y ofertas de ayuda en Venezuela y Colombia.",
      },
      { name: "twitter:image", content: heroAsset.url },
    ],
    links: [{ rel: "canonical", href: "https://puentevenezuela.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Puente Venezuela y Colombia",
          url: "https://puentevenezuela.lovable.app/",
          inLanguage: ["es", "en"],
          description:
            "Plataforma abierta que conecta necesidades y ofertas de ayuda tras los terremotos en Venezuela y Colombia.",
          publisher: {
            "@type": "Organization",
            name: "Puente Venezuela y Colombia",
            url: "https://puentevenezuela.lovable.app/",
          },
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { t } = useI18n();
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => listReports(),
  });

  const stats = {
    active: reports.filter((r) => r.status !== "resolved").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    volunteers: new Set(
      reports.filter((r) => r.assigned_to_name).map((r) => r.assigned_to_name),
    ).size,
  };

  const categories = [
    { key: "water", Icon: Droplets, color: "text-sky-600 bg-sky-50" },
    { key: "food", Icon: UtensilsCrossed, color: "text-orange-600 bg-orange-50" },
    { key: "shelter", Icon: HomeIcon, color: "text-amber-700 bg-amber-50" },
    { key: "medicine", Icon: Stethoscope, color: "text-rose-600 bg-rose-50" },
    { key: "rescue", Icon: LifeBuoy, color: "text-red-600 bg-red-50" },
    { key: "volunteer", Icon: HandHeart, color: "text-emerald-600 bg-emerald-50" },
    { key: "transport", Icon: Truck, color: "text-indigo-600 bg-indigo-50" },
    { key: "other", Icon: Package, color: "text-slate-600 bg-slate-100" },
  ] as const;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroAsset.url}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {t("landing_statsTitle")}
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
              {t("landing_heroTitle")}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-foreground/80 max-w-xl">
              {t("landing_heroSubtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="text-base">
                <Link to="/map">
                  <MapIcon className="h-4 w-4" />
                  {t("landing_ctaMap")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/map" search={{ openForm: true } as never}>
                  <Plus className="h-4 w-4" />
                  {t("landing_ctaReport")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-3 gap-4 sm:gap-8">
          <StatCard value={stats.active} label={t("landing_stat_active")} tone="destructive" />
          <StatCard value={stats.resolved} label={t("landing_stat_resolved")} tone="emerald" />
          <StatCard value={stats.volunteers} label={t("landing_stat_volunteers")} tone="primary" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t("landing_howTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("landing_howSubtitle")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <StepCard
            number="1"
            title={t("landing_step1")}
            body={t("landing_step1Body")}
            Icon={MapIcon}
          />
          <StepCard
            number="2"
            title={t("landing_step2")}
            body={t("landing_step2Body")}
            Icon={HeartHandshake}
          />
          <StepCard
            number="3"
            title={t("landing_step3")}
            body={t("landing_step3Body")}
            Icon={ShieldCheck}
          />
        </div>
      </section>

      {/* For whom */}
      <section className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center">
            {t("landing_forWhoTitle")}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <AudienceCard
              title={t("landing_for_victims")}
              body={t("landing_for_victimsBody")}
              accent="bg-destructive/10 text-destructive"
              Icon={LifeBuoy}
            />
            <AudienceCard
              title={t("landing_for_volunteers")}
              body={t("landing_for_volunteersBody")}
              accent="bg-emerald-100 text-emerald-700"
              Icon={HandHeart}
            />
            <AudienceCard
              title={t("landing_for_ngos")}
              body={t("landing_for_ngosBody")}
              accent="bg-primary/10 text-primary"
              Icon={Users}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center">
          {t("landing_categoriesTitle")}
        </h2>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(({ key, Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition"
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {t(`cat_${key}` as never)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency callout */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl bg-destructive text-destructive-foreground p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t("landing_emergencyTitle")}
            </h3>
            <p className="mt-1 text-destructive-foreground/90 text-sm">
              {t("landing_emergencyBody")}
            </p>
          </div>
          <Button asChild variant="secondary" size="lg">
            <Link to="/emergency">
              {t("landing_emergencyCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t("landing_aboutTitle")}
          </h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">{t("landing_aboutBody")}</p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link to="/map">
                <MapIcon className="h-4 w-4" />
                {t("landing_ctaMap")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Puente Venezuela</div>
          <div>{t("landing_footerRights")}</div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "destructive" | "emerald" | "primary";
}) {
  const toneClass =
    tone === "destructive"
      ? "text-destructive"
      : tone === "emerald"
        ? "text-emerald-600"
        : "text-primary";
  return (
    <div className="text-center">
      <div className={`text-3xl sm:text-5xl font-bold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  body,
  Icon,
}: {
  number: string;
  title: string;
  body: string;
  Icon: typeof MapIcon;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          {number}
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function AudienceCard({
  title,
  body,
  accent,
  Icon,
}: {
  title: string;
  body: string;
  accent: string;
  Icon: typeof MapIcon;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 hover:shadow-md transition">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
