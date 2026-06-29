// Registration wrapper for the PWA service worker.
// Strict guards prevent registration in dev, Lovable preview, iframes, or when ?sw=off is set.

const SW_URL = "/sw.js";

function isPreviewHost(hostname: string): boolean {
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  if (hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com")) return true;
  if (hostname === "lovableproject-dev.com" || hostname.endsWith(".lovableproject-dev.com"))
    return true;
  if (hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev")) return true;
  return false;
}

async function unregisterMatching() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      const url = r.active?.scriptURL ?? r.installing?.scriptURL ?? r.waiting?.scriptURL ?? "";
      if (url.endsWith(SW_URL)) await r.unregister();
    }
  } catch {
    // ignore
  }
}

export async function registerPwa() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.PROD) {
    await unregisterMatching();
    return;
  }
  if (window.self !== window.top) {
    await unregisterMatching();
    return;
  }
  if (isPreviewHost(window.location.hostname)) {
    await unregisterMatching();
    return;
  }
  if (new URL(window.location.href).searchParams.get("sw") === "off") {
    await unregisterMatching();
    return;
  }
  if (!("serviceWorker" in navigator)) return;
  try {
    const { Workbox } = await import("workbox-window");
    const wb = new Workbox(SW_URL);
    wb.register();
  } catch {
    // ignore
  }
}
