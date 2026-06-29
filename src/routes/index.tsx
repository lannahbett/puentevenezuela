import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { MapView } from "@/components/MapView";
import { ReportCard } from "@/components/ReportCard";
import { ReportForm } from "@/components/ReportForm";
import { ReportDetail } from "@/components/ReportDetail";
import { listReports } from "@/lib/reports.functions";
import { Button } from "@/components/ui/button";
import { Plus, Map as MapIcon, List, AlertCircle, HandHeart } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

type Report = Tables<"reports">;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Puente Venezuela — Mapa de ayuda" },
      {
        name: "description",
        content:
          "Mapa interactivo de necesidades y ofertas de ayuda tras los terremotos en Venezuela.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => listReports(),
  });

  // realtime
  useEffect(() => {
    const ch = supabase
      .channel("reports-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        () => qc.invalidateQueries({ queryKey: ["reports"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  const [typeFilter, setTypeFilter] = useState<"all" | "need" | "offer">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  const filteredReports = useMemo(
    () =>
      reports.filter((r) => {
        if (typeFilter !== "all" && r.type !== typeFilter) return false;
        if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
        return true;
      }),
    [reports, typeFilter, categoryFilter],
  );

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
              · {reports.length} {t("reportsCount")}
            </span>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)} className="h-8">
            <Plus className="h-3.5 w-3.5" />
            {t("report")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-background px-3 py-2 overflow-x-auto">
        <div className="mx-auto max-w-7xl flex items-center gap-2 min-w-max">
          <div className="flex rounded-full border border-border overflow-hidden text-xs font-medium">
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          >
            <option value="all">{t("allCategories")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {t(`cat_${c}` as never)}
              </option>
            ))}
          </select>
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
          />
        </div>

        <div
          className={`w-full border-l border-border bg-background overflow-y-auto p-3 space-y-2 ${
            mobileView === "map" ? "hidden md:block md:w-96" : "md:w-96"
          }`}
        >
          {filteredReports.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("noReports")}</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedReport?.id === report.id}
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
