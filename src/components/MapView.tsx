import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/lib/i18n";

type Report = Tables<"reports">;

interface MapViewProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  highlight?: Report | null;
  radiusKm?: number;
}

function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length === 0) return;
    const group = L.featureGroup(
      reports.map((r) => L.marker([r.latitude, r.longitude])),
    );
    map.fitBounds(group.getBounds().pad(0.15), { animate: true });
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

const categoryIcons: Record<string, string> = {
  water: "💧",
  food: "🍞",
  shelter: "🏠",
  medicine: "💊",
  rescue: "🚨",
  volunteer: "🤝",
  transport: "🚗",
  other: "📌",
};

function getMarkerIcon(type: string, urgency: number, status: string) {
  let color = type === "need" ? "#ef4444" : "#22c55e";
  if (status === "resolved") color = "#94a3b8";
  else if (status === "in_progress") color = "#f59e0b";
  const size = 24 + urgency * 3;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.5}px;
      color:white;font-weight:bold;
    ">${type === "need" ? "!" : "✓"}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function MapView({ reports, onSelectReport, highlight, radiusKm }: MapViewProps) {
  const { t } = useI18n();
  const center = useMemo(() => [10.48, -66.9] as [number, number], []);

  return (
    <MapContainer
      center={center}
      zoom={7}
      scrollWheelZoom
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds reports={reports} />
      {highlight && radiusKm && (
        <Circle
          center={[highlight.latitude, highlight.longitude]}
          radius={radiusKm * 1000}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08 }}
        />
      )}
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={getMarkerIcon(report.type, report.urgency, report.status)}
          eventHandlers={{
            click: () => onSelectReport(report),
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{categoryIcons[report.category]}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    report.type === "need"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {report.type === "need" ? t("need") : t("offer")}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{report.title}</h3>
              {report.location_name && (
                <p className="text-xs text-muted-foreground mt-1">📍 {report.location_name}</p>
              )}
              <button
                onClick={() => onSelectReport(report)}
                className="mt-2 text-xs font-medium text-blue-600 hover:underline"
              >
                {t("contact")} →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
