import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://104.152.50.173"),
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
      <head>
        {/* PWA meta tags */}
        <meta name="application-name" content="TPF Digital" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TPF Digital" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f2347" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#0f2347" media="(prefers-color-scheme: light)" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="format-detection" content="telephone=yes" />
        {/* Apple splash screens */}
        <link rel="apple-touch-icon" href="/police-logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/police-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/police-logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/police-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Polyfill crypto.randomUUID for HTTP (non-secure) contexts */}
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
            crypto.randomUUID = function() {
              return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
                return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
              });
            };
          }
          // Register service worker
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(function(reg) { console.log('SW registered:', reg.scope); })
                .catch(function(err) { console.log('SW error:', err); });
            });
          }
        `}} />
      </head>
      <body className="antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}