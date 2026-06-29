import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background overflow-hidden text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`px-2.5 py-1 transition-colors ${
          lang === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        }`}
        aria-label="Español"
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 transition-colors ${
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
