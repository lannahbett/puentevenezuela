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
const countryEnum = z.enum(["VE", "CO"]);

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
  country: countryEnum.default("VE"),
  items: z
    .array(
      z.object({
        label: z.string().min(1).max(200),
        quantity_needed: z.number().int().min(1).max(100000).default(1),
      }),
    )
    .max(20)
    .optional(),
});

const statusSchema = z.object({
  id: z.string().uuid(),
  status: reportStatusEnum,
});

const assignSchema = z.object({
  id: z.string().uuid(),
  assigned_to_name: z.string().min(1).max(200),
  assigned_to_contact: z.string().min(1).max(200),
});

const revealSchema = z.object({ reportId: z.string().uuid() });

async function getPublicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase config");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const listReports = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const createReport = createServerFn({ method: "POST" })
  .inputValidator((data) => reportSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const {
      contact_name,
      contact_phone,
      contact_email,
      items,
      ...reportData
    } = data;
    const { data: result, error } = await supabase
      .from("reports")
      .insert(reportData)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (contact_name || contact_phone || contact_email) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: cErr } = await supabaseAdmin.from("report_contacts").insert({
        report_id: result.id,
        contact_name: contact_name ?? null,
        contact_phone: contact_phone ?? null,
        contact_email: contact_email ?? null,
      });
      if (cErr) throw new Error(cErr.message);
    }

    if (items && items.length) {
      const { error: iErr } = await supabase.from("report_items").insert(
        items.map((i) => ({
          report_id: result.id,
          label: i.label,
          quantity_needed: i.quantity_needed,
        })),
      );
      if (iErr) throw new Error(iErr.message);
    }
    return result;
  });

export const updateStatus = createServerFn({ method: "POST" })
  .inputValidator((data) => statusSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, status } = data;
    const { data: result, error } = await supabaseAdmin
      .from("reports")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const assignReport = createServerFn({ method: "POST" })
  .inputValidator((data) => assignSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, assigned_to_name, assigned_to_contact } = data;
    const { data: result, error } = await supabaseAdmin
      .from("reports")
      .update({
        assigned_to_name,
        assigned_to_contact,
        assigned_at: new Date().toISOString(),
        status: "in_progress",
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const revealReportContact = createServerFn({ method: "POST" })
  .inputValidator((data) => revealSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("report_contacts")
      .select("contact_name, contact_phone, contact_email")
      .eq("report_id", data.reportId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ?? { contact_name: null, contact_phone: null, contact_email: null };
  });

// ---------- Report items (structured needs list) ----------

const listByReportSchema = z.object({ reportId: z.string().uuid() });

export const listReportItems = createServerFn({ method: "GET" })
  .inputValidator((data) => listByReportSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: rows, error } = await supabase
      .from("report_items")
      .select("*")
      .eq("report_id", data.reportId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const addItemSchema = z.object({
  reportId: z.string().uuid(),
  label: z.string().min(1).max(200),
  quantity_needed: z.number().int().min(1).max(100000).default(1),
});

export const addReportItem = createServerFn({ method: "POST" })
  .inputValidator((data) => addItemSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: row, error } = await supabase
      .from("report_items")
      .insert({
        report_id: data.reportId,
        label: data.label,
        quantity_needed: data.quantity_needed,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const pledgeSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100000),
});

/** Someone commits to covering part of an item; capped at the needed amount. */
export const pledgeReportItem = createServerFn({ method: "POST" })
  .inputValidator((data) => pledgeSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: current, error: readErr } = await supabaseAdmin
      .from("report_items")
      .select("quantity_needed, quantity_fulfilled")
      .eq("id", data.itemId)
      .single();
    if (readErr) throw new Error(readErr.message);
    const next = Math.min(
      current.quantity_needed,
      current.quantity_fulfilled + data.quantity,
    );
    const { data: row, error } = await supabaseAdmin
      .from("report_items")
      .update({ quantity_fulfilled: next })
      .eq("id", data.itemId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Report updates (timeline) ----------

export const listReportUpdates = createServerFn({ method: "GET" })
  .inputValidator((data) => listByReportSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: rows, error } = await supabase
      .from("report_updates")
      .select("*")
      .eq("report_id", data.reportId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const addUpdateSchema = z.object({
  reportId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  author_name: z.string().max(200).optional(),
});

export const addReportUpdate = createServerFn({ method: "POST" })
  .inputValidator((data) => addUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: row, error } = await supabase
      .from("report_updates")
      .insert({
        report_id: data.reportId,
        message: data.message,
        author_name: data.author_name ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Single report (shareable page) ----------

export const getReport = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: row, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Duplicate detection ----------

const similarSchema = z.object({
  category: reportCategoryEnum,
  type: reportTypeEnum,
  latitude: z.number(),
  longitude: z.number(),
});

/** Reports of the same type/category inside a ~1km bounding box. */
export const findSimilarReports = createServerFn({ method: "POST" })
  .inputValidator((data) => similarSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const d = 0.009; // ~1 km
    const { data: rows, error } = await supabase
      .from("reports")
      .select("id, title, location_name, created_at, status")
      .eq("category", data.category)
      .eq("type", data.type)
      .neq("status", "resolved")
      .gte("latitude", data.latitude - d)
      .lte("latitude", data.latitude + d)
      .gte("longitude", data.longitude - d)
      .lte("longitude", data.longitude + d)
      .limit(5);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
