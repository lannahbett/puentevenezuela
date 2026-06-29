import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Tables } from "@/integrations/supabase/types";

type Report = Tables<"reports">;

interface MapViewProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length === 0) return;
    const group = L.featureGroup(reports.map((r) => L.marker([r.latitude, r.longitude])));
    map.fitBounds(group.getBounds().pad(0.15), { animate: true });
  }, [map, reports]);
  return null;
}

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

function getMarkerIcon(type: string, urgency: number) {
  const color = type === "need" ? "#ef4444" : "#22c55e";
  const size = 24 + urgency * 4;
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
    ">${type === "need" ? "❗" : "✅"}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function MapView({ reports, onSelectReport }: MapViewProps) {
  const center = useMemo(() => [10.48, -66.9] as [number, number], []);

  return (
    <MapContainer center={center} zoom={7} scrollWheelZoom={true} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds reports={reports} />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={getMarkerIcon(report.type, report.urgency)}
          eventHandlers={{
            click: () => onSelectReport(report),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{categoryIcons[report.category]}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    report.type === "need"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {report.type === "need" ? "Necessidade" : "Oferta"}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{report.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {categoryLabels[report.category] ?? report.category} • Urgência {report.urgency}/5
              </p>
              {report.location_name && (
                <p className="text-xs text-muted-foreground">📍 {report.location_name}</p>
              )}
              {report.description && (
                <p className="text-xs mt-1 line-clamp-3">{report.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
