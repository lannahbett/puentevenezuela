import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo, Suspense } from "react";
import { MapView } from "@/components/MapView";
import { ReportCard } from "@/components/ReportCard";
import { ReportForm } from "@/components/ReportForm";
import { listReports } from "@/lib/reports.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Map as MapIcon, List, BarChart3 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Report = Tables<"reports">;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Puente Venezuela — Mapa de Necessidades e Ajuda" },
      { name: "description", content: "Mapa interativo de necessidades e ofertas de ajuda para as vítimas dos terremotos na Venezuela." },
      { property: "og:title", content: "Puente Venezuela — Mapa de Necessidades e Ajuda" },
      { property: "og:description", content: "Encontre ou ofereça ajuda em tempo real após os terremotos na Venezuela." },
    ],
  }),
  component: IndexPage,
});

const categoryLabels: Record<string, string> = {
  water: "Água",
  food: "Comida",
  shelter: "Abrigo",
  medicine: "Medicamentos",
  rescue: "Resgate",
  volunteer: "Voluntário",
  transport: "Transporte",
  other: "Outro",
};

function ReportsList({
  reports,
  selectedId,
  onSelect,
}: {
  reports: Report[];
  selectedId: string | null;
  onSelect: (r: Report) => void;
}) {
  return (
    <div className="space-y-3">
      {reports.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum relato encontrado com os filtros selecionados.</p>
        </div>
      )}
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          isSelected={selectedId === report.id}
          onClick={() => onSelect(report)}
        />
      ))}
    </div>
  );
}

function StatsBar({ reports }: { reports: Report[] }) {
  const needs = reports.filter((r) => r.type === "need").length;
  const offers = reports.filter((r) => r.type === "offer").length;
  const inProgress = reports.filter((r) => r.status === "in_progress").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="text-xs">
        <BarChart3 className="mr-1 h-3 w-3" />
        {reports.length} relatos
      </Badge>
      <Badge variant="outline" className="text-xs text-destructive">
        {needs} necessidades
      </Badge>
      <Badge variant="outline" className="text-xs text-emerald-600">
        {offers} ofertas
      </Badge>
      <Badge variant="outline" className="text-xs text-primary">
        {inProgress} em andamento
      </Badge>
      <Badge variant="outline" className="text-xs text-green-600">
        {resolved} resolvidos
      </Badge>
    </div>
  );
}

function IndexPageContent() {
  const { data: reports = [] } = useSuspenseQuery({
    queryKey: ["reports"],
    queryFn: () => listReports(),
  });

  const [typeFilter, setTypeFilter] = useState<"all" | "need" | "offer">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      return true;
    });
  }, [reports, typeFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }, [reports]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatsBar reports={reports} />

          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium ${
                  typeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter("need")}
                className={`px-3 py-1.5 text-xs font-medium border-l border-border ${
                  typeFilter === "need" ? "bg-destructive text-destructive-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                Necessidades
              </button>
              <button
                onClick={() => setTypeFilter("offer")}
                className={`px-3 py-1.5 text-xs font-medium border-l border-border ${
                  typeFilter === "offer" ? "bg-emerald-600 text-white" : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                Ofertas
              </button>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            >
              <option value="all">Todas categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c] ?? c}
                </option>
              ))}
            </select>

            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Relatar
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="flex border-b border-border md:hidden">
        <button
          onClick={() => setMobileView("map")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium ${
            mobileView === "map" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" /> Mapa
        </button>
        <button
          onClick={() => setMobileView("list")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium ${
            mobileView === "list" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <List className="h-3.5 w-3.5" /> Lista ({filteredReports.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className={`flex-1 ${mobileView === "list" ? "hidden md:block" : "block"}`}>
          <MapView
            reports={filteredReports}
            onSelectReport={(r) => {
              setSelectedReport(r);
              setMobileView("list");
            }}
          />
        </div>

        {/* List */}
        <div
          className={`w-full border-l border-border bg-background overflow-y-auto p-4 ${
            mobileView === "map" ? "hidden md:block md:w-96" : "md:w-96"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Relatos ({filteredReports.length})
            </h2>
          </div>
          <ReportsList
            reports={filteredReports}
            selectedId={selectedReport?.id ?? null}
            onSelect={setSelectedReport}
          />
        </div>
      </div>

      <ReportForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function IndexPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <IndexPageContent />
    </Suspense>
  );
}
