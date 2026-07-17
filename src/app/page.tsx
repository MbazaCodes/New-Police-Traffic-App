"use client";

import dynamic from "next/dynamic";

const MobileShell = dynamic(
  () => import("@/components/police/mobile-shell").then((m) => m.MobileShell),
  { ssr: false }
);

// PWA deployment — officers ONLY. Admin/Command web is a separate Vercel project.
export default function Home() {
  return <MobileShell />;
}
