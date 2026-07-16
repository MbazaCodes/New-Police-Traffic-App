"use client";

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const MobileShell = dynamic(
  () => import("@/components/police/mobile-shell").then((m) => m.MobileShell),
  { ssr: false }
);

export default function Home() {
  // Admin/Command Web deployment: redirect root to /admin dashboard
  if (process.env.NEXT_PUBLIC_APP_MODE === "admin") {
    redirect("/admin");
  }
  return <MobileShell />;
}
