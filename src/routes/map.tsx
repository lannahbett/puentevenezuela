import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { MapView } from "@/components/MapView";
import { ReportCard } from "@/components/ReportCard";
import { ReportForm } from "@/components/ReportForm";
import { ReportDetail } from "@/components/ReportDetail";
import { listReports } from "@/lib/reports.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  Map as MapIcon,
  List,
  AlertCircle,
  HandHeart,
  Search,
  SlidersHorizontal,
  X,
  Image as ImageIcon,
  Navigation,
  Download,
  Building2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/lib/country";
import { COUNTRIES } from "@/lib/countries";
import { distanceKm } from "@/lib/distance";
import { isStale } from "@/lib/stale";
import { toast } from "sonner";

type Report = Tables<"reports">;

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Mapa de ayuda — Puente Venezuela y Colombia" },
      {
        name: "description",
        content:
          "Mapa interactivo de necesidades y ofertas de ayuda tras los terremotos en Venezuela y Colombia.",
      },
      { property: "og:title", content: "Mapa de ayuda — Puente Venezuela y Colombia" },
      {
        property: "og:description",
        content: "Necesidades y ofertas de ayuda en vivo en Venezuela y Colombia.",
      },
    ],
  }),
  component: MapPage,
});

type StatusFilter = "all" | "pending" | "in_progress" | "resolved";
type Period = "all" | "24h" | "7d" | "30d";

