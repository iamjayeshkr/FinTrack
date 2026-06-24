import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "../presentation/components/Sidebar";

export const metadata: Metadata = {
  title: "FinTrack - Personal Wealth Command Center",
  description: "Enterprise-grade budgeting, goals tracking, and wealth analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="antialiased min-h-screen bg-[#f8fafc] text-slate-900">
        <ClerkProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar Navigation - handles its own auth visibility checks */}
            <Sidebar />
            
            {/* Main Workspace */}
            <main className="flex-1 min-w-0 flex flex-col">
              {children}
            </main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}


