import type { Metadata, Viewport } from "next";
import { PwaManager } from "@/components/police/pwa-manager";

export const metadata: Metadata = {
  title: "TPF Afisa | Tanzania Police Force",
  description: "Jukwaa la kidijitali la maafisa wa Jeshi la Polisi Tanzania. Toa citations, ripoti matukio, na dhibiti patroli.",
  manifest: "/officer-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TPF Afisa",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "TPF Afisa",
    "application-name": "TPF Afisa",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaManager />
      {children}
    </>
  );
}
