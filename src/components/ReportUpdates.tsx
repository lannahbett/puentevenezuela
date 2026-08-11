import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { addReportUpdate, listReportUpdates } from "@/lib/reports.functions";

export function ReportUpdates({ reportId }: { reportId: string }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [author, setAuthor] = useState("");

  const updates = useQuery({
    queryKey: ["report-updates", reportId],
    queryFn: () => listReportUpdates({ data: { reportId } }),
  });

  const add = useMutation({
    mutationFn: addReportUpdate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report-updates", reportId] });
      toast.success(t("updateOk"));
      setMessage("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const rows = updates.data ?? [];

  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-2">{t("updatesTitle")}</h3>

      <div className="space-y-2 mb-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("updatePlaceholder")}
          rows={2}
          className="text-xs"
        />
        <div className="flex gap-2">
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t("yourName")}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            className="h-8 shrink-0"
            disabled={!message.trim() || add.isPending}
            onClick={() =>
              add.mutate({
                data: {
                  reportId,
                  message: message.trim(),
                  author_name: author.trim() || undefined,
                },
              })
            }
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            {t("updateSend")}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{t("updatesEmpty")}</p>
      ) : (
        <ol className="space-y-2 border-l border-border pl-3">
          {rows.map((u) => (
            <li key={u.id} className="relative">
              <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-primary" />
              <p className="text-xs text-foreground">{u.message}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {u.author_name || t("anonymous")} ·{" "}
                {new Date(u.created_at).toLocaleString(lang === "es" ? "es-VE" : "en-US")}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
