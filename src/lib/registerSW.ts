/** Single guarded service-worker registration. Never registers in dev, iframes or Lovable preview hosts. */
function refused(): boolean {
  const h = location.hostname;
  const inIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
  return !import.meta.env.PROD || inIframe || h.startsWith("id-preview--") || h.startsWith("preview--") ||
    /(^|\.)lovableproject(-dev)?\.com$/.test(h) || /(^|\.)beta\.lovable\.dev$/.test(h) ||
    new URLSearchParams(location.search).get("sw") === "off";
}

export async function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (refused()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}
