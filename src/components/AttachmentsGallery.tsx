import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrls } from "@/lib/upload";
import { X } from "lucide-react";

type Attachment = {
  id: string;
  storage_path: string;
  file_name: string;
};

interface Props {
  reportId: string;
  variant?: "thumbs" | "full";
}

export function AttachmentsGallery({ reportId, variant = "full" }: Props) {
  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_attachments")
        .select("id, storage_path, file_name")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Attachment[];
    },
  });

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!attachments.length) return;
    let cancelled = false;
    getSignedUrls(attachments.map((a) => a.storage_path)).then((map) => {
      if (!cancelled) setUrls(map);
    });
    return () => {
      cancelled = true;
    };
  }, [attachments]);

  if (!attachments.length) return null;

  if (variant === "thumbs") {
    const first = attachments[0];
    const url = urls[first.storage_path];
    if (!url) return null;
    return (
      <div className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted">
        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
        {attachments.length > 1 && (
          <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-tl">
            +{attachments.length - 1}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {attachments.map((a) => {
          const url = urls[a.storage_path];
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => url && setLightbox(url)}
              className="relative aspect-square rounded-md overflow-hidden bg-muted hover:opacity-90 transition"
            >
              {url ? (
                <img
                  src={url}
                  alt={a.file_name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full animate-pulse bg-muted" />
              )}
            </button>
          );
        })}
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
