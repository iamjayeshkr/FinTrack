"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Database, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Activity, 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  TrendingDown, 
  Plus, 
  Star,
  Users,
  Building,
  Briefcase,
  UserCheck,
  Zap,
  Globe,
  Settings,
  X,
  ArrowUpRight,
  ShieldCheck,
  Cpu
} from "lucide-react";

// Interactive Heatmap Component (Light Mode)
function SpendingHeatmap() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  const shades = [
    "bg-indigo-50 border-indigo-100", 
    "bg-indigo-100 border-indigo-200", 
    "bg-indigo-300 border-indigo-400", 
    "bg-indigo-500 border-indigo-500", 
    "bg-indigo-600 border-indigo-600 text-white"
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, idx) => {
          const shadeIdx = (idx * 3 + 7) % shades.length;
          const val = idx * 180 + 250;
          return (
            <div 
              key={idx} 
              onMouseEnter={() => setHoveredDay(idx)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`aspect-square rounded-md ${shades[shadeIdx]} border hover:scale-110 hover:border-indigo-400 transition-all duration-200 cursor-pointer relative group`}
            >
              {hoveredDay === idx && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#090915] text-white text-[9px] px-2 py-1 rounded-md shadow-xl z-30 whitespace-nowrap">
                  Day {idx + 1}: ₹{val.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 font-bold select-none pt-1">
        <span>Less Spends</span>
        <span>More Spends</span>
      </div>
    </div>
  );
}

// Typing AI Chat Simulator Component (Light Mode)
function ChatSimulator() {
  const [messages, setMessages] = useState([
    { role: "user", content: "Swiggy aur Zomato par expenses control kaise karein?" },
    { role: "assistant", content: "Analyzing your local transactions... 🔍\n\nIn the last 30 days, you spent **₹14,580** across **18 food deliveries** (averaging ₹810 per order). This accounts for **32% of your monthly discretionary budget**.", showCards: false }
  ]);
  
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const triggerAudit = (prompt: string, reply: string, isHinglish: boolean) => {
    setActiveChip(prompt);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, showCards: true }
      ]);
    }, 1200);
  };

  return (
    <div className="w-full bg-white border border-[#E9ECF5] rounded-2xl shadow-xl overflow-hidden aspect-[16/11] flex flex-col justify-between relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E9ECF5] flex items-center justify-between bg-slate-50 shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-800 tracking-wider uppercase">FinTrack RAG Intelligence</span>
        </div>
        <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold px-2 py-0.5 rounded uppercase">Connected</span>
      </div>

      {/* Message timeline */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto flex flex-col justify-end text-xs leading-relaxed relative z-10 bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end ml-auto flex-row-reverse" : "self-start mr-auto"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 border border-slate-200 text-slate-500"}`}>
              {msg.role === "user" ? "U" : "🤖"}
            </div>
            <div className={`p-3 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-50 border border-[#E9ECF5] text-slate-700 rounded-tl-none"} space-y-2`}>
              <p className="whitespace-pre-line font-medium">{msg.content}</p>
              
              {msg.showCards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[10px] animate-fadeIn">
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#00C875] text-[8px] uppercase tracking-wider">💡 Suggested Action</span>
                    <div className="bg-emerald-50/50 border border-[#00C875]/20 p-2 rounded-lg text-slate-600 font-semibold">
                      Set a weekly limit of ₹2,500 on food delivery apps.
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-rose-500 text-[8px] uppercase tracking-wider">⚠️ Warnings</span>
                    <div className="bg-rose-50/50 border border-rose-100 p-2 rounded-lg text-slate-600 font-semibold">
                      Food limits will breach in 4 days if pacing continues.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick reply chips */}
      <div className="px-5 pb-1 flex flex-wrap gap-2 select-none relative z-10 shrink-0 bg-white">
        <button 
          onClick={() => triggerAudit("SIP target velocity check karo", "Analyzing savings velocity... 📈\n\nYour Goa Vacation SIP (₹1.5L target) is at 68% completion. By keeping your monthly deposit at ₹15,000, you will hit the target by **December 2025** on track.", true)}
          disabled={activeChip !== null}
          className="px-2.5 py-1.5 bg-slate-50 border border-[#E9ECF5] hover:border-indigo-600/35 text-indigo-600 hover:bg-indigo-50 rounded-full text-[9px] font-bold transition-all cursor-pointer shadow-sm"
        >
          📈 SIP velocity check
        </button>
        <button 
          onClick={() => triggerAudit("Can I afford a new MacBook Pro?", "Financial projection running... 💻\n\nBased on your current cash position of ₹2,45,300 and monthly savings of ₹45,000, purchasing a ₹1,20,000 MacBook Pro M4 today is **Affordable**, preserving ₹1.2L in emergency runways.", false)}
          disabled={activeChip !== null}
          className="px-2.5 py-1.5 bg-slate-50 border border-[#E9ECF5] hover:border-indigo-600/35 text-indigo-600 hover:bg-indigo-50 rounded-full text-[9px] font-bold transition-all cursor-pointer shadow-sm"
        >
          💻 MacBook Affordability
        </button>
      </div>

      {/* Input panel mockup */}
      <div className="p-4 bg-slate-50 border-t border-[#E9ECF5] flex gap-2 shrink-0 select-none relative z-10">
        <input 
          type="text" 
          placeholder="Ask: Swiggy/Zomato limit alert?" 
          disabled 
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 text-slate-500 focus:outline-none"
        />
        <button disabled className="px-4 bg-[#6D5DFC] text-white rounded-xl cursor-not-allowed">➔</button>
      </div>
    </div>
  );
}

