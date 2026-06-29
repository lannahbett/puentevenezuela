import { useState } from "react";
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
import { createReport } from "@/lib/reports.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { MapPin } from "lucide-react";

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
  const [type, setType] = useState<"need" | "offer">("need");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("water");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState(defaultLat?.toString() ?? "10.48");
  const [longitude, setLongitude] = useState(defaultLng?.toString() ?? "-66.9");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [urgency, setUrgency] = useState("3");

  const mutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
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
      },
      () => toast.error(t("geoFailed")),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error(t("invalidCoords"));
      return;
    }
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
      },
    });
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
              placeholder="Caracas, El Hatillo"
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

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? t("sending") : t("send")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
