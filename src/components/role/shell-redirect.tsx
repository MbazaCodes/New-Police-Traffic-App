"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ShellRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => { router.replace(to); }, [router, to]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-police">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
        <p className="mt-3 text-[13px] text-police-muted">Inaelekeza...</p>
      </div>
    </div>
  );
}
