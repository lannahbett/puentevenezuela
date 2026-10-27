import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/lib/i18n";
import { distanceKm } from "@/lib/distance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignReport, revealReportContact, updateStatus } from "@/lib/reports.functions";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Mail,
  User,
  Share2,
  CheckCircle2,
  RotateCcw,
  HandHeart,
} from "lucide-react";
import { AttachmentsGallery } from "./AttachmentsGallery";
import { ReportItems } from "./ReportItems";
import { ReportUpdates } from "./ReportUpdates";
import { COUNTRIES } from "@/lib/countries";


type Report = Tables<"reports">;

interface ReportDetailProps {
  report: Report | null;
  allReports: Report[];
  onClose: () => void;
}

export function ReportDetail({ report, allReports, onClose }: ReportDetailProps) {
  const { t, lang } = useI18n();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const qc = useQueryClient();
  const [radius, setRadius] = useState(20);
  const [showAssign, setShowAssign] = useState(false);
  const [assignName, setAssignName] = useState("");
  const [assignContact, setAssignContact] = useState("");
  const [showContact, setShowContact] = useState(false);

  const contactQuery = useQuery({
    queryKey: ["report-contact", report?.id],
    queryFn: () => revealReportContact({ data: { reportId: report!.id } }),
    enabled: !!report && showContact,
  });

  const assign = useMutation({
    mutationFn: assignReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success(t("successAssign"));
      setShowAssign(false);
      setAssignName("");
      setAssignContact("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const status = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success(t("successStatus"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const matches = useMemo(() => {
    if (!report) return [];
    const opposite = report.type === "need" ? "offer" : "need";
    return allReports
      .filter(
        (r) =>
          r.id !== report.id &&
          r.type === opposite &&
          r.category === report.category &&
          r.status !== "resolved",
      )
      .map((r) => ({
        ...r,
        distance: distanceKm(report.latitude, report.longitude, r.latitude, r.longitude),
      }))
      .filter((r) => r.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }, [report, allReports, radius]);

  function shareWhatsApp(r: Report) {
    const label = r.type === "need" ? t("need") : t("offer");
    const where = r.location_name ?? `${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}`;
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/report/${r.id}` : "";
    const text = `[${label}] ${r.title}\n📍 ${where}\n${url}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank", "noopener");
  }

  if (!report) return null;

  const isNeed = report.type === "need";
  const isResolved = report.status === "resolved";

  return (
    <Sheet open={!!report} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-0 z-[2000]"
      >
        <div className={`px-5 pt-5 pb-4 ${isNeed ? "bg-destructive/5" : "bg-emerald-50"}`}>
          <SheetHeader>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  isNeed ? "bg-destructive text-destructive-foreground" : "bg-emerald-600 text-white"
                }`}
              >
                {isNeed ? t("need") : t("offer")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(`cat_${report.category}` as never)} · {report.urgency}/5
              </span>
              <span className="text-xs text-muted-foreground">
                {COUNTRIES[(report.country ?? "VE") as "VE" | "CO"].flag}{" "}
                {t(`country_${report.country ?? "VE"}` as never)}
              </span>
            </div>
            <SheetTitle className="text-left text-lg leading-tight">{report.title}</SheetTitle>
          </SheetHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          {report.description && (
            <p className="text-sm text-foreground/80">{report.description}</p>
          )}

          <AttachmentsGallery reportId={report.id} variant="full" />


          <div className="grid gap-2 text-sm">
            {report.location_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{report.location_name}</span>
              </div>
            )}
            {showContact ? (
              <>
                {contactQuery.data?.contact_name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    <span>{contactQuery.data.contact_name}</span>
                  </div>
                )}
                {contactQuery.data?.contact_phone && (
                  <a
                    href={`tel:${contactQuery.data.contact_phone}`}
                    className="flex items-center gap-2 text-primary font-medium"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {contactQuery.data.contact_phone}
                  </a>
                )}
                {contactQuery.data?.contact_email && (
                  <a
                    href={`mailto:${contactQuery.data.contact_email}`}
                    className="flex items-center gap-2 text-primary"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {contactQuery.data.contact_email}
                  </a>
                )}
                {contactQuery.isLoading && (
                  <span className="text-xs text-muted-foreground">…</span>
                )}
                {contactQuery.data &&
                  !contactQuery.data.contact_name &&
                  !contactQuery.data.contact_phone &&
                  !contactQuery.data.contact_email && (
                    <span className="text-xs text-muted-foreground italic">
                      {t("noContactInfo")}
                    </span>
                  )}
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="justify-start"
                onClick={() => setShowContact(true)}
              >
                <User className="h-4 w-4" />
                {t("revealContact")}
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => shareWhatsApp(report)}>
              <Share2 className="h-3.5 w-3.5" />
              {t("share")}
            </Button>
            {signedIn === false ? (
              <Button size="sm" variant="outline" asChild>
                <Link to="/auth">{lang === "es" ? "Inicia sesión para cambiar estado" : "Sign in to change status"}</Link>
              </Button>
            ) : (
              <>
                {!isResolved && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => status.mutate({ data: { id: report.id, status: "resolved" } })}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("markResolved")}
                  </Button>
                )}
                {isResolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => status.mutate({ data: { id: report.id, status: "pending" } })}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t("reopen")}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Assignment */}
          <div className="rounded-lg border border-border p-3 bg-card">
            {report.assigned_to_name ? (
              <div className="text-sm">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  {t("assignedTo")}
                </div>
                <div className="font-medium text-foreground">{report.assigned_to_name}</div>
                {report.assigned_to_contact && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {report.assigned_to_contact}
                  </div>
                )}
              </div>
            ) : showAssign ? (
              <div className="space-y-2">
                <Label htmlFor="assign-name" className="text-xs">
                  {t("yourName")}
                </Label>
                <Input
                  id="assign-name"
                  value={assignName}
                  onChange={(e) => setAssignName(e.target.value)}
                />
                <Label htmlFor="assign-contact" className="text-xs">
                  {t("yourContact")}
                </Label>
                <Input
                  id="assign-contact"
                  value={assignContact}
                  onChange={(e) => setAssignContact(e.target.value)}
                />
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() =>
                      assign.mutate({
                        data: {
                          id: report.id,
                          assigned_to_name: assignName,
                          assigned_to_contact: assignContact,
                        },
                      })
                    }
                    disabled={assign.isPending || !assignName || !assignContact}
                  >
                    {t("confirm")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAssign(false)}>
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              !isResolved && (
                <Button size="sm" className="w-full" onClick={() => setShowAssign(true)}>
                  <HandHeart className="h-3.5 w-3.5" />
                  {t("takeAssignment")}
                </Button>
              )
            )}
          </div>

          <ReportItems reportId={report.id} />

          <ReportUpdates reportId={report.id} />

          {/* Matches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{t("matches")}</h3>
              <span className="text-xs text-muted-foreground">{matches.length}</span>
            </div>
            <div className="mb-2">
              <div className="text-xs text-muted-foreground mb-1">
                {t("radiusKm", { km: radius })}
              </div>
              <Slider
                value={[radius]}
                min={1}
                max={100}
                step={1}
                onValueChange={(v) => setRadius(v[0])}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {isNeed ? t("matchHint") : t("matchHintOffer")}
            </p>
            {matches.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">{t("noMatches")}</p>
            ) : (
              <ul className="space-y-2">
                {matches.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-md border border-border p-2 text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-foreground line-clamp-1">{m.title}</div>
                      <span className="text-primary font-semibold shrink-0">
                        {t("distanceAway", { km: m.distance.toFixed(1) })}
                      </span>
                    </div>
                    {m.location_name && (
                      <div className="text-muted-foreground">📍 {m.location_name}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