function MapPage() {
  const { t } = useI18n();
  const { scope } = useCountry();
  const qc = useQueryClient();
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => listReports(),
  });
  const { data: attachmentRows = [] } = useQuery({
    queryKey: ["attachment-flags"],
    queryFn: async () => {
      const { data } = await supabase.from("report_attachments").select("report_id");
      return (data ?? []).map((r: { report_id: string }) => r.report_id);
    },
  });
  const reportsWithPhotos = useMemo(() => new Set(attachmentRows), [attachmentRows]);

  useEffect(() => {
    const ch = supabase
      .channel("reports-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        () => qc.invalidateQueries({ queryKey: ["reports"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "report_attachments" },
        () => {
          qc.invalidateQueries({ queryKey: ["attachment-flags"] });
          qc.invalidateQueries({ queryKey: ["attachments"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "need" | "offer">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [period, setPeriod] = useState<Period>("all");
  const [minUrgency, setMinUrgency] = useState(1);
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [onlyStale, setOnlyStale] = useState(false);
  const [showHubs, setShowHubs] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  function locateMe() {
    if (!navigator.geolocation) {
      toast.error(t("geoFailed"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error(t("geoFailed")),
    );
  }

  const clearAll = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPeriod("all");
    setMinUrgency(1);
    setOnlyWithPhotos(false);
    setOnlyStale(false);
  };

  const activeCount =
    (search ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (period !== "all" ? 1 : 0) +
    (minUrgency > 1 ? 1 : 0) +
    (onlyWithPhotos ? 1 : 0) +
    (onlyStale ? 1 : 0);

  const filteredReports = useMemo(() => {
    const now = Date.now();
    const periodMs: Record<Period, number> = {
      all: Infinity,
      "24h": 1000 * 60 * 60 * 24,
      "7d": 1000 * 60 * 60 * 24 * 7,
      "30d": 1000 * 60 * 60 * 24 * 30,
    };
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (scope !== "all" && (r.country ?? "VE") !== scope) return false;
      if (onlyStale && !isStale(r)) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (r.urgency < minUrgency) return false;
      if (period !== "all") {
        const age = now - new Date(r.created_at).getTime();
        if (age > periodMs[period]) return false;
      }
      if (onlyWithPhotos && !reportsWithPhotos.has(r.id)) return false;
      if (q) {
        const hay = `${r.title} ${r.description ?? ""} ${r.location_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    reports,
    typeFilter,
    categoryFilter,
    statusFilter,
    period,
    minUrgency,
    onlyWithPhotos,
    search,
    reportsWithPhotos,
    scope,
    onlyStale,
  ]);

  const listReportsSorted = useMemo(() => {
    if (!userPos) return filteredReports;
    return [...filteredReports].sort(
      (a, b) =>
        distanceKm(userPos.lat, userPos.lng, a.latitude, a.longitude) -
        distanceKm(userPos.lat, userPos.lng, b.latitude, b.longitude),
    );
  }, [filteredReports, userPos]);

  function exportCsv() {
    const header = [
      "id",
      "country",
      "type",
      "category",
      "title",
      "description",
      "location_name",
      "latitude",
      "longitude",
      "urgency",
      "status",
      "assigned_to_name",
      "created_at",
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      header.join(","),
      ...filteredReports.map((r) =>
        header.map((h) => esc((r as unknown as Record<string, unknown>)[h])).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `puente-reportes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }, [reports]);

  const needs = reports.filter((r) => r.type === "need").length;
  const offers = reports.filter((r) => r.type === "offer").length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Stats strip */}
      <div className="border-b border-border bg-background px-3 py-2">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center gap-1 text-destructive font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              {needs}
              <span className="hidden sm:inline font-normal text-muted-foreground">
                {t("needs").toLowerCase()}
              </span>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <HandHeart className="h-3.5 w-3.5" />
              {offers}
              <span className="hidden sm:inline font-normal text-muted-foreground">
                {t("offers").toLowerCase()}
              </span>
            </span>
            <span className="text-muted-foreground hidden md:inline">
              · {t("filter_results", { n: filteredReports.length })}
            </span>
          </div>
          <span className="hidden lg:inline text-muted-foreground">
            {scope === "all"
              ? t("country_all")
              : `${COUNTRIES[scope].flag} ${t(`country_${scope}` as never)}`}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={exportCsv}
            className="h-8 hidden sm:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportCsv")}
          </Button>
          <Button size="sm" onClick={() => setFormOpen(true)} className="h-8">
            <Plus className="h-3.5 w-3.5" />
            {t("report")}
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="border-b border-border bg-background px-3 py-2">
        <div className="mx-auto max-w-7xl flex items-center gap-2">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("filter_searchPlaceholder")}
              className="h-8 pl-7 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={t("filter_clear")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="hidden md:flex rounded-full border border-border overflow-hidden text-xs font-medium shrink-0">
            {(["all", "need", "offer"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setTypeFilter(v)}
                className={`px-3 py-1.5 transition-colors ${
                  typeFilter === v
                    ? v === "need"
                      ? "bg-destructive text-destructive-foreground"
                      : v === "offer"
                        ? "bg-emerald-600 text-white"
                        : "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {v === "all" ? t("all") : v === "need" ? t("needs") : t("offers")}
              </button>
            ))}
          </div>

          <Button
            variant={userPos ? "default" : "outline"}
            size="sm"
            className="h-8 shrink-0"
            onClick={() => (userPos ? setUserPos(null) : locateMe())}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("nearby")}</span>
          </Button>

          <Button
            variant={showHubs ? "default" : "outline"}
            size="sm"
            className="h-8 shrink-0"
            onClick={() => setShowHubs((v) => !v)}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{t("hubsToggle")}</span>
          </Button>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("filter_more")}</span>
                {activeCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm z-[2000] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t("filter_more")}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                {/* Type (mobile) */}
                <div className="md:hidden">
                  <Label>{t("need")}/{t("offer")}</Label>
                  <div className="mt-1 flex rounded-md border border-border overflow-hidden text-xs">
                    {(["all", "need", "offer"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setTypeFilter(v)}
                        className={`flex-1 py-1.5 ${
                          typeFilter === v
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {v === "all" ? t("all") : v === "need" ? t("needs") : t("offers")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t("category")}</Label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("allCategories")}</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {t(`cat_${c}` as never)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>{t("filter_status")}</Label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("all")}</option>
                    <option value="pending">{t("pending")}</option>
                    <option value="in_progress">{t("statusInProgress")}</option>
                    <option value="resolved">{t("statusResolved")}</option>
                  </select>
                </div>

                <div>
                  <Label>{t("filter_period")}</Label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as Period)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("filter_period_all")}</option>
                    <option value="24h">{t("filter_period_24h")}</option>
                    <option value="7d">{t("filter_period_7d")}</option>
                    <option value="30d">{t("filter_period_30d")}</option>
                  </select>
                </div>

                <div>
                  <Label>
                    {t("filter_minUrgency")}: {minUrgency}/5
                  </Label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={minUrgency}
                    onChange={(e) => setMinUrgency(parseInt(e.target.value))}
                    className="mt-2 w-full"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyWithPhotos}
                    onChange={(e) => setOnlyWithPhotos(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  {t("filter_withPhotos")}
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyStale}
                    onChange={(e) => setOnlyStale(e.target.checked)}
                    className="h-4 w-4"
                  />
                  {t("filter_onlyStale")}
                </label>

                <Button variant="outline" onClick={exportCsv} className="w-full sm:hidden">
                  <Download className="h-4 w-4" />
                  {t("exportCsv")}
                </Button>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={clearAll} className="flex-1">
                    {t("filter_clear")}
                  </Button>
                  <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                    {t("filter_apply")}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-8 text-xs text-muted-foreground hidden sm:flex"
            >
              <X className="h-3 w-3" />
              {t("filter_clear")}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="flex border-b border-border md:hidden">
        <button
          onClick={() => setMobileView("map")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium ${
            mobileView === "map"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" /> {t("mapView")}
        </button>
        <button
          onClick={() => setMobileView("list")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium ${
            mobileView === "list"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          <List className="h-3.5 w-3.5" /> {t("list")} ({filteredReports.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className={`flex-1 relative ${mobileView === "list" ? "hidden md:block" : "block"}`}>
          <MapView
            reports={filteredReports}
            onSelectReport={(r) => setSelectedReport(r)}
            highlight={selectedReport}
            scope={scope}
            showHubs={showHubs}
          />
        </div>

        <div
          className={`w-full border-l border-border bg-background overflow-y-auto p-3 space-y-2 ${
            mobileView === "map" ? "hidden md:block md:w-96" : "md:w-96"
          }`}
        >
          {userPos && (
            <div className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
              {t("nearbyOn")}
            </div>
          )}
          {listReportsSorted.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("noReports")}</p>
            </div>
          ) : (
            listReportsSorted.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedReport?.id === report.id}
                distanceLabel={
                  userPos
                    ? t("distanceAway", {
                        km: distanceKm(
                          userPos.lat,
                          userPos.lng,
                          report.latitude,
                          report.longitude,
                        ).toFixed(1),
                      })
                    : undefined
                }
                onClick={() => setSelectedReport(report)}
              />
            ))
          )}
        </div>
      </div>

      <ReportForm open={formOpen} onOpenChange={setFormOpen} />
      <ReportDetail
        report={selectedReport}
        allReports={reports}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}
