import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TZ Police Digital Platform — Officer PWA",
  description: "Tanzania Police Force digital platform for officers. Usalama Wetu, Jukumu Letu.",
  keywords: ["Tanzania Police", "TPF", "Officer PWA", "Digital Platform"],
  authors: [{ name: "Tanzania Police Force" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/police-logo.png",
    apple: "/police-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TZ Police",
  },
  openGraph: {
    title: "TZ Police Digital Platform",
    description: "Tanzania Police Force — Officer PWA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TZ Police Digital Platform",
    description: "Tanzania Police Force — Officer PWA",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
