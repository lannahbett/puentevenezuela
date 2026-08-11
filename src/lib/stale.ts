import type { Tables } from "@/integrations/supabase/types";

const STALE_MS = 1000 * 60 * 60 * 48;

/** A report nobody has picked up or resolved for more than 48 hours. */
export function isStale(report: Pick<Tables<"reports">, "status" | "assigned_to_name" | "created_at" | "updated_at">) {
  if (report.status === "resolved") return false;
  if (report.assigned_to_name) return false;
  const last = new Date(report.updated_at ?? report.created_at).getTime();
  return Date.now() - last > STALE_MS;
}
