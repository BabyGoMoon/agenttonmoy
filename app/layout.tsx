import type React from "react";
import type { Metadata } from "next";
import { Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import HydrationLoader from "@/components/HydrationLoader";

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-rajdhani",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: "Agent Tonmoy - Bug Hunting Tools",
  description: "Professional security tools for ethical bug hunting and penetration testing",
  generator: "Agent Tonmoy Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable} antialiased`}>
      <body>
        <HydrationLoader>{children}</HydrationLoader>
      </body>
    </html>
  );
}
