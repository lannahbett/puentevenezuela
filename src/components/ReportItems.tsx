import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { addReportItem, listReportItems, pledgeReportItem } from "@/lib/reports.functions";

export function ReportItems({ reportId }: { reportId: string }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [qty, setQty] = useState("1");

  const items = useQuery({
    queryKey: ["report-items", reportId],
    queryFn: () => listReportItems({ data: { reportId } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["report-items", reportId] });

  const add = useMutation({
    mutationFn: addReportItem,
    onSuccess: () => {
      invalidate();
      toast.success(t("itemAddedOk"));
      setLabel("");
      setQty("1");
      setAdding(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const pledge = useMutation({
    mutationFn: pledgeReportItem,
    onSuccess: () => {
      invalidate();
      toast.success(t("itemPledgedOk"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const rows = items.data ?? [];

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">{t("itemsTitle")}</h3>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-3.5 w-3.5" />
          {t("itemAdd")}
        </Button>
      </div>

      {adding && (
        <div className="mb-3 flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("itemLabel")}
              className="h-8 text-xs"
            />
          </div>
          <Input
            value={qty}
            onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))}
            className="h-8 w-16 text-xs"
            inputMode="numeric"
            aria-label={t("itemQty")}
          />
          <Button
            size="sm"
            className="h-8"
            disabled={!label.trim() || add.isPending}
            onClick={() =>
              add.mutate({
                data: {
                  reportId,
                  label: label.trim(),
                  quantity_needed: Math.max(1, parseInt(qty || "1", 10)),
                },
              })
            }
          >
            {t("confirm")}
          </Button>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{t("itemsEmpty")}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((item) => {
            const pct = Math.min(
              100,
              Math.round((item.quantity_fulfilled / Math.max(1, item.quantity_needed)) * 100),
            );
            const done = item.quantity_fulfilled >= item.quantity_needed;
            return (
              <li key={item.id} className="rounded-md border border-border p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground line-clamp-1">
                    {item.label}
                  </span>
                  {done ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <PackageCheck className="h-3 w-3" />
                      {t("itemComplete")}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2"
                      disabled={pledge.isPending}
                      onClick={() => pledge.mutate({ data: { itemId: item.id, quantity: 1 } })}
                    >
                      +1 {t("itemPledge")}
                    </Button>
                  )}
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${done ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {t("itemCovered", {
                    done: item.quantity_fulfilled,
                    need: item.quantity_needed,
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
