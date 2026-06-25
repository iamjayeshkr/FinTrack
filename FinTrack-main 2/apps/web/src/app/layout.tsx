import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from 'next/font/google';
import Sidebar from "../presentation/components/Sidebar";
import GlobalHeader from "../presentation/components/GlobalHeader";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#f8fafc] text-slate-900`}>
        <ClerkProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar Navigation - handles its own auth visibility checks */}
            <Sidebar />
            
            {/* Main Workspace */}
            <main className="flex-1 min-w-0 flex flex-col">
              {/* Global Header containing Clerk login/signup elements */}
              <GlobalHeader />
              <div className="flex-grow flex flex-col">
                {children}
              </div>
            </main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}


