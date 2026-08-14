import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createReport } from "@/lib/reports.functions";
import {
  flushQueue,
  getQueue,
  subscribeQueue,
  type QueuedReport,
} from "@/lib/offline-queue";
import { useI18n } from "@/lib/i18n";

const send = (payload: QueuedReport["payload"]) =>
  createReport({ data: payload as never });

/** Keeps the pending count in sync and auto-flushes when the network returns. */
export function useOfflineQueue() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const qc = useQueryClient();
  const { t } = useI18n();

  const sync = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.onLine) return;
    if (getQueue().length === 0) return;
    setSyncing(true);
    try {
      const n = await flushQueue(send);
      if (n > 0) {
        qc.invalidateQueries({ queryKey: ["reports"] });
        toast.success(t("queueSynced", { n }));
      }
    } finally {
      setSyncing(false);
    }
  }, [qc, t]);

  useEffect(() => {
    setPending(getQueue().length);
    const unsub = subscribeQueue((q) => setPending(q.length));
    void sync();
    const onOnline = () => void sync();
    window.addEventListener("online", onOnline);
    const id = window.setInterval(() => void sync(), 30000);
    return () => {
      unsub();
      window.removeEventListener("online", onOnline);
      window.clearInterval(id);
    };
  }, [sync]);

  return { pending, syncing, sync };
}
