import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/lib/i18n";
import { BOTH_CENTER, BOTH_ZOOM, COUNTRIES, RESOURCE_HUBS, type CountryScope } from "@/lib/countries";

type Report = Tables<"reports">;

interface MapViewProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  highlight?: Report | null;
  radiusKm?: number;
  scope?: CountryScope;
  showHubs?: boolean;
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

function RecenterOnScope({ scope }: { scope: CountryScope }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (scope === "all") {
      map.flyTo(BOTH_CENTER, BOTH_ZOOM, { duration: 0.8 });
    } else {
      const c = COUNTRIES[scope];
      map.flyTo(c.center, c.zoom, { duration: 0.8 });
    }
  }, [scope, map]);
  return null;
}

const hubStyles: Record<string, { color: string; emoji: string }> = {
  shelter: { color: "#7c3aed", emoji: "🏕️" },
  water: { color: "#0891b2", emoji: "🚰" },
  medical: { color: "#db2777", emoji: "⚕️" },
};

function getHubIcon(kind: string) {
  const s = hubStyles[kind] ?? hubStyles.shelter;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:26px;height:26px;
      background:white;
      border-radius:6px;
      border:2px solid ${s.color};
      box-shadow:0 1px 4px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center;
      font-size:13px;
    ">${s.emoji}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
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

export function MapView({
  reports,
  onSelectReport,
  highlight,
  radiusKm,
  scope = "all",
  showHubs = false,
}: MapViewProps) {
  const { t, lang } = useI18n();
  const initial = useMemo(
    () =>
      scope === "all"
        ? { center: BOTH_CENTER, zoom: BOTH_ZOOM }
        : { center: COUNTRIES[scope].center, zoom: COUNTRIES[scope].zoom },
    // initial view only
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const hubs = useMemo(
    () => RESOURCE_HUBS.filter((h) => scope === "all" || h.country === scope),
    [scope],
  );

  return (
    <MapContainer
      center={initial.center}
      zoom={initial.zoom}
      scrollWheelZoom
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds reports={reports} />
      <RecenterOnScope scope={scope} />
      {showHubs &&
        hubs.map((hub) => (
          <Marker key={hub.id} position={[hub.lat, hub.lng]} icon={getHubIcon(hub.kind)}>
            <Popup>
              <div className="min-w-[160px]">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`hub_${hub.kind}` as never)}
                </div>
                <div className="text-sm font-medium">{hub.name[lang]}</div>
              </div>
            </Popup>
          </Marker>
        ))}
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
