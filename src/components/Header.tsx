import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, Map as MapIcon, Home } from "lucide-react";
import { useState } from "react";
import logoUrl from "@/assets/logo.png";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { OfflineIndicator } from "./OfflineIndicator";
import { CountrySelect } from "./CountrySelect";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-bold text-foreground">
          <img src={logoUrl} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
          <span className="truncate text-base sm:text-lg">
            <span className="hidden sm:inline">{t("appName")}</span>
            <span className="sm:hidden">{t("appNameShort")}</span>
          </span>
        </Link>

        <OfflineIndicator />

        <nav className="ml-auto hidden md:flex items-center gap-5 text-sm font-medium">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            {t("nav_home")}
          </Link>
          <Link to="/map" className="text-muted-foreground hover:text-foreground transition-colors">
            {t("nav_map")}
          </Link>
          <Link
            to="/emergency"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav_emergency")}
          </Link>
          <Link
            to="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav_about")}
          </Link>
          <CountrySelect />
          <LanguageToggle />
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          <CountrySelect />
          <LanguageToggle />
          <button
            className="p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <Home className="h-3.5 w-3.5" />
            {t("nav_home")}
          </Link>
          <Link
            to="/map"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <MapIcon className="h-3.5 w-3.5" />
            {t("nav_map")}
          </Link>
          <Link
            to="/emergency"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <Phone className="h-3.5 w-3.5" />
            {t("nav_emergency")}
          </Link>
          <Link
            to="/about"
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav_about")}
          </Link>
        </div>
      )}
    </header>
  );
}
