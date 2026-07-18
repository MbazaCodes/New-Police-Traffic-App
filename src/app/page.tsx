"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1b3d]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
        <p className="mt-3 text-[13px] text-blue-200">Inaelekeza...</p>
      </div>
    </div>
  );
}
