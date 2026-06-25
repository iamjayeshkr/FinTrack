import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from 'next/font/google';
import LayoutWrapper from "../presentation/components/LayoutWrapper";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "FinTrack - Personal Wealth Command Center",
  description: "Enterprise-grade budgeting, goals tracking, and wealth analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8fafc] text-slate-900`}>
        <ClerkProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ClerkProvider>
      </body>
    </html>
  );
}


