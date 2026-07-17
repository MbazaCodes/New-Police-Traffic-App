import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { PwaRegister } from "@/components/pwa-register";
import { bootstrap } from "@/bootstrap";

bootstrap();

const isAdminMode = process.env.NEXT_PUBLIC_APP_MODE === "admin";

export const metadata: Metadata = {
  title: isAdminMode
    ? "TZ Police — Admin & Command Web"
    : "TZ Police Digital Platform — Officer PWA",
  description: isAdminMode
    ? "Tanzania Police Force — Admin & Command Dashboard. Restricted Access."
    : "Tanzania Police Force digital platform for officers. Usalama Wetu, Jukumu Letu.",
  keywords: isAdminMode
    ? ["Tanzania Police", "TPF", "Admin", "Command Dashboard"]
    : ["Tanzania Police", "TPF", "Officer PWA", "Digital Platform"],
  authors: [{ name: "Tanzania Police Force" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/police-logo.png",
    apple: "/police-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: isAdminMode ? "TZ Police Admin" : "TZ Police",
  },
  openGraph: {
    title: isAdminMode ? "TZ Police Admin & Command" : "TZ Police Digital Platform",
    description: isAdminMode
      ? "Tanzania Police Force — Admin & Command Dashboard"
      : "Tanzania Police Force — Officer PWA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: isAdminMode ? "TZ Police Admin & Command" : "TZ Police Digital Platform",
    description: isAdminMode
      ? "Tanzania Police Force — Admin & Command Dashboard"
      : "Tanzania Police Force — Officer PWA",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A237E" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw" suppressHydrationWarning>
      <body
        className={`antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <PwaRegister />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
