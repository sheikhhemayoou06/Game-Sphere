import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Game Sphere — Powering Every Game. Everywhere.",
  description: "India's National Sports Digital Infrastructure Platform. Centralized, paperless, multi-sport system for tournaments from school to international level.",
  keywords: "sports, tournament, cricket, football, kabaddi, India, digital sports, game sphere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
