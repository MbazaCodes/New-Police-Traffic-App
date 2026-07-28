"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CitizenShell } from "@/components/citizen/citizen-shell";
import { useCitizenStore } from "@/store/citizen-store";

export default function CitizenDashboardPage() {
  const { isAuthenticated } = useCitizenStore();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace("/citizen");
  }, [isAuthenticated, router]);
  if (!isAuthenticated) return (
    <div className="flex min-h-screen items-center justify-center" style={{background:"#0a1a12"}}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#10B981] border-t-transparent"/>
    </div>
  );
  return <CitizenShell />;
}
