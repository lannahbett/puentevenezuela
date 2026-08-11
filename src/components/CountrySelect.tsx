import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCountry } from "@/lib/country";
import { COUNTRIES, type CountryScope } from "@/lib/countries";

export function CountrySelect({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { scope, setScope } = useCountry();

  return (
    <label
      className={`relative inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs font-medium ${className}`}
    >
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="sr-only">{t("country")}</span>
      <select
        value={scope}
        onChange={(e) => setScope(e.target.value as CountryScope)}
        className="bg-transparent pr-1 text-xs font-medium outline-none"
      >
        <option value="all">{t("country_all")}</option>
        <option value="VE">
          {COUNTRIES.VE.flag} {t("country_VE")}
        </option>
        <option value="CO">
          {COUNTRIES.CO.flag} {t("country_CO")}
        </option>
      </select>
    </label>
  );
}
