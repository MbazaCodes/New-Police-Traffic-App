"use client";

import { useEffect, useState } from "react";
import { Download, X, Wifi, WifiOff } from "lucide-react";

// ── PWA Install Prompt ──────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner]       = useState(false);
  const [isOffline, setIsOffline]         = useState(false);
  const [swReady, setSwReady]             = useState(false);

  // Register officer service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/officer-sw.js", { scope: "/officer/" })
      .then((reg) => {
        setSwReady(true);
        console.log("[TPF PWA] Service worker registered, scope:", reg.scope);

        // Check for updates every 60s
        const interval = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(interval);
      })
      .catch((err) => console.warn("[TPF PWA] SW registration failed:", err));
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setInstallPrompt(prompt);

      // Only show banner if not already installed
      const dismissed = sessionStorage.getItem("pwa-install-dismissed");
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Online/offline indicator
  useEffect(() => {
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  };

  return (
    <>
      {/* Offline banner */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-[9999] flex items-center gap-2 bg-[#EF4444] px-4 py-2 text-white text-[12px] font-medium">
          <WifiOff size={14} />
          <span>Huna mtandao — Data iliyohifadhiwa inaonekana tu</span>
        </div>
      )}

      {/* Back online toast */}
      {/* (handled by online event — could add toast here) */}

      {/* PWA Install banner */}
      {showBanner && installPrompt && (
        <div className="fixed bottom-0 inset-x-0 z-[9999] border-t border-[#1E3A8A]/20 bg-[#0d1b3d] p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/police-logo.png" alt="TPF" className="h-10 w-10 rounded-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white">Sakinisha Programu ya Afisa</p>
              <p className="text-[11px] text-white/60">Fikia haraka bila mtandao • Arifa za wakati halisi</p>
            </div>
            <button
              onClick={handleInstall}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2196F3] px-4 py-2 text-[12px] font-bold text-white"
            >
              <Download size={13} /> Sakinisha
            </button>
            <button onClick={dismissBanner} className="text-white/40 hover:text-white/70">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* SW ready indicator (dev only) */}
      {process.env.NODE_ENV === "development" && swReady && (
        <div className="fixed bottom-14 right-3 z-50 flex items-center gap-1 rounded-full bg-[#10B981]/20 px-2 py-0.5 text-[9px] text-[#10B981]">
          <Wifi size={9} /> SW
        </div>
      )}
    </>
  );
}
