import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
  icons: {
    icon: "/police-logo.png",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
