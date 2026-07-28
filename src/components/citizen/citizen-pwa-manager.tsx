// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X, WifiOff, Shield, Bell, Zap, Smartphone, User, Share } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * CitizenPwaManager — PWA install prompt, offline detection, and
 * service worker registration for the citizen portal.
 *
 * Handles Chrome/Android (beforeinstallprompt), iOS Safari (manual guide),
 * and already-installed standalone mode detection.
 */
export function CitizenPwaManager() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [showBanner, setShowBanner]       = useState(false);
  const [isOffline, setIsOffline]         = useState(false);
  const [installed, setInstalled]         = useState(false);
  const [swReady, setSwReady]             = useState(false);
  const [installing, setInstalling]       = useState(false);

  // Detect ?pwa=1 — fresh login redirect, show modal immediately
  const [isFreshLogin, setIsFreshLogin] = useState(false);
  useEffect(() => {
    setIsFreshLogin(new URLSearchParams(window.location.search).has("pwa"));
  }, []);

  // Detect iOS
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const notStandalone = !(window.navigator as any).standalone;
    setIsIOS(ios && notStandalone);
  }, []);

  // Register citizen service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/citizen-sw.js", { scope: "/citizen/" })
      .then((reg) => {
        setSwReady(true);
        console.log("[TPF Citizen PWA] Service worker registered");
        // Check for updates periodically
        const iv = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(iv);
      })
      .catch((err) => console.warn("[TPF Citizen PWA] SW registration failed:", err));
  }, []);

  // Detect if already installed (standalone mode)
  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setInstalled(standalone);
    };
    checkStandalone();
    // Listen for display mode changes
    const mql = window.matchMedia("(display-mode: standalone)");
    mql.addEventListener("change", checkStandalone);
    return () => mql.removeEventListener("change", checkStandalone);
  }, []);

  // Capture beforeinstallprompt (Chrome/Android)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      const alreadyDismissed = localStorage.getItem("citizen-pwa-dismissed");
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

  // On fresh login: if beforeinstallprompt hasn't fired yet, show modal after delay
  useEffect(() => {
    if (!isFreshLogin || installed) return;
    const t = setTimeout(() => setShowModal(true), 1200);
    return () => clearTimeout(t);
  }, [isFreshLogin, installed]);

  // Online/offline detection
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
    localStorage.setItem("citizen-pwa-dismissed", "1");
    const url = new URL(window.location.href);
    url.searchParams.delete("pwa");
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <>
      {/* ── Offline bar — with safe-area padding ──────────────────── */}
      {isOffline && (
        <div className="fixed inset-x-0 top-0 z-[9999] flex items-center gap-2 bg-[#EF4444] px-4 py-2 text-[12px] font-medium text-white shadow-lg"
          style={{ paddingTop: "calc(8px + env(safe-area-inset-top, 0px))" }}>
          <WifiOff size={14} />
          <span>Huna mtandao — Data iliyohifadhiwa inaonekana tu</span>
        </div>
      )}

      {/* ── INSTALL MODAL — shown on fresh login ────────────────── */}
      {showModal && !installed && (
        <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/60 p-3 sm:p-4 sm:items-center backdrop-blur-sm"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
          <div className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-slide-up"
            style={{ background: "linear-gradient(to bottom, #0a1a12, #0d2818)" }}>
            {/* Header */}
            <div className="relative px-5 sm:px-6 pb-5 sm:pb-6 pt-7 sm:pt-8 text-center"
              style={{ background: "linear-gradient(135deg, #0d4f3c, #10B981, #059669)" }}>
              <button onClick={dismissModal}
                className="absolute right-3 sm:right-4 top-3 sm:top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition touch-manipulation">
                <X size={16} />
              </button>
              <div className="mx-auto mb-3 flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/20">
                <Image src="/police-logo.png" alt="TPF" width={64} height={64} className="h-16 w-16 object-contain" />
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-black text-white">Sakinisha TPF Raia</h2>
              <p className="mt-1 text-[12px] sm:text-[13px] text-white/70">Huduma za Raia — Jukwaa la Kidijitali</p>
            </div>

            {/* Features */}
            <div className="space-y-2.5 px-5 sm:px-6 py-4 sm:py-5">
              {[
                { icon: Zap,        color: "#10B981", title: "Ufikiaji wa Haraka",         desc: "Fungua moja kwa moja kutoka skrini ya nyumbani" },
                { icon: WifiOff,    color: "#059669", title: "Inafanya Bila Mtandao",      desc: "Taarifa zako zihifadhiwa kwa matumizi popote" },
                { icon: Bell,       color: "#2196F3", title: "Arifa za Huduma",             desc: "Pata arifa za maombi, malipo na malalamiko" },
                { icon: User,       color: "#D97706", title: "Huduma za Raia",              desc: "Ripoti, malipo, maombi — yote kwenye simu yako" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${f.color}20` }}>
                    <f.icon size={16} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="text-[12px] sm:text-[13px] font-bold text-white">{f.title}</p>
                    <p className="text-[10px] sm:text-[11px] leading-tight text-white/50">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* iOS special instruction */}
            {isIOS && (
              <div className="mx-5 sm:mx-6 mb-3 sm:mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[12px] font-bold text-[#10B981] flex items-center gap-2">
                  <Share size={14} /> Kifaa cha Apple (iOS)
                </p>
                <p className="mt-1.5 text-[11px] text-white/60 leading-relaxed">
                  1. Bonyeza <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/20 text-[10px] font-bold text-white">↑</span> (Share button) katika Safari<br/>
                  2. Scroll down na chagua <span className="text-white font-bold">"Add to Home Screen"</span><br/>
                  3. Bonyeza <span className="text-white font-bold">"Add"</span> — programu itaonekana kwenye skrini ya nyumbani
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 px-5 sm:px-6 pb-5 sm:pb-6">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  disabled={!installPrompt || installing}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-black text-white shadow-lg shadow-[#10B981]/30 transition active:scale-[0.98] disabled:opacity-60 touch-manipulation"
                >
                  <Download size={18} />
                  {installing ? "Inasanikishwa..." : "Sakinisha Sasa"}
                </button>
              )}
              {isIOS && (
                <div className="rounded-2xl bg-white/10 py-3 text-center text-[13px] font-bold text-[#10B981]">
                  Tumia Safari → Add to Home Screen
                </div>
              )}
              {!installPrompt && !isIOS && (
                <p className="text-center text-[10px] text-white/40">
                  Programu tayari imesanikishwa au kivinjari hakitumiki PWA
                </p>
              )}
              <button onClick={dismissModal}
                className="w-full rounded-2xl border border-white/10 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-white/50 hover:text-white/70 transition touch-manipulation">
                Sakinisha Baadaye
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM BANNER — shown on subsequent visits ────────────── */}
      {showBanner && !showModal && !installed && (
        <div className="fixed inset-x-0 bottom-16 sm:bottom-20 z-[9997] border-t p-3 shadow-2xl backdrop-blur-sm"
          style={{
            background: "rgba(10,26,18,0.95)",
            borderColor: "rgba(16,185,129,0.3)",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          }}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Image src="/police-logo.png" alt="TPF Raia" width={36} height={36} className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-[12px] font-bold text-white">Sakinisha Programu ya TPF Raia</p>
              <p className="text-[9px] sm:text-[10px] text-white/50">Ufikiaji wa haraka · Inafanya kazi bila mtandao</p>
            </div>
            <button onClick={handleInstall} disabled={!installPrompt || installing}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-[#10B981] px-3 py-2 text-[11px] sm:text-[12px] font-bold text-white disabled:opacity-60 transition active:scale-[0.96] touch-manipulation">
              <Smartphone size={13} /> Sakinisha
            </button>
            <button onClick={dismissModal} className="shrink-0 text-white/30 hover:text-white/60 transition touch-manipulation">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
