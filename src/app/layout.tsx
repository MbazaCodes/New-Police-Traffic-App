import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "TZ Police Digital Platform",
  description: "Tanzania Police Force digital platform. Usalama Wetu, Jukumu Letu.",
  keywords: ["Tanzania Police", "TPF", "Digital Platform"],
  authors: [{ name: "Tanzania Police Force" }],
  icons: {
    icon: [
      { url: "/police-logo.png", type: "image/png", sizes: "32x32" },
      { url: "/police-logo.png", type: "image/png", sizes: "64x64" },
    ],
    apple: [{ url: "/police-logo.png", type: "image/png" }],
    shortcut: "/police-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
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
      <body className="antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}