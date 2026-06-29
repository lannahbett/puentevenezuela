import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const idSchema = z.object({ reportId: z.string().uuid() });

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase config");
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }),
  );
}

export const listAllAttachments = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("report_attachments")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listAttachmentsByReport = createServerFn({ method: "GET" })
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await getClient();
    const { data: rows, error } = await supabase
      .from("report_attachments")
      .select("*")
      .eq("report_id", data.reportId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
