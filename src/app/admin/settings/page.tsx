"use client";
import { ShellRedirect } from "@/components/role/shell-redirect";
// The settings page is now rendered via AdminShell → AdminSettings component
// which includes the new editable service prices section
export default function Page() { return <ShellRedirect to="/admin" />; }
