import { createFileRoute } from "@tanstack/react-router";
import { Phone, Flame, Shield, Heart, Activity, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergencia — Puente Venezuela" },
      {
        name: "description",
        content: "Números oficiales de emergencia en Venezuela: 911, bomberos, Cruz Roja, Protección Civil.",
      },
    ],
  }),
  component: EmergencyPage,
});

const contacts = [
  { key: "911", name: { es: "Emergencias generales", en: "General emergencies" }, number: "911", icon: Phone, color: "text-destructive" },
  { key: "bomberos", name: { es: "Bomberos", en: "Fire department" }, number: "171", icon: Flame, color: "text-orange-600" },
  { key: "pc", name: { es: "Protección Civil", en: "Civil Protection" }, number: "0800-3625428", icon: Shield, color: "text-blue-600" },
  { key: "cruzroja", name: { es: "Cruz Roja Venezolana", en: "Venezuelan Red Cross" }, number: "+58 212 571-4380", icon: Heart, color: "text-destructive" },
  { key: "funvisis", name: { es: "FUNVISIS (sismología)", en: "FUNVISIS (seismology)" }, number: "+58 212 257-7672", icon: Activity, color: "text-amber-600" },
  { key: "radio", name: { es: "Radio nacional (info)", en: "National radio (info)" }, number: "630 AM / 91.1 FM", icon: Radio, color: "text-primary" },
];

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

        <ul className="space-y-3">
          {contacts.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.key}>
                <a
                  href={`tel:${c.number.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className={`shrink-0 rounded-full bg-muted p-3 ${c.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground truncate">{c.name[lang]}</div>
                    <div className="text-sm text-muted-foreground">{c.number}</div>
                  </div>
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
