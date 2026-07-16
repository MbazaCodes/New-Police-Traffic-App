import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TZ Police Web App',
  description: 'Standalone web app scaffold under apps/web',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
