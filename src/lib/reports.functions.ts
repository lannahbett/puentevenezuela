import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reportTypeEnum = z.enum(["need", "offer"]);
const reportCategoryEnum = z.enum([
  "water",
  "food",
  "shelter",
  "medicine",
  "rescue",
  "volunteer",
  "transport",
  "other",
]);
const reportStatusEnum = z.enum(["pending", "in_progress", "resolved"]);

const reportSchema = z.object({
  type: reportTypeEnum,
  category: reportCategoryEnum,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  location_name: z.string().max(500).optional(),
  contact_name: z.string().max(200).optional(),
  contact_phone: z.string().max(50).optional(),
  contact_email: z.string().email().max(200).optional(),
  urgency: z.number().int().min(1).max(5).default(3),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  status: reportStatusEnum.optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  contact_name: z.string().max(200).optional(),
  contact_phone: z.string().max(50).optional(),
  contact_email: z.string().email().max(200).optional(),
});

export const listReports = createServerFn({ method: "GET" }).handler(
  async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase config");
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }
);

export const createReport = createServerFn({ method: "POST" })
  .inputValidator((data) => reportSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase config");
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: result, error } = await supabase
      .from("reports")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateReport = createServerFn({ method: "POST" })
  .inputValidator((data) => updateSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase config");
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { id, ...updates } = data;
    const { data: result, error } = await supabase
      .from("reports")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });
