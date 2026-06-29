import { supabase } from "@/integrations/supabase/client";

const BUCKET = "report-attachments";

export type UploadedAttachment = {
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  publicUrl: string;
};

async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  if (typeof window === "undefined") return file;
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", quality);
      };
      img.src = String(e.target?.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadAttachment(
  reportId: string,
  file: File,
): Promise<UploadedAttachment> {
  const compressed = await compressImage(file);
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${reportId}/${crypto.randomUUID()}.${ext === "png" ? "png" : "jpg"}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: compressed instanceof Blob ? "image/jpeg" : file.type,
    upsert: false,
  });
  if (upErr) throw new Error(upErr.message);

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1y signed URL
  const publicUrl = signErr ? "" : signed?.signedUrl ?? "";

  const size_bytes = (compressed as Blob).size ?? file.size;

  const { error: insErr } = await supabase.from("report_attachments").insert({
    report_id: reportId,
    storage_path: path,
    file_name: file.name,
    mime_type: "image/jpeg",
    size_bytes,
  });
  if (insErr) throw new Error(insErr.message);

  return {
    storage_path: path,
    file_name: file.name,
    mime_type: "image/jpeg",
    size_bytes,
    publicUrl,
  };
}

export function getAttachmentUrl(storagePath: string): string {
  // Bucket is private — use signed URL through client SDK for display.
  // For simplicity we use a per-render signed URL request, but to avoid
  // many round trips we batch via getSignedUrls when possible.
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getSignedUrls(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, 60 * 60 * 6);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}
