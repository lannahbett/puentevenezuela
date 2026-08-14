import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, HandHeart, Loader2, MapPin, Send, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useCountry } from "@/lib/country";
import { COUNTRIES, guessCountry, type CountryCode } from "@/lib/countries";
import { createReport } from "@/lib/reports.functions";
import { enqueueReport } from "@/lib/offline-queue";
import { useOfflineQueue } from "@/hooks/use-offline-queue";

const CATEGORIES = [
  { value: "water", emoji: "💧" },
  { value: "food", emoji: "🍞" },
  { value: "shelter", emoji: "🏠" },
  { value: "medicine", emoji: "💊" },
  { value: "rescue", emoji: "🚨" },
  { value: "volunteer", emoji: "🤝" },
  { value: "transport", emoji: "🚗" },
  { value: "other", emoji: "📌" },
] as const;

export function QuickReportForm() {
  const { t } = useI18n();
  const { scope } = useCountry();
  const qc = useQueryClient();
  const { pending, syncing, sync } = useOfflineQueue();

  const [online, setOnline] = useState(true);
  const [type, setType] = useState<"need" | "offer">("need");
  const [category, setCategory] = useState<string>("water");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [locationName, setLocationName] = useState("");
  const [urgency, setUrgency] = useState(4);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);

  const fallbackCountry: CountryCode = scope === "all" ? "VE" : scope;

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    // Capture GPS as soon as the screen opens so it also works while offline.
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  async function submit() {
    if (!title.trim()) {
      toast.error(t("quickNeedTitle"));
      return;
    }
    const lat = coords?.lat ?? COUNTRIES[fallbackCountry].center[0];
    const lng = coords?.lng ?? COUNTRIES[fallbackCountry].center[1];
    const payload = {
      type,
      category,
      title: title.trim().slice(0, 200),
      latitude: lat,
      longitude: lng,
      location_name: locationName.trim() || undefined,
      contact_phone: phone.trim() || undefined,
      urgency,
      country: coords ? guessCountry(lat, lng) : fallbackCountry,
    };

    const reset = () => {
      setTitle("");
      setPhone("");
      setLocationName("");
    };

    if (!navigator.onLine) {
      enqueueReport(payload);
      reset();
      toast.success(t("quickQueued"));
      return;
    }

    setBusy(true);
    try {
      await createReport({ data: payload as never });
      qc.invalidateQueries({ queryKey: ["reports"] });
      reset();
      toast.success(t("quickSent"));
    } catch {
      enqueueReport(payload);
      reset();
      toast.success(t("quickQueued"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
          online
            ? "border-border bg-muted/40 text-muted-foreground"
            : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        }`}
      >
        {online ? <Send className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span>{online ? t("quickOnlineHint") : t("quickOfflineHint")}</span>
      </div>

      {pending > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium">{t("queuePending", { n: pending })}</span>
          <Button size="sm" variant="outline" onClick={() => void sync()} disabled={syncing || !online}>
            {syncing && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
            {t("queueSyncNow")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("need")}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition-colors ${
            type === "need"
              ? "border-destructive bg-destructive/10 text-destructive"
              : "border-border text-muted-foreground"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          {t("needHelp")}
        </button>
        <button
          type="button"
          onClick={() => setType("offer")}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition-colors ${
            type === "offer"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          <HandHeart className="h-4 w-4" />
          {t("offerHelp")}
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t("category")}</p>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] transition-colors ${
                category === c.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span className="text-lg leading-none">{c.emoji}</span>
              {t(`cat_${c.value}` as never)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("quickTitlePlaceholder")}
          maxLength={200}
          aria-label={t("title")}
        />
        <Input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder={COUNTRIES[fallbackCountry].defaultLocationPlaceholder}
          aria-label={t("locationName")}
        />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phone")}
          inputMode="tel"
          aria-label={t("phone")}
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-foreground">
          {t("urgency")}: {urgency}
        </p>
        <input
          type="range"
          min={1}
          max={5}
          value={urgency}
          onChange={(e) => setUrgency(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
          aria-label={t("urgency")}
        />
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {locating
          ? t("quickLocating")
          : coords
            ? t("quickGpsOk", {
                lat: coords.lat.toFixed(4),
                lng: coords.lng.toFixed(4),
              })
            : t("quickGpsFallback")}
      </p>

      <Button className="w-full" size="lg" onClick={() => void submit()} disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {online ? t("send") : t("quickSaveOffline")}
      </Button>
    </div>
  );
}
