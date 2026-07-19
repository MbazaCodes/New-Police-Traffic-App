import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

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
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}