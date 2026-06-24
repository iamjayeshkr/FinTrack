"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

const Show = ({ when, children }: { when: "signed-in" | "signed-out"; children: React.ReactNode }) => {
  return when === "signed-in" ? <SignedIn>{children}</SignedIn> : <SignedOut>{children}</SignedOut>;
};


export default function Sidebar() {
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const pathname = usePathname();

  useEffect(() => {
    const checkPlan = () => {
      if (typeof window !== "undefined") {
        const plan = localStorage.getItem("fintrack_plan") || "free";
        setCurrentPlan(plan as "free" | "pro");
      }
    };
    checkPlan();
    window.addEventListener("storage", checkPlan);
    window.addEventListener("fintrack_plan_changed", checkPlan);
    return () => {
      window.removeEventListener("storage", checkPlan);
      window.removeEventListener("fintrack_plan_changed", checkPlan);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  if (pathname === "/") return null;

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/80 backdrop-blur-md flex flex-col p-6 shrink-0">
      {/* Brand & Sync Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            FinTrack
          </span>
        </div>
        
        {/* SaaS Cloud Sync Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-semibold text-emerald-700 select-none shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Synced
        </div>
      </div>
      
      {/* Nav Menu */}
      <nav className="flex flex-col gap-1 flex-grow">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/dashboard") 
              ? "text-indigo-700 bg-indigo-50 border-r-2 border-indigo-600" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <svg className={`w-4 h-4 ${isActive("/dashboard") ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          Dashboard
        </Link>
        
        <Link 
          href="/transactions" 
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/transactions") 
              ? "text-indigo-700 bg-indigo-50 border-r-2 border-indigo-600" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <svg className={`w-4 h-4 ${isActive("/transactions") ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Transactions
        </Link>

        <Link 
          href="/budgets" 
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/budgets") 
              ? "text-indigo-700 bg-indigo-50 border-r-2 border-indigo-600" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <svg className={`w-4 h-4 ${isActive("/budgets") ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Budgets
        </Link>

        <Link 
          href="/goals" 
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/goals") 
              ? "text-indigo-700 bg-indigo-50 border-r-2 border-indigo-600" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <svg className={`w-4 h-4 ${isActive("/goals") ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Goals
        </Link>

        <Link 
          href="/advisor" 
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/advisor") 
              ? "text-indigo-700 bg-indigo-50 border-r-2 border-indigo-600" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <svg className={`w-4 h-4 ${isActive("/advisor") ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-1.813-5.096L2.091 14.09 7.187 13.18 8 8l1.813 5.096 5.096 1.007-5.096 1.801zM19 10l.5-2.5 2.5-.5-2.5-.5-.5-2.5-.5 2.5-2.5.5 2.5.5.5 2.5z" />
          </svg>
          AI Advisor
        </Link>

        <Link 
          href="/billing" 
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive("/billing") 
              ? "text-indigo-700 bg-indigo-50 border-r-2 border-indigo-600" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <svg className={`w-4 h-4 ${isActive("/billing") ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Billing & Plans
        </Link>
      </nav>
      
      {/* SaaS Free Account upgrade prompt */}
      {currentPlan === "free" && (
        <div className="mt-auto mb-4 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs space-y-2.5 shadow-sm">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>🚀</span> Unlock Pro Features
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Get unlimited transaction entries, export logs, and AI projections.
          </p>
          <Link 
            href="/billing" 
            className="block text-center w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all text-[11px]"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Profile / Auth Section */}
      <div className={`pt-4 border-t border-slate-200 ${currentPlan === "pro" ? "mt-auto" : ""}`}>
        <Show when="signed-out">
          <div className="flex flex-col gap-2">
            <SignInButton mode="modal">
              <button className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 justify-center cursor-pointer">
                🔑 Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 justify-center cursor-pointer">
                ✨ Sign Up
              </button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-grow">
              <UserButton afterSignOutUrl="/" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-slate-800 flex items-center gap-1.5 truncate">
                  Rudra Sharma
                  {currentPlan === "pro" && (
                    <span className="bg-indigo-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-sm">
                      PRO
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate">Young Professional</div>
              </div>
            </div>
            {currentPlan === "pro" && (
              <span className="w-4 h-4 bg-indigo-50 text-indigo-600 font-black text-[10px] flex items-center justify-center rounded-full border border-indigo-100 shadow-sm select-none shrink-0">
                ★
              </span>
            )}
          </div>
        </Show>
      </div>

    </aside>
  );
}
