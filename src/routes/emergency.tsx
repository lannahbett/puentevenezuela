import { createFileRoute } from "@tanstack/react-router";
import { Phone, Flame, Shield, Heart, Activity, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { COUNTRIES, COUNTRY_CODES, EMERGENCY_CONTACTS } from "@/lib/countries";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergencia — Puente Venezuela y Colombia" },
      {
        name: "description",
        content:
          "Números oficiales de emergencia en Venezuela y Colombia: 911, 123, bomberos, Cruz Roja, Protección Civil.",
      },
      { property: "og:title", content: "Emergencia — Puente Venezuela y Colombia" },
      {
        property: "og:description",
        content: "Líneas oficiales de emergencia en Venezuela y Colombia.",
      },
    ],
  }),
  component: EmergencyPage,
});

const icons = { phone: Phone, flame: Flame, shield: Shield, heart: Heart, activity: Activity, radio: Radio };
const colors: Record<string, string> = {
  phone: "text-destructive",
  flame: "text-orange-600",
  shield: "text-blue-600",
  heart: "text-destructive",
  activity: "text-amber-600",
  radio: "text-primary",
};

function EmergencyPage() {
  const { t, lang } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("emergencyTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("emergencySubtitle")}</p>
        </div>

        <div className="space-y-8">
          {COUNTRY_CODES.map((code) => (
            <section key={code}>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                {COUNTRIES[code].flag} {COUNTRIES[code].name[lang]}
              </h2>
              <ul className="space-y-3">
                {EMERGENCY_CONTACTS[code].map((c) => {
                  const Icon = icons[c.icon];
                  return (
                    <li key={c.key}>
                      <a
                        href={`tel:${c.number.replace(/[^0-9+]/g, "")}`}
                        className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all"
                      >
                        <div className={`shrink-0 rounded-full bg-muted p-3 ${colors[c.icon]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate">
                            {c.name[lang]}
                          </div>
                          <div className="text-sm text-muted-foreground">{c.number}</div>
                        </div>
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
