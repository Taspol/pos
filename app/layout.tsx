import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { POSProvider } from "@/context/POSContext";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuchaShabu",
  description: "shabu for everyone",
};

import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Thai:wght@100..800&family=Sriracha&display=swap" rel="stylesheet" />
      </head>
      <body>
        <POSProvider>
          <Header />
          {children}
        </POSProvider>
      </body>
    </html>
  );
}
