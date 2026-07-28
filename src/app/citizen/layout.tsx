import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "TPF Raia — Huduma za Raia | Tanzania Police Force",
  description: "Jukwaa la kidijitali la raia — huduma za polisi mtandaoni. Ripoti, malipo, maombi na taarifa.",
  manifest: "/citizen-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TPF Raia",
    startupImage: [
      { url: "/police-logo.png", media: "(device-width: 320px)" },
      { url: "/police-logo.png" },
    ],
  },
  icons: {
    apple: [
      { url: "/police-logo.png", sizes: "120x120", type: "image/png" },
      { url: "/police-logo.png", sizes: "152x152", type: "image/png" },
      { url: "/police-logo.png", sizes: "180x180", type: "image/png" },
      { url: "/police-logo.png", sizes: "192x192", type: "image/png" },
    ],
    icon: [
      { url: "/police-logo.png", sizes: "48x48", type: "image/png" },
      { url: "/police-logo.png", sizes: "72x72", type: "image/png" },
      { url: "/police-logo.png", sizes: "96x96", type: "image/png" },
      { url: "/police-logo.png", sizes: "144x144", type: "image/png" },
      { url: "/police-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/police-logo.png", sizes: "512x512", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  openGraph: {
    title: "TPF Raia — Huduma za Raia",
    description: "Jukwaa la kidijitali la raia — ripoti, malipo, na huduma",
    siteName: "TPF Raia",
    type: "website",
    locale: "sw_TZ",
    images: [{ url: "/police-logo.png", width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  // Citizen portal shares root layout (globals.css, Providers, ThemeProvider).
  // PWA manager is embedded inside CitizenShell so it only renders for authenticated screens.
  // Service worker registration is handled by CitizenPwaManager.
  return <>{children}</>;
}
// build: v4 — citizen portal PWA + mobile-first + auto-link auth fix
