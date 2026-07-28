"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, ScanLine, Loader2, CheckCircle2, AlertCircle, RefreshCw, Keyboard } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

type ScanStatus = "idle" | "starting" | "scanning" | "processing" | "success" | "error" | "no-camera";

export function CameraScannerModal() {
  const { scannerOpen, scannerMode, closeScanner, navigate, runSearch } = usePoliceStore();
  const qrReaderId = "qr-reader";
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ocrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const html5QrRef = useRef<unknown>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const qrStartedRef = useRef(false);

  const isQR = scannerMode === "qr";

  // Cleanup camera on unmount or close
  const stopCamera = useCallback(() => {
    if (ocrIntervalRef.current) {
      clearInterval(ocrIntervalRef.current);
      ocrIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Stop html5-qrcode only if it was actually started
    if (qrStartedRef.current) {
      const qr = html5QrRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
      if (qr && typeof qr.stop === "function") {
        qr.stop().then(() => qr.clear?.()).catch(() => {});
      }
      qrStartedRef.current = false;
    }
    html5QrRef.current = null;
  }, []);

  // Handle successful scan
  const handleResult = useCallback(
    (value: string) => {
      setResult(value);
      setStatus("success");
      stopCamera();
      toast({
        title: isQR ? "QR Imesomwa" : "Namba Imesomwa",
        description: `Imepatikana: ${value}`,
      });
      // Trigger search with the scanned value
      runSearch(value);
      setTimeout(() => {
        navigate("search-results");
        closeScanner();
      }, 1100);
    },
    [isQR, closeScanner, navigate, stopCamera, runSearch]
  );

  // Start QR scanning with html5-qrcode
  const startQRScanner = useCallback(async () => {
    setStatus("starting");
    setErrorMsg("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5Qr = new Html5Qrcode(qrReaderId, { verbose: false });
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText: string) => {
          handleResult(decodedText);
        },
        () => {}
      );
      qrStartedRef.current = true;
      setStatus("scanning");
    } catch {
      html5QrRef.current = null;
      setStatus("no-camera");
      setErrorMsg("Kamera haipatikani. Tumia kuingiza mkono.");
      setManualMode(true);
    }
  }, [handleResult]);

  // Start OCR plate scanning with tesseract.js
  const startOCRScanner = useCallback(async () => {
    setStatus("starting");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("scanning");

      // Periodically capture frame and run OCR
      let processing = false;
      ocrIntervalRef.current = setInterval(async () => {
        if (processing || !videoRef.current) return;
        processing = true;
        try {
          const canvas = document.createElement("canvas");
          const vw = videoRef.current.videoWidth || 640;
          const vh = videoRef.current.videoHeight || 480;
          canvas.width = vw;
          canvas.height = vh;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            processing = false;
            return;
          }
          ctx.drawImage(videoRef.current, 0, 0, vw, vh);

          // Try to find a plate-like pattern in the OCR result
          const { default: Tesseract } = await import("tesseract.js");
          const { data } = await Tesseract.recognize(canvas, "eng", {
            logger: () => {},
          });
          const text = data?.text || "";
          // Match Tanzanian plate pattern: T + space + digits + space + letters (e.g., T 001 ABC)
          const plateMatch = text.match(/T\s?\d{2,4}\s?[A-Z]{2,3}/i);
          if (plateMatch) {
            const plate = plateMatch[0].replace(/\s/g, "").toUpperCase();
            handleResult(plate);
          }
        } catch {
          // ignore frame errors
        }
        processing = false;
      }, 2500);
    } catch {
      setStatus("no-camera");
      setErrorMsg("Kamera haipatikani. Tumia kuingiza mkono.");
      setManualMode(true);
    }
  }, [handleResult]);

  // Start scanner when modal opens
  useEffect(() => {
    if (!scannerOpen) {
      setStatus("idle");
      setResult("");
      setErrorMsg("");
      setManualMode(false);
      setManualInput("");
      return;
    }

    setStatus("starting");
    if (isQR) {
      startQRScanner();
    } else {
      startOCRScanner();
    }

    return () => {
      stopCamera();
    };
  }, [scannerOpen, scannerMode]);

  // Manual submit
  const handleManualSubmit = () => {
    const val = manualInput.trim().toUpperCase();
    if (!val) return;
    handleResult(val);
  };

  // Simulated scan (fallback for demo environments without camera)
  const handleSimulate = () => {
    const plate = "";
    handleResult(plate);
  };

  if (!scannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-black/90 px-4 py-3 pt-6">
        <button
          onClick={() => {
            stopCamera();
            closeScanner();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-[15px] font-bold text-white">
            {isQR ? "Soma QR Code" : "Soma Namba ya Gari"}
          </h2>
          <p className="text-[11px] text-white/60">
            {isQR ? "Lenga kamera kwenye QR code" : "Lenga kamera kwenye namba ya usajili"}
          </p>
        </div>
        <div className="h-9 w-9" />
      </div>

      {/* Camera Viewport */}
      <div className="relative flex-1 overflow-hidden">
        {status === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-[13px] text-white/70">Inaanza kamera...</p>
          </div>
        )}

        {status === "processing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-[13px] text-white/70">Inasoma namba...</p>
          </div>
        )}

        {status === "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]">
              <CheckCircle2 size={48} />
            </div>
            <p className="text-[16px] font-bold">{result}</p>
            <p className="text-[12px] text-white/70">Inaenda kwa matokeo...</p>
          </div>
        )}

        {/* QR reader container (hidden but functional) */}
        {isQR && status !== "success" && (
          <div id={qrReaderId} className="h-full w-full" />
        )}

        {/* OCR video feed */}
        {!isQR && status !== "success" && status !== "starting" && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {/* Scanning frame overlay */}
        {status === "scanning" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-56 w-72 rounded-2xl border-2 border-white/80">
              {/* Corner accents */}
              <span className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-[#2196F3]" />
              <span className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-[#2196F3]" />
              <span className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-[#2196F3]" />
              <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-[#2196F3]" />
              {/* Animated scan line */}
              <div className="absolute inset-x-2 top-1/2 h-0.5 animate-pulse bg-[#2196F3] shadow-[0_0_8px_#2196F3]" />
              <ScanLine className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40" size={32} />
            </div>
          </div>
        )}

        {/* No camera / error state */}
        {(status === "no-camera" || status === "error") && !manualMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-white">
            <AlertCircle size={48} className="text-[#FF9800]400" />
            <p className="text-[14px] font-semibold">{errorMsg || "Kamera haiwezekani"}</p>
            <button
              onClick={handleSimulate}
              className="rounded-xl bg-[#2196F3] px-6 py-3 text-[14px] font-bold text-white active:scale-95"
            >
              Jaribu Simulizi
            </button>
            <button
              onClick={() => setManualMode(true)}
              className="rounded-xl border border-white/30 px-6 py-2.5 text-[13px] font-medium text-white"
            >
              <Keyboard size={14} className="mr-1 inline" /> Ingiza Mkono
            </button>
          </div>
        )}

        {/* Manual input fallback */}
        {manualMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-white">
            <Keyboard size={40} className="text-[#2196F3]" />
            <h3 className="text-[16px] font-bold">
              {isQR ? "Ingiza QR Thibitisho" : "Ingiza Namba ya Gari"}
            </h3>
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={isQR ? "QR value..." : "T 001 ABC"}
              className="w-full max-w-xs rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-[16px] font-bold uppercase text-white placeholder:text-white/40 focus:border-[#2196F3] focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  stopCamera();
                  closeScanner();
                }}
                className="rounded-xl border border-white/30 px-5 py-2.5 text-[13px] font-medium text-white"
              >
                Funga
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="rounded-xl bg-[#2196F3] px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
              >
                Thibitisha
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {status === "scanning" && (
        <div className="bg-black/90 px-4 py-5 pb-8">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setManualMode(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/30 px-4 py-2.5 text-[12px] font-medium text-white"
            >
              <Keyboard size={14} /> Mkono
            </button>
            <button
              onClick={() => {
                stopCamera();
                setTimeout(() => (isQR ? startQRScanner() : startOCRScanner()), 200);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/30 px-4 py-2.5 text-[12px] font-medium text-white"
            >
              <RefreshCw size={14} /> Anza tena
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/50">
            {isQR
              ? "Kamera inatafuta QR code moja kwa moja..."
              : "Kamera inasoma namba ya gari kwenye picha..."}
          </p>
        </div>
      )}
    </div>
  );
}
