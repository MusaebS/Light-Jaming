import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'SCRAP PILGRIM',
  description: 'A tiny replayable scavenging action prototype built with Next.js + Phaser.'
};

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
