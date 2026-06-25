"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Sparkles,
  CreditCard,
  ChevronDown,
  Settings,
  BarChart3,
  FileText,
  TrendingUp,
  Coins,
  LogOut,
  FolderDot,
  X
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  isComingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/advisor", label: "AI Advisor", icon: Sparkles, badge: "AI" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, isComingSoon: true },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/investments", label: "Investments", icon: TrendingUp, isComingSoon: true },
  { href: "/subscriptions", label: "Subscriptions", icon: Coins, isComingSoon: true },
  { href: "/billing", label: "Billing & Plans", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { user, isLoaded } = useUser();
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [dbSize, setDbSize] = useState<string>("2.4 KB");
  const [dbPercent, setDbPercent] = useState<number>(24);
  const pathname = usePathname();

  useEffect(() => {
    const checkPlan = () => {
      if (typeof window !== "undefined") {
        const plan = localStorage.getItem("fintrack_plan") || "free";
        setCurrentPlan(plan as "free" | "pro");
        const allData = JSON.stringify(localStorage);
        const bytes = allData.length || 2400;
        const kb = (bytes / 1024).toFixed(1);
        setDbSize(`${kb} KB`);
        const limitKb = plan === "pro" ? 10240 : 100;
        const percent = Math.min(100, Math.max(8, Math.round((parseFloat(kb) / limitKb) * 100)));
        setDbPercent(percent);
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
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-72 md:w-64 bg-white border-r border-[#E9ECF5] flex flex-col shrink-0 select-none z-50
        transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex
        ${isOpen ? "translate-x-0 shadow-2xl shadow-black/10" : "-translate-x-full"}
      `}>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl border border-[#E9ECF5] bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors md:hidden z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Workspace Switcher */}
        <div className="p-4 border-b border-[#E9ECF5]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F7F8FC] cursor-pointer transition-colors duration-200 group">
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="FinTrack Logo"
                className="w-9 h-9 rounded-xl object-contain bg-slate-50 border border-slate-100 shadow-sm shrink-0"
              />
              <div className="text-left min-w-0">
                <span className="block font-bold text-sm text-[#0A0D14] truncate leading-tight">
                  {user?.firstName ? `${user.firstName}'s Space` : "Personal Space"}
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  FinTrack Wealth OS
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#6D5DFC] transition-colors" />
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge, isComingSoon }) => {
            const active = isActive(href);

            if (isComingSoon) {
              return (
                <div
                  key={label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed group relative"
                  title="Coming Soon in V3 Enterprise"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 text-slate-300" strokeWidth={2} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                  active
                    ? "text-[#6D5DFC] bg-[#6D5DFC]/5"
                    : "text-slate-500 hover:text-[#0A0D14] hover:bg-[#F7F8FC]/50"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#6D5DFC]" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 transition-colors ${active ? "text-[#6D5DFC]" : "text-slate-400 group-hover:text-[#6D5DFC]"}`}
                    strokeWidth={2.2}
                  />
                  <span>{label}</span>
                </div>

                {badge && (
                  <span className="text-[9px] font-black text-white bg-gradient-to-r from-[#6D5DFC] to-[#8B7CFF] px-2 py-0.5 rounded-full uppercase shadow-sm">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storage Analytics */}
        <div className="p-4 border-t border-[#E9ECF5] bg-[#F7F8FC]/40 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <FolderDot className="w-3.5 h-3.5 text-[#6D5DFC]" /> Local Storage
              </span>
              <span>{dbSize} / {currentPlan === "pro" ? "10 MB" : "100 KB"}</span>
            </div>
            <div className="w-full h-1.5 bg-[#E9ECF5] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6D5DFC] to-[#8B7CFF] rounded-full transition-all duration-500"
                style={{ width: `${dbPercent}%` }}
              />
            </div>
          </div>

          {currentPlan === "free" && (
            <div className="p-3 bg-white border border-[#E9ECF5] rounded-xl text-xs space-y-2 shadow-sm">
              <div className="font-extrabold text-[#0A0D14] flex items-center gap-1.5">
                🚀 Unlock V3 Enterprise
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Get unlimited transaction entries, export logs, and AI Wealth Projections.
              </p>
              <Link
                href="/billing"
                onClick={onClose}
                className="block text-center w-full py-1.5 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white font-bold rounded-lg shadow-sm transition-all duration-200 text-[10px]"
              >
                Upgrade Space
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Block */}
        <div className="p-4 border-t border-[#E9ECF5] bg-white">
          {isLoaded && user && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-grow">
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt="Avatar"
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#E9ECF5] shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00C875] border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#0A0D14] flex items-center gap-1.5 truncate">
                    {user.fullName || "User"}
                    {currentPlan === "pro" && (
                      <span className="bg-[#6D5DFC] text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-sm">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-semibold">
                    {user.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
              </div>

              <SignOutButton redirectUrl="/">
                <button
                  title="Log out"
                  className="w-8 h-8 rounded-lg border border-[#E9ECF5] hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
