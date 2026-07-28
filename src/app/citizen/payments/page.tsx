"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CitizenShell } from "@/components/citizen/citizen-shell";
import { useCitizenStore } from "@/store/citizen-store";

export default function CitizenPaymentsPage() {
  const { isAuthenticated } = useCitizenStore();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.replace("/citizen"); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;
  return <CitizenShell />;
}
