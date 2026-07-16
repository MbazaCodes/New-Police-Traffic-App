"use client";

import dynamic from "next/dynamic";

const AdminWebShell = dynamic(
  () => import("@/components/admin/admin-web-shell").then((m) => m.AdminWebShell),
  { ssr: false }
);

export default function AdminPage() {
  return <AdminWebShell />;
}
