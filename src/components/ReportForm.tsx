import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReport, findSimilarReports } from "@/lib/reports.functions";
import { COUNTRIES, guessCountry, type CountryCode } from "@/lib/countries";
import { useCountry } from "@/lib/country";
import { uploadAttachment } from "@/lib/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { MapPin, ImagePlus, X, AlertTriangle, Plus } from "lucide-react";


const CATEGORIES = [
  "water",
  "food",
  "shelter",
  "medicine",
  "rescue",
  "volunteer",
  "transport",
  "other",
] as const;

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export function ReportForm({ open, onOpenChange, defaultLat, defaultLng }: ReportFormProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { scope } = useCountry();
  const initialCountry: CountryCode = scope === "all" ? "VE" : scope;
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [items, setItems] = useState<{ label: string; qty: string }[]>([]);
  const [duplicates, setDuplicates] = useState<
    { id: string; title: string; location_name: string | null }[]
  >([]);
  const [checkingDup, setCheckingDup] = useState(false);
  const [type, setType] = useState<"need" | "offer">("need");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("water");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState(
    defaultLat?.toString() ?? COUNTRIES[initialCountry].center[0].toString(),
  );
  const [longitude, setLongitude] = useState(
    defaultLng?.toString() ?? COUNTRIES[initialCountry].center[1].toString(),
  );
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [urgency, setUrgency] = useState("3");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: createReport,
    onSuccess: async (created) => {
      if (photos.length && created?.id) {
        setUploading(true);
        try {
          for (const file of photos) {
            await uploadAttachment(created.id, file);
          }
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Upload error");
        }
        setUploading(false);
      }
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["attachments", created.id] });
      toast.success(t("successReport"));
      resetForm();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("errorReport"));
    },
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setLocationName("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setUrgency("3");
    setPhotos([]);
    setItems([]);
    setDuplicates([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: > 5MB`);
        continue;
      }
      valid.push(f);
    }
    setPhotos((prev) => [...prev, ...valid].slice(0, 5));
  }


  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error(t("geoFailed"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(5));
        setLongitude(pos.coords.longitude.toFixed(5));
        setCountry(guessCountry(pos.coords.latitude, pos.coords.longitude));
      },
      () => toast.error(t("geoFailed")),
    );
  }

  function submitNow(lat: number, lng: number) {
    mutation.mutate({
      data: {
        type,
        category,
        title,
        description: description || undefined,
        latitude: lat,
        longitude: lng,
        location_name: locationName || undefined,
        contact_name: contactName || undefined,
        contact_phone: contactPhone || undefined,
        contact_email: contactEmail || undefined,
        urgency: parseInt(urgency, 10),
        country,
        items: items
          .filter((i) => i.label.trim())
          .map((i) => ({
            label: i.label.trim(),
            quantity_needed: Math.max(1, parseInt(i.qty || "1", 10)),
          })),
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error(t("invalidCoords"));
      return;
    }
    if (duplicates.length > 0) {
      submitNow(lat, lng);
      return;
    }
    setCheckingDup(true);
    try {
      const similar = await findSimilarReports({
        data: { category, type, latitude: lat, longitude: lng },
      });
      if (similar.length > 0) {
        setDuplicates(similar);
        setCheckingDup(false);
        return;
      }
    } catch {
      // duplicate check is best-effort
    }
    setCheckingDup(false);
    submitNow(lat, lng);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newReport")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "need" ? "destructive" : "outline"}
              onClick={() => setType("need")}
            >
              {t("needHelp")}
            </Button>
            <Button
              type="button"
              variant={type === "offer" ? "default" : "outline"}
              onClick={() => setType("offer")}
              className={type === "offer" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {t("offerHelp")}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t("country")}</Label>
            <Select
              value={country}
              onValueChange={(v) => {
                const c = v as CountryCode;
                setCountry(c);
                setLatitude(COUNTRIES[c].center[0].toString());
                setLongitude(COUNTRIES[c].center[1].toString());
              }}
            >
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["VE", "CO"] as const).map((c) => (
                  <SelectItem key={c} value={c}>
                    {COUNTRIES[c].flag} {t(`country_${c}` as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("category")}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`cat_${c}` as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t("title")} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationName">{t("locationName")}</Label>
            <Input
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder={COUNTRIES[country].defaultLocationPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude">{t("latitude")} *</Label>
              <Input id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">{t("longitude")} *</Label>
              <Input id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={useMyLocation} className="w-full">
            <MapPin className="h-3.5 w-3.5" />
            {t("useMyLocation")}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="urgency">{t("urgency")}</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger id="urgency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {t(`urg_${n}` as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contactName">{t("contactName")}</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">{t("phone")}</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">{t("email")}</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label>{t("itemsTitle")}</Label>
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={it.label}
                  placeholder={t("itemLabel")}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, label: e.target.value } : p)),
                    )
                  }
                />
                <Input
                  value={it.qty}
                  inputMode="numeric"
                  aria-label={t("itemQty")}
                  className="w-16"
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, idx) =>
                        idx === i ? { ...p, qty: e.target.value.replace(/[^0-9]/g, "") } : p,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t("cancel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {items.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((prev) => [...prev, { label: "", qty: "1" }])}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("itemAdd")}
              </Button>
            )}
          </div>

          {duplicates.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                {t("dupTitle")}
              </div>
              <p className="mt-1 text-xs text-amber-800/80">{t("dupBody")}</p>
              <ul className="mt-2 space-y-1">
                {duplicates.map((d) => (
                  <li key={d.id} className="text-xs text-amber-900">
                    • {d.title}
                    {d.location_name ? ` — ${d.location_name}` : ""}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDuplicates([]);
                    onOpenChange(false);
                  }}
                >
                  {t("dupCancel")}
                </Button>
              </div>
            </div>
          )}

          {/* Photos */}
          <div className="space-y-2">
            <Label>{t("photos")}</Label>
            <p className="text-xs text-muted-foreground">{t("photoLimit")}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="flex flex-wrap gap-2">
              {photos.map((file, i) => (
                <div key={i} className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                  <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-black/70 text-white rounded-bl p-0.5"
                    aria-label={t("removePhoto")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="h-16 w-16 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending || uploading || checkingDup}>
            {uploading
              ? t("uploadingPhotos")
              : mutation.isPending || checkingDup
                ? t("sending")
                : duplicates.length > 0
                  ? t("dupContinue")
                  : t("send")}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}
