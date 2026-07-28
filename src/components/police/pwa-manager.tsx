"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X, WifiOff, Shield, Bell, Zap, Smartphone } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [showBanner, setShowBanner]       = useState(false);
  const [isOffline, setIsOffline]         = useState(false);
  const [installed, setInstalled]         = useState(false);
  const [swReady, setSwReady]             = useState(false);
  const [installing, setInstalling]       = useState(false);

  // Detect ?pwa=1 — fresh login redirect, show modal immediately
  const isFreshLogin = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("pwa");

  // Register service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/officer-sw.js", { scope: "/officer/" })
      .then((reg) => {
        setSwReady(true);
        const iv = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(iv);
      })
      .catch((err) => console.warn("[TPF PWA] SW failed:", err));
  }, []);

  // Detect if already installed (standalone mode)
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setInstalled(isStandalone);
  }, []);

  // Capture beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      const alreadyDismissed = localStorage.getItem("pwa-install-dismissed");
      // On fresh login (?pwa=1): always show modal. Otherwise: show banner unless dismissed.
      if (isFreshLogin) {
        setShowModal(true);
      } else if (!alreadyDismissed) {
        setShowBanner(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isFreshLogin]);

  // On fresh login: if beforeinstallprompt hasn't fired yet but we know
  // it's a new login, show the modal anyway (for iOS / already-installed cases)
  useEffect(() => {
    if (!isFreshLogin || installed) return;
    const t = setTimeout(() => setShowModal(true), 1200);
    return () => clearTimeout(t);
  }, [isFreshLogin, installed]);

  // Online/offline
  useEffect(() => {
    const on  = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setIsOffline(!navigator.onLine);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
        setShowModal(false);
        setShowBanner(false);
        setInstalled(true);
        // Clean up ?pwa param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("pwa");
        window.history.replaceState({}, "", url.toString());
      }
    } finally {
      setInstalling(false);
    }
  }, [installPrompt]);

  const dismissModal = () => {
    setShowModal(false);
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "1");
    // Remove ?pwa from URL so refresh doesn't re-show
    const url = new URL(window.location.href);
    url.searchParams.delete("pwa");
    window.history.replaceState({}, "", url.toString());
  };

  const isIOS = typeof window !== "undefined" &&
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !(window.navigator as any).standalone;

  return (
    <>
      {/* Offline bar */}
      {isOffline && (
        <div className="fixed inset-x-0 top-0 z-[9999] flex items-center gap-2 bg-[#EF4444] px-4 py-2 text-[12px] font-medium text-white">
          <WifiOff size={14} />
          <span>Huna mtandao — Data iliyohifadhiwa inaonekana tu</span>
        </div>
      )}

      {/* ── INSTALL MODAL — shown on fresh login ───────────────────────── */}
      {showModal && !installed && (
        <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/60 p-4 sm:items-center backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-[#0d1b3d] shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1E3A8A] to-[#0d4f3c] px-6 pb-6 pt-8 text-center">
              <button onClick={dismissModal}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20">
                <X size={16} />
              </button>
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/20">
                <Image src="/police-logo.png" alt="TPF" width={64} height={64} className="h-16 w-16 object-contain" />
              </div>
              <h2 className="text-[20px] font-black text-white">Sakinisha Programu</h2>
              <p className="mt-1 text-[13px] text-white/70">TPF Digital — Jukwaa la Kidijitali la Maafisa</p>
            </div>

            {/* Features */}
            <div className="space-y-3 px-6 py-5">
              {[
                { icon: Zap,        color: "#FF9800", title: "Ufikiaji wa Haraka",         desc: "Fungua moja kwa moja kutoka skrini ya nyumbani bila browser" },
                { icon: WifiOff,    color: "#10B981", title: "Inafanya Kazi Bila Mtandao", desc: "Data muhimu inahifadhiwa kwa matumizi wakati wa kutokuwa na mtandao" },
                { icon: Bell,       color: "#2196F3", title: "Arifa za Wakati Halisi",     desc: "Pata arifa za haraka za matukio na maagizo" },
                { icon: Shield,     color: "#8B5CF6", title: "Salama na Imefungwa",        desc: "Data yako inabaki salama kwenye kifaa chako" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${f.color}20` }}>
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white">{f.title}</p>
                    <p className="text-[11px] leading-tight text-white/50">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* iOS special instruction */}
            {isIOS && (
              <div className="mx-6 mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[12px] font-bold text-[#FF9800]">Kifaa cha Apple (iOS)</p>
                <p className="mt-1 text-[11px] text-white/60">
                  Bonyeza <span className="text-white">☐↑</span> chini ya skrini → chagua{" "}
                  <span className="text-white">"Add to Home Screen"</span>
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 px-6 pb-6">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  disabled={!installPrompt || installing}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2196F3] py-4 text-[15px] font-black text-white shadow-lg shadow-[#2196F3]/30 transition active:scale-[0.98] disabled:opacity-60"
                >
                  <Download size={18} />
                  {installing ? "Inasanikishwa..." : "Sakinisha Sasa"}
                </button>
              )}
              {!installPrompt && !isIOS && (
                <p className="text-center text-[10px] text-white/40">
                  Programu tayari imesanikishwa au kivinjari hakitumiki
                </p>
              )}
              <button onClick={dismissModal}
                className="w-full rounded-2xl border border-white/10 py-3 text-[13px] font-semibold text-white/50 hover:text-white/70">
                Sakinisha Baadaye
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM BANNER — shown on subsequent visits (not fresh login) ── */}
      {showBanner && !showModal && !installed && (
        <div className="fixed inset-x-0 bottom-0 z-[9997] border-t border-[#1E3A8A]/30 bg-[#0d1b3d]/95 p-3 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image src="/police-logo.png" alt="TPF" width={40} height={40} className="h-10 w-10 rounded-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white">Sakinisha Programu ya Afisa</p>
              <p className="text-[10px] text-white/50">Ufikiaji wa haraka • Inafanya kazi bila mtandao</p>
            </div>
            <button onClick={handleInstall} disabled={!installPrompt || installing}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2196F3] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-60">
              <Smartphone size={13} /> Sakinisha
            </button>
            <button onClick={dismissModal} className="shrink-0 text-white/30 hover:text-white/60">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
