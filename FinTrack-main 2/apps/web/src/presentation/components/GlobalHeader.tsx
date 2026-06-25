"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Sparkles, KeyRound, Menu } from "lucide-react";

// Helper component matching the user's snippet usage
const Show = ({ when, children }: { when: "signed-in" | "signed-out"; children: React.ReactNode }) => {
  return when === "signed-in" ? <SignedIn>{children}</SignedIn> : <SignedOut>{children}</SignedOut>;
};

export default function GlobalHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname();

  // Hide the global header on the landing page to avoid duplication with the landing page's custom header
  if (pathname === "/") return null;

  return (
    <header className="flex justify-end items-center px-8 py-3 h-16 border-b border-[#E9ECF5] bg-white/70 backdrop-blur-md sticky top-0 shrink-0 z-30 select-none">
      
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onOpenMenu}
        className="mr-auto md:hidden p-2 rounded-xl border border-[#E9ECF5] bg-white hover:bg-slate-50 text-slate-600 transition-colors z-40 cursor-pointer shadow-sm flex items-center justify-center"
      >
        <Menu className="w-5 h-5" strokeWidth={2.2} />
      </button>

      {/* Search Bar / System Indicator Mockup */}
      <div className="mr-auto hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#F7F8FC] border border-[#E9ECF5] px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#00C875] animate-pulse"></span>
          <span>FinTrack Node Active</span>
        </div>
      </div>

      {/* Auth Controls */}
      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0A0D14] transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-[#F7F8FC]">
              <KeyRound className="w-4 h-4 text-slate-400" /> Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="flex items-center gap-2 px-4.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#6D5DFC] to-[#8B7CFF] rounded-xl hover:shadow-md hover:shadow-[#6D5DFC]/10 transition-all duration-200 cursor-pointer active:scale-95">
              <Sparkles className="w-3.5 h-3.5" /> Start Free Space
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center gap-3">
            {/* Quick Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#6D5DFC]/5 border border-[#6D5DFC]/10 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#6D5DFC] shadow-sm select-none">
              <span className="w-1 h-1 rounded-full bg-[#6D5DFC]"></span>
              Active Account
            </div>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-xl ring-2 ring-[#E9ECF5]"
                }
              }}
            />
          </div>
        </Show>
      </div>

    </header>
  );
}