// Main Page Component (Light Mode Redesign)
function LandingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeFeatureTab, setActiveFeatureTab] = useState<"dashboard" | "expense" | "budgets" | "investments" | "goals" | "ai">("dashboard");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-600 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 font-sans relative overflow-x-hidden">
      
      {/* Background Glowing Blobs (Light Mode) */}
      <div className="absolute top-[-150px] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-400/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[250px] right-[5%] w-[450px] h-[450px] rounded-full bg-violet-400/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[1000px] left-[15%] w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none"></div>
      
      {/* Global light grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none z-0"></div>

      {/* Sticky Header Navbar */}
      <header className="border-b border-[#E9ECF5] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40 shrink-0 shadow-sm relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 select-none group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6D5DFC] to-[#8B7CFF] flex items-center justify-center shadow-md shadow-[#6D5DFC]/10 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-[#0A0D14] leading-none">FinTrack</span>
              <span className="text-[7px] text-[#6D5DFC] font-mono tracking-widest uppercase mt-0.5">WEALTH OS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
            <a href="#features" className="hover:text-[#6D5DFC] transition-colors">Features</a>
            <a href="#problem" className="hover:text-[#6D5DFC] transition-colors">Solutions</a>
            <a href="#security" className="hover:text-[#6D5DFC] transition-colors">Security</a>
            <a href="#pricing" className="hover:text-[#6D5DFC] transition-colors">Pricing</a>
            <a href="#logo-concepts" className="hover:text-[#6D5DFC] transition-colors">Brand Identity</a>
          </nav>

          {/* Auth Action triggers */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <button className="text-slate-500 hover:text-[#0A0D14] transition-colors cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/dashboard">
                <button className="px-4 py-2.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white rounded-lg transition-all shadow-md shadow-[#6D5DFC]/15 cursor-pointer hover:scale-102">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white rounded-lg transition-all shadow-md shadow-[#6D5DFC]/15 cursor-pointer flex items-center gap-1.5 hover:scale-102"
              >
                <span>Go to Dashboard</span>
                <span className="text-[10px]">➔</span>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          
          {/* Left Column: Title, Subtitle, CTA */}
          <div className="lg:col-span-5 space-y-8 text-left relative">
            <div className="inline-flex items-center gap-2 bg-[#6D5DFC]/5 border border-[#6D5DFC]/10 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold text-[#6D5DFC] select-none shadow-sm">
              <span>🏆</span>
              <span>Trusted by 10,000+ software engineers & founders</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0A0D14] leading-[1.08] select-none">
              Command your <br />
              <span className="bg-gradient-to-r from-[#6D5DFC] via-[#8B7CFF] to-[#6D5DFC] bg-clip-text text-transparent">
                financial future.
              </span>
            </h1>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl font-semibold">
              Track transaction histories, configure monthly budgets, log compounding goals, and consult your offline RAG financial advisor—all in a premium, private client-first interface.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="px-6 py-3.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#6D5DFC]/20 flex items-center gap-2.5 cursor-pointer text-xs hover:scale-102">
                    <span>Start Free Today</span>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] leading-none shrink-0">➔</span>
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#6D5DFC]/20 flex items-center gap-2.5 cursor-pointer text-xs hover:scale-102"
                >
                  <span>Go to Dashboard</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] leading-none shrink-0">➔</span>
                </Link>
              </SignedIn>
              
              <button 
                onClick={() => alert("Welcome to FinTrack! Click Start Free to log into your Personal Wealth OS dashboard.")}
                className="px-6 py-3.5 bg-white border border-[#E9ECF5] hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer shadow-sm"
              >
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-5 pt-4 text-[10px] font-extrabold text-slate-400 select-none">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#6D5DFC]" /> Bank-grade Security
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu size={13} className="text-[#6D5DFC]" /> Offline-First DB
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-[#6D5DFC]" /> End-to-End Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-[#6D5DFC]" /> No Advertisements
              </span>
            </div>
          </div>

          {/* Right Column: High Fidelity Dashboard Mockup (Light Mode) */}
          <div className="lg:col-span-7 flex justify-center items-center relative w-full pr-4 pl-4 select-none">
            {/* Mesh background glow inside mockup */}
            <div className="absolute w-[80%] h-[80%] bg-[#6D5DFC]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            {/* Main Dashboard Window Container */}
            <div className="w-full bg-white border border-[#E9ECF5] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 aspect-[16/10.5] transform hover:scale-[1.01] transition-transform duration-300">
              
              {/* titlebar */}
              <div className="px-4 py-3 bg-slate-50 border-b border-[#E9ECF5] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></span>
                </div>
                <div className="px-3 py-1 bg-white border border-[#E9ECF5] rounded-md text-[9px] text-slate-400 font-mono w-44 text-center truncate font-bold">
                  fintrack.io/dashboard
                </div>
                <div className="w-8"></div>
              </div>
              
              {/* App Internal Workspace */}
              <div className="flex-1 flex overflow-hidden">
                {/* Mockup Sidebar */}
                <div className="w-32 bg-[#F7F8FC]/60 border-r border-[#E9ECF5] p-3 flex flex-col gap-3.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-1 pb-1.5 border-b border-slate-200/50">
                    <div className="w-4.5 h-4.5 rounded bg-[#6D5DFC] flex items-center justify-center text-[10px] text-white">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="font-extrabold text-[9px] text-[#0A0D14] tracking-tight">FinTrack</span>
                  </div>
                  <ul className="space-y-1.5 text-[8px] font-bold text-slate-500">
                    <li className="flex items-center gap-2 px-2 py-1.5 bg-white border border-[#E9ECF5] text-[#6D5DFC] rounded-md shadow-sm">
                      <span>🏠</span> Overview
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                      <span>📖</span> Transactions
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                      <span>✉️</span> Budgets
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-400">
                      <span>🎯</span> Goals <span className="bg-[#6D5DFC]/10 text-[#6D5DFC] text-[6px] px-1 rounded ml-auto">PRO</span>
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                      <span>💬</span> AI Advisor
                    </li>
                  </ul>
                </div>
                
                {/* Mockup Content area */}
                <div className="flex-1 bg-[#F7F8FC]/40 p-3.5 space-y-3.5 overflow-hidden flex flex-col justify-between">
                  {/* Header row */}
                  <div className="flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-[#0A0D14]">Personal Wealth command</span>
                    <span className="text-[6px] text-[#00C875] border border-[#00C875]/20 bg-[#00C875]/5 rounded px-1.5 py-0.5 font-extrabold uppercase">Local Sync Active</span>
                  </div>
                  
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 gap-2.5 shrink-0">
                    <div className="border border-[#E9ECF5] p-2 rounded-lg space-y-0.5 bg-white shadow-sm">
                      <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Net worth</span>
                      <div className="text-[11px] font-black text-[#0A0D14]">₹ 8,42,18,930</div>
                      <span className="text-[6px] text-[#00C875] font-black flex items-center gap-0.5">
                        <span>▲</span> +3.45%
                      </span>
                    </div>
                    <div className="border border-[#E9ECF5] p-2 rounded-lg space-y-0.5 bg-white shadow-sm">
                      <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Monthly Cash Flow</span>
                      <div className="text-[11px] font-black text-[#0A0D14]">₹ 2,45,300</div>
                      <span className="text-[6px] text-[#00C875] font-black flex items-center gap-0.5">
                        <span>▲</span> +18.6%
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart area */}
                  <div className="border border-[#E9ECF5] rounded-lg p-2.5 flex-1 flex flex-col justify-between min-h-0 bg-white shadow-sm relative">
                    <div className="flex-1 relative flex items-end">
                      <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradHero2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6D5DFC" stopOpacity="0.15"/>
                            <stop offset="100%" stopColor="#6D5DFC" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <path d="M 0,22 Q 15,18 35,14 T 70,8 T 100,4" fill="none" stroke="#6D5DFC" strokeWidth="1.5" />
                        <path d="M 0,22 Q 15,18 35,14 T 70,8 T 100,4 L 100,25 L 0,25 Z" fill="url(#chartGradHero2)" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[5px] text-slate-400 font-mono mt-1 select-none font-bold">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    </div>
                  </div>

                  {/* Bottom metrics */}
                  <div className="grid grid-cols-2 gap-2.5 shrink-0">
                    <div className="border border-[#E9ECF5] p-2 rounded-lg flex items-center gap-2 bg-white shadow-sm">
                      <div className="relative w-8 h-8 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#E9ECF5" strokeWidth="3" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#6D5DFC" strokeWidth="3" strokeDasharray="54 75" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#00C875" strokeWidth="3" strokeDasharray="13 75" strokeDashoffset="-54" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[5px] font-black text-slate-800 font-mono">72%</div>
                      </div>
                      <div className="text-[5px] text-slate-400 font-bold space-y-0.5 leading-none">
                        <div className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC]"></span> Equities 72%</div>
                        <div className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00C875]"></span> Cash 18%</div>
                      </div>
                    </div>
                    
                    <div className="border border-[#E9ECF5] p-2 rounded-lg space-y-1 text-[5px] bg-white shadow-sm">
                      <div className="flex justify-between items-center text-slate-400 font-bold uppercase pb-0.5 border-b border-[#E9ECF5]">
                        <span>Ledger Entry</span>
                      </div>
                      <div className="space-y-0.5 text-slate-600 font-mono font-bold">
                        <div className="flex justify-between"><span>Salary Credited</span><span className="text-[#00C875]">+₹1,85,000</span></div>
                        <div className="flex justify-between"><span>Mutual Fund SIP</span><span className="text-rose-500">-₹25,000</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Card 1: Milestone Goal (Bottom Left) */}
            <div className="absolute -bottom-5 -left-6 bg-white border border-[#E9ECF5] rounded-xl shadow-2xl p-3.5 w-44 z-20 flex flex-col gap-1.5 animate-bounce-slow">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <span className="text-[10px]">🎯</span>
                <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-wider">Milestone Goa SIP</span>
              </div>
              <div className="text-[8px] font-bold text-slate-500">Travel Fund</div>
              <div className="text-xs font-black text-[#0A0D14] leading-none font-mono">₹ 1,50,000</div>
              <div className="space-y-1">
                <div className="w-full h-1 bg-[#F7F8FC] rounded-full overflow-hidden border border-slate-150">
                  <div className="w-[68%] h-full bg-[#6D5DFC] rounded-full"></div>
                </div>
                <div className="flex justify-between text-[6px] text-slate-400 font-bold leading-none">
                  <span>68% Completed</span>
                  <span>Target: Dec 2025</span>
                </div>
              </div>
            </div>

            {/* Floating Card 2: AI Insight (Top Right) */}
            <div className="absolute -top-5 -right-6 bg-white border border-[#E9ECF5] rounded-xl shadow-2xl p-3 w-40 z-20 flex flex-col gap-1.5 animate-bounce-slow" style={{ animationDelay: "2.5s" }}>
              <div className="flex items-center gap-1 pb-1 border-b border-slate-100">
                <span className="text-[9px]">✨</span>
                <span className="text-[7px] font-extrabold text-[#6D5DFC] uppercase tracking-wider">AI INSIGHT</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-normal font-bold">
                You can save <strong className="text-[#0A0D14] font-black">₹18,500 more</strong> this month.
              </p>
              <span className="text-[7px] text-[#6D5DFC] font-bold hover:underline cursor-pointer">
                Run optimization →
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Social Proof Logo Wall & Stats */}
      <section className="bg-white border-y border-[#E9ECF5] py-16 px-6 shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border border-[#E9ECF5] bg-[#F7F8FC]/60 backdrop-blur rounded-2xl p-8 shadow-md relative">
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#0A0D14] tracking-tight">10,000+</div>
              <div className="text-[9px] font-black text-[#6D5DFC] uppercase tracking-wider">Active Wealth Builders</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#0A0D14] tracking-tight">₹50 Cr+</div>
              <div className="text-[9px] font-black text-[#6D5DFC] uppercase tracking-wider">Assets Monitored</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#0A0D14] tracking-tight">1M+</div>
              <div className="text-[9px] font-black text-[#6D5DFC] uppercase tracking-wider">Transactions Processed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#0A0D14] tracking-tight">99.99%</div>
              <div className="text-[9px] font-black text-[#6D5DFC] uppercase tracking-wider">Uptime SLA Guarantee</div>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest select-none">
              compatible with major indian financial services
            </h3>
            
            {/* Grayscale partner logos wall */}
            <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 select-none opacity-50 hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-1 font-black text-slate-400 tracking-wider text-sm select-none">ZERODHA</div>
              <div className="flex items-center gap-1.5 font-extrabold text-slate-400 tracking-tight text-sm select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Groww
              </div>
              <div className="flex items-center gap-1 font-bold text-slate-400 text-sm select-none">
                <span>upstox</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-black tracking-widest text-slate-400 border border-slate-350 px-2 py-0.5 rounded select-none">
                <span>CRED</span>
              </div>
              <div className="flex items-center gap-0.5 font-bold italic text-slate-400 text-sm select-none">
                <span>Razorpay</span>
              </div>
              <div className="flex items-center gap-0.5 font-bold text-slate-400 text-sm select-none">
                <span className="text-slate-400">IND</span>
                <span>money</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-6 max-w-6xl mx-auto w-full text-center space-y-16 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">The Core Challenge</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">Why traditional finance apps fail.</h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Existing tools treat wealth like a static table of numbers. They sell your financial data to ads, or lack the offline automation needed to actually compound capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-sm space-y-4">
            <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-sm">❌</div>
            <h4 className="font-extrabold text-[#0A0D14] text-sm">Scattered Financial Data</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Your bank accounts, mutual funds, budgets, and goals live in isolated, incompatible dashboards.</p>
          </div>
          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-sm space-y-4">
            <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-sm">❌</div>
            <h4 className="font-extrabold text-[#0A0D14] text-sm">No Net Worth Visibility</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Tracking assets and liabilities is a manual spreadsheet nightmare that fails to reflect live progress.</p>
          </div>
          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-sm space-y-4">
            <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-sm">❌</div>
            <h4 className="font-extrabold text-[#0A0D14] text-sm">Zero Financial Intelligence</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Traditional apps tell you where your money went, but fail to guide you on how to save and allocate it.</p>
          </div>
        </div>

        <div className="pt-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-white border border-[#E9ECF5] rounded-2xl text-xs font-bold text-slate-600 shadow-sm">
            <span>💡</span>
            <span>Positioning: <strong className="font-black text-[#6D5DFC]">FinTrack</strong> acts as your Personal Wealth Operating System</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-24 px-6 bg-slate-50/50 border-y border-[#E9ECF5] w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">Platform Modules</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">Engineered for wealth compounding.</h2>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Every tool in the operating system is modular, offline-first, and designed to optimize your financial runway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Tab Selector Links */}
            <div className="lg:col-span-4 flex flex-col gap-2 shrink-0">
              <button 
                onClick={() => setActiveFeatureTab("dashboard")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "dashboard" 
                    ? "bg-white border-[#6D5DFC] shadow-md text-slate-800" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "dashboard" ? "bg-[#6D5DFC] text-white" : "bg-slate-100 text-slate-400"}`}><Layers size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs text-[#0A0D14]">Wealth Dashboard</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Asset allocations and accounts aggregates.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("expense")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "expense" 
                    ? "bg-white border-[#6D5DFC] shadow-md text-slate-800" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "expense" ? "bg-[#6D5DFC] text-white" : "bg-slate-100 text-slate-400"}`}><Activity size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs text-[#0A0D14]">Expense Intelligence</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Automated transaction categorization & tags.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("budgets")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "budgets" 
                    ? "bg-white border-[#6D5DFC] shadow-md text-slate-800" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "budgets" ? "bg-[#6D5DFC] text-white" : "bg-slate-100 text-slate-400"}`}><Wallet size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs text-[#0A0D14]">Budget Envelopes</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Monthly limits and custom spending caps.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("investments")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "investments" 
                    ? "bg-white border-[#6D5DFC] shadow-md text-slate-800" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "investments" ? "bg-[#6D5DFC] text-white" : "bg-slate-100 text-slate-400"}`}><PieChart size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs text-[#0A0D14]">Investment Tracking</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Monitor stocks, mutual funds, crypto, and gold.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("goals")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "goals" 
                    ? "bg-white border-[#6D5DFC] shadow-md text-slate-800" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "goals" ? "bg-[#6D5DFC] text-white" : "bg-slate-100 text-slate-400"}`}><TrendingUp size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs text-[#0A0D14]">Goal Planning</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Track emergency funds, vacation milestones, etc.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("ai")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "ai" 
                    ? "bg-white border-[#6D5DFC] shadow-md text-slate-800" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "ai" ? "bg-[#6D5DFC] text-white" : "bg-slate-100 text-slate-400"}`}><Sparkles size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs text-[#0A0D14]">AI Financial Advisor</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-semibold">Offline-capable Hinglish/English queries.</p>
                </div>
              </button>
            </div>

            {/* Tab Preview Dashboard (Light Mode) */}
            <div className="lg:col-span-8 bg-white border border-[#E9ECF5] rounded-2xl shadow-xl p-6 aspect-[16/10.5] flex flex-col justify-between overflow-hidden relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
              
              {activeFeatureTab === "dashboard" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-[#0A0D14]">Wealth Dashboard</h3>
                    <span className="text-[9px] font-extrabold text-[#00C875] bg-[#00C875]/5 border border-[#00C875]/20 px-2 py-0.5 rounded">Live Aggregate</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-[#E9ECF5] p-3 rounded-xl bg-slate-50">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total Assets</span>
                      <div className="text-sm font-black text-[#0A0D14] mt-1">₹ 9,50,00,000</div>
                    </div>
                    <div className="border border-[#E9ECF5] p-3 rounded-xl bg-slate-50">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Liabilities</span>
                      <div className="text-sm font-black text-rose-500 mt-1">₹ 1,07,81,070</div>
                    </div>
                    <div className="border border-[#E9ECF5] p-3 rounded-xl bg-indigo-50/50 border-indigo-150">
                      <span className="text-[8px] font-extrabold text-[#6D5DFC] uppercase tracking-wider">Net Position</span>
                      <div className="text-sm font-black text-[#6D5DFC] mt-1 font-mono">₹ 8,42,18,930</div>
                    </div>
                  </div>
                  <div className="border border-[#E9ECF5] rounded-xl p-4 flex-1 flex items-end bg-slate-50/50">
                    <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M 0,18 L 20,16 Q 40,12 60,10 T 80,6 T 100,2" fill="none" stroke="#6D5DFC" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              )}

              {activeFeatureTab === "expense" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-[#0A0D14]">Expense Intelligence</h3>
                    <span className="text-[9px] font-extrabold text-[#6D5DFC] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">Smart tagging</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 border border-[#E9ECF5] rounded-lg flex justify-between text-xs items-center">
                      <div>
                        <div className="font-bold text-[#0A0D14]">Swiggy Restaurant Delivery</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-bold">Category: Food & Dining · UPI Payment</div>
                      </div>
                      <span className="font-extrabold text-rose-500 font-mono">-₹850</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-[#E9ECF5] rounded-lg flex justify-between text-xs items-center">
                      <div>
                        <div className="font-bold text-[#0A0D14]">Amazon Web Services AWS</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-bold">Category: Subscriptions · Credit Card</div>
                      </div>
                      <span className="font-extrabold text-rose-500 font-mono">-₹4,290</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center font-bold">Flags recurring subscriptions and categorizes merchant transactions offline.</div>
                </div>
              )}

              {activeFeatureTab === "budgets" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-[#0A0D14]">Envelope Budget Limits</h3>
                    <span className="text-[9px] font-extrabold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">92% utilized</span>
                  </div>
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>🍔 Food & Dining</span>
                        <span>₹11,040 / ₹12,000</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="w-[92%] h-full bg-amber-500"></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>🚗 Uber & Travel</span>
                        <span>₹3,150 / ₹8,000</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="w-[39%] h-full bg-[#6D5DFC]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-150 rounded-lg text-[10px] text-amber-700 font-bold">
                    ⚠️ Alert: Food & Dining envelope is crossing 75% limit before the mid-month cycle.
                  </div>
                </div>
              )}

              {activeFeatureTab === "investments" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-[#0A0D14]">Investment Tracker</h3>
                    <span className="text-[9px] font-extrabold text-[#00C875] bg-[#00C875]/5 border border-[#00C875]/20 px-2 py-0.5 rounded">Live Rates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                    <div className="space-y-2 text-[10px] text-slate-500 font-bold">
                      <div className="flex justify-between items-center p-2 bg-slate-50 border border-[#E9ECF5] rounded-md">
                        <span>📈 Indian Equities (Nifty)</span><span>45%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 border border-[#E9ECF5] rounded-md">
                        <span>📊 Mutual Funds (SIP)</span><span>35%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 border border-[#E9ECF5] rounded-md">
                        <span>🪙 Digital Gold</span><span>10%</span>
                      </div>
                    </div>
                    {/* Circle chart */}
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-8 border-[#6D5DFC] flex items-center justify-center font-black text-slate-800">
                        80%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === "goals" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-[#0A0D14]">Milestone Goals</h3>
                    <span className="text-[9px] font-extrabold text-[#6D5DFC] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">Active milestones</span>
                  </div>
                  <div className="border border-[#E9ECF5] p-4 rounded-xl space-y-2.5 bg-slate-50 shadow-inner">
                    <div className="flex justify-between text-xs font-bold text-slate-850">
                      <span>MacBook Pro M4 Goal</span>
                      <span>₹45,000 / ₹1,20,000</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                      <div className="w-[37.5%] h-full bg-[#6D5DFC]"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold pt-1">
                      <span>Target Velocity: ₹15,000/mo</span>
                      <span>Estimated Timeline: 5 Months</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === "ai" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center border-b border-[#E9ECF5] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🤖</span>
                      <h3 className="text-xs font-extrabold text-[#0A0D14]">FinTrack Offline RAG</h3>
                    </div>
                    <span className="text-[8px] font-bold bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Latency: 8ms</span>
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-end text-[10px] font-semibold">
                    <div className="bg-[#6D5DFC] text-white p-2.5 rounded-xl rounded-tr-none max-w-[80%] self-end ml-auto shadow-sm">
                      Goa trip target hit kab tak hoga?
                    </div>
                    <div className="bg-slate-50 border border-[#E9ECF5] text-slate-700 p-2.5 rounded-xl rounded-tl-none max-w-[80%] self-start mr-auto">
                      Aapka current savings velocity ₹15,000/mo hai. Goa vacation pool me ₹1,02,000 saved hai, target ₹1.5L complete karne me lagbhag **3 mahine** aur lagenge.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Brand Identity / Logo Concepts Showcase */}
      <section id="logo-concepts" className="py-24 px-6 max-w-6xl mx-auto w-full text-center space-y-16 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">Brand Identity Concepts</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">VC-Ready brand architecture.</h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Designed to communicate growth, security, and trajectory. We explore three visual design pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Concept 1 */}
          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-4 border-t-4 border-t-[#6D5DFC]">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-[#6D5DFC] text-[8px] font-bold rounded uppercase">APPROVED CONCEPT</span>
              <span className="text-xs text-slate-400 font-bold">Concept 1</span>
            </div>
            
            <div className="h-28 bg-[#F7F8FC] rounded-xl border border-slate-200 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#6D5DFC] flex items-center justify-center shadow-md shadow-[#6D5DFC]/10">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="font-extrabold text-xl text-[#0A0D14] tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-[#0A0D14] text-sm">The Ascent Path</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">An abstract geometric rising trajectory symbol that combines the letter &quot;F&quot; and an upward growth trend path. Communicates execution.</p>
          </div>

          {/* Concept 2 */}
          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-400 text-[8px] font-bold rounded uppercase">EXPLORATION</span>
              <span className="text-xs text-slate-400 font-bold">Concept 2</span>
            </div>
            
            <div className="h-28 bg-[#F7F8FC] rounded-xl border border-slate-200 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <div className="w-5 h-5 rounded-full border-2 border-[#6D5DFC] flex items-center justify-center relative">
                    <div className="absolute w-2 h-2 rounded-full bg-[#8B7CFF] top-0.5 left-0.5"></div>
                  </div>
                </div>
                <span className="font-extrabold text-xl text-[#0A0D14] tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-[#0A0D14] text-sm">The Wealth Helix</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Two intersecting circular vector loops representing the orbit of cash inflows and target goals. Focuses on the compounding cycle.</p>
          </div>

          {/* Concept 3 */}
          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-400 text-[8px] font-bold rounded uppercase">EXPLORATION</span>
              <span className="text-xs text-slate-400 font-bold">Concept 3</span>
            </div>
            
            <div className="h-28 bg-[#F7F8FC] rounded-xl border border-slate-200 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm font-serif text-[#6D5DFC] text-base font-black">
                  ||
                </div>
                <span className="font-extrabold text-xl text-[#0A0D14] tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-[#0A0D14] text-sm">The Solid Pillar</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">A classic, modern Roman column representing absolute structural stability, security, and capital preservation. Emphasizes institutional trust.</p>
          </div>
        </div>
      </section>

      {/* Visually Rich Analytics Panel */}
      <section className="py-24 px-6 bg-slate-50/50 border-y border-[#E9ECF5] w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">Executive Analytics</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">Granular wealth intelligence.</h2>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Unlock deep cash-flow breakdowns and asset trends formatted for founders and high-income professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Spending Heatmap Card */}
            <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-[#0A0D14] flex items-center gap-1.5">
                  <Activity size={14} className="text-[#6D5DFC]" />
                  Spending Heatmap
                </span>
                <span className="text-[8px] font-black text-[#6D5DFC] font-mono tracking-wider uppercase">Live Ledger</span>
              </div>
              
              <SpendingHeatmap />
            </div>

            {/* Savings Rate radial Gauge */}
            <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-[#0A0D14] flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#6D5DFC]" />
                  Savings Gauge
                </span>
                <span className="text-[8px] font-black text-[#6D5DFC] font-mono tracking-wider uppercase">Optimal</span>
              </div>
              <div className="flex flex-col items-center justify-center py-2 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F7F8FC" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#6D5DFC" strokeWidth="3" strokeDasharray="68 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                  <span className="text-xl font-black text-[#0A0D14]">68%</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wide">SAVINGS RATE</span>
                </div>
              </div>
            </div>

            {/* Cash Flow allocation splits */}
            <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-[#0A0D14] flex items-center gap-1.5">
                  <Wallet size={14} className="text-[#6D5DFC]" />
                  Cash Allocation
                </span>
                <span className="text-[8px] font-black text-[#6D5DFC] font-mono tracking-wider uppercase">50/30/20 Rule</span>
              </div>
              <div className="space-y-3 font-semibold text-[10px] text-slate-500">
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Needs (Essentials)</span><span>48%</span></div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="w-[48%] h-full bg-[#6D5DFC]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Wants (Dining, Shopping)</span><span>28%</span></div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="w-[28%] h-full bg-violet-500"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Savings & Investing</span><span>24%</span></div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="w-[24%] h-full bg-[#00C875]"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Local-First Security Section */}
      <section id="security" className="py-24 px-6 max-w-6xl mx-auto w-full text-center space-y-16 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">Local Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">Your Data. Your Control.</h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            FinTrack is engineered as a local-first browser application. Your transactions, budgets, and keys are saved in your local state—never on our servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-3.5">
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-sm text-[#6D5DFC]">
              <Database size={16} />
            </div>
            <h4 className="font-extrabold text-[#0A0D14] text-sm">Local Storage DB</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">All financial data is saved inside your local browser database. Your data stays on your hardware.</p>
          </div>

          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-3.5">
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-sm text-[#6D5DFC]">
              <Lock size={16} />
            </div>
            <h4 className="font-extrabold text-[#0A0D14] text-sm">End-to-End Encryption</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">When fetching advanced insights via API, keys are saved in browser storage. Request payloads are encrypted in transit.</p>
          </div>

          <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-3.5">
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-sm text-[#6D5DFC]">
              <Shield size={16} />
            </div>
            <h4 className="font-extrabold text-[#0A0D14] text-sm">Zero Ads or Tracking</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">We do not track cookies, trace logs, sell data, or host ads. We monetize through simple premium memberships.</p>
          </div>
        </div>
      </section>

      {/* Dedicated AI Chat Simulator Showcase */}
      <section className="py-24 px-6 bg-slate-50/50 border-y border-[#E9ECF5] w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">AI Agent Showroom</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">Meet FinTrack AI.</h2>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              An offline RAG reasoning engine that parses your query and aggregates local transactions, warning limits, and compounding goals in under 100ms.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ChatSimulator />
          </div>
        </div>
      </section>

      {/* Premium User Testimonials */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full text-center space-y-16 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">Loved by builders & investors.</h2>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Here is how high-income engineers and founders track their wealth using FinTrack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {/* Rohan */}
          <div className="p-5 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">&quot;As a software engineer, I wanted an app that is fast, secure, and has zero ads. FinTrack is my financial command center. The RAG advisor answers instantly.&quot;</p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👨‍💻</div>
              <div>
                <div className="font-extrabold text-[10px] text-[#0A0D14]">Rohan Dev</div>
                <div className="text-[8px] text-[#6D5DFC] font-bold uppercase tracking-wider">Staff Software Engineer</div>
              </div>
            </div>
          </div>
          
          {/* Anjali */}
          <div className="p-5 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">&quot;Managing scattered startup cash reserves and personal equity is difficult. FinTrack helps me track my asset allocations and budgets in one place offline.&quot;</p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👩‍💼</div>
              <div>
                <div className="font-extrabold text-[10px] text-[#0A0D14]">Anjali Mehta</div>
                <div className="text-[8px] text-[#6D5DFC] font-bold uppercase tracking-wider">Fintech Founder</div>
              </div>
            </div>
          </div>

          {/* Siddharth */}
          <div className="p-5 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">&quot;Net worth auditing is super fast. FinTrack charts show allocations clearly and the direct mutual fund ratio checks saved me 1% commission leaks.&quot;</p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👨‍💼</div>
              <div>
                <div className="font-extrabold text-[10px] text-[#0A0D14]">Siddharth Shah</div>
                <div className="text-[8px] text-[#6D5DFC] font-bold uppercase tracking-wider">Angel Investor</div>
              </div>
            </div>
          </div>

          {/* Vikram */}
          <div className="p-5 bg-white border border-[#E9ECF5] rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">&quot;I love the offline local database setup. No bank credential hacks, no credit cards required. Just simple budgeting that actually compounds.&quot;</p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👨‍🎨</div>
              <div>
                <div className="font-extrabold text-[10px] text-[#0A0D14]">Vikram Rao</div>
                <div className="text-[8px] text-[#6D5DFC] font-bold uppercase tracking-wider">Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern SaaS Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-50/50 border-y border-[#E9ECF5] w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-[#6D5DFC] uppercase tracking-widest">Pricing Strategy</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A0D14] tracking-tight">Transparent plans. Unlimited growth.</h2>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Choose the plan fitting your wealth trajectory. Save 20% by subscribing to annual cycles.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-3 pt-4 select-none">
              <span className={`text-[10px] font-black uppercase tracking-wider ${billingCycle === "monthly" ? "text-[#6D5DFC]" : "text-slate-400"}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-10 h-6 bg-slate-200 border border-slate-300 rounded-full p-0.5 transition-all flex items-center shadow cursor-pointer relative"
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${billingCycle === "yearly" ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
              <span className={`text-[10px] font-black uppercase tracking-wider ${billingCycle === "yearly" ? "text-[#6D5DFC]" : "text-slate-400"}`}>
                Yearly <span className="bg-indigo-50 text-[#6D5DFC] border border-indigo-100 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ml-1">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-4 text-left">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0A0D14]">Starter Plan</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Basic Personal tracking</p>
                </div>
                <div className="flex items-baseline gap-1 select-none text-[#0A0D14]">
                  <span className="text-3xl font-black">₹0</span>
                  <span className="text-[10px] text-slate-400 font-bold">/ forever</span>
                </div>
                <ul className="space-y-2.5 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 5 Transaction Ledger entries</li>
                  <li className="flex items-center gap-2">🟢 Basic budget envelopes</li>
                  <li className="flex items-center gap-2 text-slate-350 line-through">🔴 AI insights blocked</li>
                  <li className="flex items-center gap-2 text-slate-350 line-through">🔴 Excel CSV Exports locked</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center">
                    Start Free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-6 bg-white border-2 border-[#6D5DFC] rounded-2xl shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#6D5DFC] text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow shadow-[#6D5DFC]/20 leading-none select-none">
                Most Popular
              </div>
              <div className="space-y-4 text-left">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0A0D14]">Pro Plan</h3>
                  <p className="text-[9px] text-[#6D5DFC] font-bold uppercase mt-0.5">runway optimization</p>
                </div>
                <div className="flex items-baseline gap-1 select-none text-[#0A0D14]">
                  <span className="text-3xl font-black">
                    ₹{billingCycle === "monthly" ? "799" : "639"}
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold">
                    / {billingCycle === "monthly" ? "month" : "month billed annually"}
                  </span>
                </div>
                <ul className="space-y-2.5 text-[10px] text-slate-600 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 Unlimited Ledger transactions</li>
                  <li className="flex items-center gap-2">🟢 Unlimited Budget Envelopes</li>
                  <li className="flex items-center gap-2">🟢 AI financial insights unlocked</li>
                  <li className="flex items-center gap-2">🟢 Direct Mutual Fund Ratio checks</li>
                  <li className="flex items-center gap-2">🟢 Secure Excel CSV Data Exports</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-[#6D5DFC]/20 text-center">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-[#6D5DFC]/20 text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Elite */}
            <div className="p-6 bg-white border border-[#E9ECF5] rounded-2xl shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-4 text-left">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0A0D14]">Elite Plan</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Family offices & Teams</p>
                </div>
                <div className="flex items-baseline gap-1 select-none text-[#0A0D14]">
                  <span className="text-3xl font-black">
                    ₹{billingCycle === "monthly" ? "1,999" : "1,599"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    / {billingCycle === "monthly" ? "month" : "month billed annually"}
                  </span>
                </div>
                <ul className="space-y-2.5 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 Everything in Pro Plan</li>
                  <li className="flex items-center gap-2">🟢 Multi-account Family support</li>
                  <li className="flex items-center gap-2">🟢 Custom RAG advisor context loading</li>
                  <li className="flex items-center gap-2">🟢 Priority developer support channels</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion CTA */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="bg-gradient-to-br from-[#6D5DFC] via-[#8B7CFF] to-[#6D5DFC] border border-[#6D5DFC]/10 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Wealth Intelligence</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              Take Control of Your Financial Future.
            </h2>
            <p className="text-white/80 text-xs font-semibold leading-relaxed">
              Start managing your net worth, transaction history, budget envelopes, and compound savings goals dynamically from a single AI-powered dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <SignedOut>
              <SignUpButton forceRedirectUrl="/dashboard">
                <button className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#6D5DFC] font-bold rounded-xl transition-all shadow-xl cursor-pointer text-xs">
                  Start Free Today
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#6D5DFC] font-bold rounded-xl transition-all shadow-xl cursor-pointer text-xs block text-center"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            
            <button 
              onClick={() => alert("Welcome! Click Start Free to log into your Personal Wealth OS dashboard.")}
              className="px-6 py-3.5 bg-transparent border border-white/40 hover:border-white text-white font-bold rounded-xl transition-all text-xs cursor-pointer"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E9ECF5] py-12 px-6 bg-white shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10 text-xs text-slate-500 font-semibold leading-normal">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#6D5DFC] flex items-center justify-center text-xs text-white">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-extrabold text-[#0A0D14] text-base">FinTrack</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">The Personal Wealth Operating System engineered for founders, software developers, and builders.</p>
          </div>
          <div>
            <h4 className="font-bold text-[#0A0D14] text-[10px] uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-[10px] text-slate-400">
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Dashboard</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Budgets</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Savings Goals</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">AI Advisor</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0A0D14] text-[10px] uppercase tracking-wider mb-3">Security</h4>
            <ul className="space-y-2 text-[10px] text-slate-400">
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Encryption Protocol</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Local Storage DB</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">No Data Sales</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Zero Ads Policies</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0A0D14] text-[10px] uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-[10px] text-slate-400">
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">About Us</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Careers</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-[#6D5DFC] cursor-pointer">Contact Desk</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-bold text-slate-400 pt-6 border-t border-slate-100">
          <div>© 2026 FinTrack Inc. All rights reserved. Made in Bengaluru.</div>
          <div className="flex gap-5">
            <span className="hover:text-[#6D5DFC] cursor-pointer">Security Protocol</span>
            <span className="hover:text-[#6D5DFC] cursor-pointer">Privacy Guidelines</span>
            <span className="hover:text-[#6D5DFC] cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Page Root Component (Route entrance)
export default function Page() {
  return <LandingPage />;
}
