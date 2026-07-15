"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock, ShieldCheck, User, ArrowRight } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";

export function LoginScreen() {
  const login = usePoliceStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative flex min-h-full flex-col bg-white">
      {/* Background cityscape overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#2196F3] to-transparent" />
        <svg className="absolute bottom-0 w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <polygon points="0,200 0,120 30,120 30,90 60,90 60,110 90,110 90,70 120,70 120,100 150,100 150,60 180,60 180,95 210,95 210,80 240,80 240,50 270,50 270,90 300,90 300,75 330,75 330,105 360,105 360,85 400,85 400,200" fill="#1A237E" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-8 pt-8">
        {/* Logo */}
        <div className="mt-2 flex flex-col items-center">
          <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-[#0070C0]/20">
            <Image
              src="/police-logo.png"
              alt="Tanzania Police Force"
              width={112}
              height={112}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="mt-4 text-center text-[22px] font-extrabold tracking-tight text-[#002B5C]">
            TANZANIA POLICE FORCE
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#0070C0]">
            USALAMA WETU, JUKUMU LETU
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-7 w-full rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
          <h2 className="text-center text-[19px] font-bold text-[#002B5C]">Officer Login</h2>
          <p className="mt-1 text-center text-[13px] text-gray-500">
            Ingia kutumia akaunti yako ya utumishi
          </p>

          {/* Username */}
          <div className="mt-5">
            <label className="mb-1.5 block text-[13px] font-medium text-[#002B5C]">Username</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-[#0070C0] focus-within:ring-2 focus-within:ring-[#0070C0]/20">
              <User size={20} className="text-[#0070C0]" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingiza username yako"
                className="h-12 flex-1 bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="mb-1.5 block text-[13px] font-medium text-[#002B5C]">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-[#0070C0] focus-within:ring-2 focus-within:ring-[#0070C0]/20">
              <Lock size={20} className="text-[#0070C0]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingiza password yako"
                className="h-12 flex-1 bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-2"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded ${
                  remember ? "bg-[#0070C0]" : "border border-gray-300 bg-white"
                }`}
              >
                {remember && (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[13px] text-[#002B5C]">Kumbuka mimi</span>
            </button>
            <button className="text-[13px] font-medium text-[#0070C0]">
              Umesahau password?
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0070C0] py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#0070C0]/30 transition active:scale-[0.98]"
          >
            <ShieldCheck size={20} />
            <span>Ingia</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-[11px] text-gray-500">
            Mfumo salama wa Jeshi la Polisi Tanzania
          </p>
          <p className="mt-1 text-[11px] text-gray-400">© 2026 Tanzania Police Force</p>
        </div>
      </div>
    </div>
  );
}
