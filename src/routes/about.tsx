import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Users, Radio, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import logoUrl from "@/assets/logo.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Acerca de — Puente Venezuela" },
      {
        name: "description",
        content:
          "Plataforma de coordinación humanitaria para conectar necesidades y ofertas de ayuda en Venezuela.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <img src={logoUrl} alt="" width={64} height={64} className="mx-auto h-16 w-16" />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {t("appName")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("tagline")}</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              {t("about_what")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{t("about_whatBody")}</p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("about_how")}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Step icon={<MapPin className="h-7 w-7 text-primary" />} title={t("about_step1")} body={t("about_step1Body")} />
              <Step icon={<Users className="h-7 w-7 text-primary" />} title={t("about_step2")} body={t("about_step2Body")} />
              <Step icon={<Radio className="h-7 w-7 text-primary" />} title={t("about_step3")} body={t("about_step3Body")} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("about_privacy")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about_privacyBody")}</p>
          </section>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              ← {t("back")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
