"use client";

import dynamic from "next/dynamic";

const MobileShell = dynamic(
  () => import("@/components/police/mobile-shell").then((m) => m.MobileShell),
  { ssr: false }
);

export default function Home() {
  return <MobileShell />;
}
