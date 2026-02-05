import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { TamboClientProvider } from "@/components/TamboClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeOps Co-pilot",
  description: "Real-time cloud safety and cost monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground bg-background`}
      >
        <TamboClientProvider>
          <AuthProvider>
            <div className="relative min-h-screen overflow-hidden">
              <div className="hud-overlay" />
              <div className="vignette" />
              <div className="crt-grain" />
              {children}
            </div>
          </AuthProvider>
        </TamboClientProvider>
      </body>
    </html>
  );
}
