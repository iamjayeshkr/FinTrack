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

// Interactive Heatmap Component
function SpendingHeatmap() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  const shades = [
    "bg-indigo-950/40 border-indigo-900/20", 
    "bg-indigo-900/60 border-indigo-800/30", 
    "bg-indigo-700/60 border-indigo-600/40", 
    "bg-indigo-500/80 border-indigo-400/50", 
    "bg-violet-500 border-violet-400/50"
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
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#090915] border border-indigo-500/30 text-white text-[9px] px-2 py-1 rounded-md shadow-xl z-30 whitespace-nowrap">
                  Day {idx + 1}: ₹{val.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 font-semibold select-none pt-1">
        <span>Less Spends</span>
        <span>More Spends</span>
      </div>
    </div>
  );
}

// Typing AI Chat Simulator Component
function ChatSimulator() {
  const [messages, setMessages] = useState([
    { role: "user", content: "Swiggy aur Zomato par expenses control kaise karein?" },
    { role: "assistant", content: "Analyzing your local transactions... 🔍\n\nIn the last 30 days, you spent **₹14,580** across **18 food deliveries** (averaging ₹810 per order). This accounts for **32% of your monthly discretionary budget**.", showCards: false }
  ]);
  
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const triggerAudit = (prompt: string, reply: string, isHinglish: boolean) => {
    setActiveChip(prompt);
    // Append user message
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    
    // Simulate thinking & response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, showCards: true }
      ]);
    }, 1200);
  };

  return (
    <div className="w-full bg-[#080816]/90 border border-indigo-950 rounded-2xl shadow-2xl overflow-hidden aspect-[16/11] flex flex-col justify-between backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-dark-grid opacity-10 pointer-events-none"></div>
      
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-indigo-950 flex items-center justify-between bg-[#04040b]/80 shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-200 tracking-wider uppercase">FinTrack RAG Intelligence</span>
        </div>
        <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 font-bold px-2 py-0.5 rounded uppercase">Connected</span>
      </div>

      {/* Message timeline */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto flex flex-col justify-end text-xs leading-relaxed relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end ml-auto flex-row-reverse" : "self-start mr-auto"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-[#111126] border border-indigo-900/50 text-indigo-400"}`}>
              {msg.role === "user" ? "U" : "🤖"}
            </div>
            <div className={`p-3 rounded-2xl shadow-md ${msg.role === "user" ? "bg-indigo-650 text-white rounded-tr-none" : "bg-[#121226]/85 border border-indigo-950 text-slate-300 rounded-tl-none"} space-y-2`}>
              <p className="whitespace-pre-line">{msg.content}</p>
              
              {msg.showCards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-indigo-950 text-[10px] animate-fadeIn">
                  <div className="space-y-1">
                    <span className="font-extrabold text-emerald-400 text-[8px] uppercase tracking-wider">💡 Suggested Action</span>
                    <div className="bg-[#181832] border border-emerald-900/30 p-2 rounded-lg text-slate-300">
                      Set a weekly limit of ₹2,500 on food delivery apps.
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-rose-400 text-[8px] uppercase tracking-wider">⚠️ Warnings</span>
                    <div className="bg-[#2a1420] border border-rose-900/30 p-2 rounded-lg text-slate-300">
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
      <div className="px-5 pb-1 flex flex-wrap gap-2 select-none relative z-10 shrink-0">
        <button 
          onClick={() => triggerAudit("SIP target velocity check karo", "Analyzing savings velocity... 📈\n\nYour Goa Vacation SIP (₹1.5L target) is at 68% completion. By keeping your monthly deposit at ₹15,000, you will hit the target by **December 2025** on track.", true)}
          disabled={activeChip !== null}
          className="px-2.5 py-1.5 bg-[#12122b] border border-indigo-950 hover:border-indigo-600/50 text-indigo-300 hover:text-white rounded-full text-[9px] font-semibold transition-all cursor-pointer"
        >
          📈 SIP velocity check
        </button>
        <button 
          onClick={() => triggerAudit("Can I afford a new MacBook Pro?", "Financial projection running... 💻\n\nBased on your current cash position of ₹2,45,300 and monthly savings of ₹45,000, purchasing a ₹1,20,000 MacBook Pro M4 today is **Affordable**, preserving ₹1.2L in emergency runways.", false)}
          disabled={activeChip !== null}
          className="px-2.5 py-1.5 bg-[#12122b] border border-indigo-950 hover:border-indigo-600/50 text-indigo-300 hover:text-white rounded-full text-[9px] font-semibold transition-all cursor-pointer"
        >
          💻 MacBook Affordability
        </button>
      </div>

      {/* Input panel mockup */}
      <div className="p-4 bg-[#05050c] border-t border-indigo-950 flex gap-2 shrink-0 select-none relative z-10">
        <input 
          type="text" 
          placeholder="Ask: Swiggy/Zomato limit alert?" 
          disabled 
          className="flex-1 px-4 py-2.5 bg-[#0a0a16] border border-indigo-950/80 rounded-xl text-xs placeholder-slate-500 text-slate-400 focus:outline-none"
        />
        <button disabled className="px-4 bg-indigo-600/80 text-white rounded-xl cursor-not-allowed">➔</button>
      </div>
    </div>
  );
}

// Main Page Component
function LandingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeFeatureTab, setActiveFeatureTab] = useState<"dashboard" | "expense" | "budgets" | "investments" | "goals" | "ai">("dashboard");

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 flex flex-col justify-between selection:bg-indigo-800 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-100px] left-[5%] w-[400px] h-[400px] rounded-full glow-blob-indigo pointer-events-none opacity-60"></div>
      <div className="absolute top-[200px] right-[5%] w-[450px] h-[450px] rounded-full glow-blob-purple pointer-events-none opacity-50"></div>
      <div className="absolute top-[1000px] left-[20%] w-[500px] h-[500px] rounded-full glow-blob-blue pointer-events-none opacity-40"></div>
      <div className="absolute bottom-[200px] right-[10%] w-[450px] h-[450px] rounded-full glow-blob-indigo pointer-events-none opacity-60"></div>
      
      {/* Global dark grid overlay */}
      <div className="absolute inset-0 bg-dark-grid opacity-30 pointer-events-none z-0"></div>

      {/* Sticky Header Navbar */}
      <header className="border-b border-indigo-950/50 bg-[#030014]/75 backdrop-blur-md px-6 py-4 sticky top-0 z-40 shrink-0 shadow-xl relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 select-none group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-650 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">FinTrack</span>
              <span className="text-[7px] text-indigo-400 font-mono tracking-widest uppercase mt-0.5">WEALTH OS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#problem" className="hover:text-indigo-400 transition-colors">Solutions</a>
            <a href="#security" className="hover:text-indigo-400 transition-colors">Security</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="#logo-concepts" className="hover:text-indigo-400 transition-colors">Brand Identity</a>
          </nav>

          {/* Auth Action triggers */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <button className="text-slate-350 hover:text-white transition-colors cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/dashboard">
                <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/25 cursor-pointer hover:scale-102">
                  Start Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/25 cursor-pointer flex items-center gap-1.5 hover:scale-102"
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
            <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-800/40 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-indigo-300 select-none shadow-inner">
              <span>🏆</span>
              <span>Trusted by 10,000+ software engineers & founders</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] select-none">
              Command your <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
                financial future.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
              Track transaction histories, configure monthly budgets, log compounding goals, and consult your offline RAG financial advisor—all in a premium, private client-first interface.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 cursor-pointer text-xs hover:scale-102">
                    <span>Start Free Today</span>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] leading-none shrink-0">➔</span>
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 cursor-pointer text-xs hover:scale-102"
                >
                  <span>Go to Dashboard</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] leading-none shrink-0">➔</span>
                </Link>
              </SignedIn>
              
              <button 
                onClick={() => alert("Welcome to FinTrack! Click Start Free to log into your Personal Wealth OS dashboard.")}
                className="px-6 py-3.5 bg-indigo-950/40 border border-indigo-900/60 hover:bg-indigo-900/30 hover:border-indigo-600/50 text-slate-300 font-bold rounded-xl transition-all text-xs cursor-pointer"
              >
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-5 pt-4 text-[10px] font-bold text-slate-500 select-none">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-indigo-400" /> Bank-grade Security
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu size={13} className="text-indigo-400" /> Offline-First DB
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-indigo-400" /> End-to-End Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-indigo-400" /> No Advertisements
              </span>
            </div>
          </div>

          {/* Right Column: High Fidelity Dashboard Mockup */}
          <div className="lg:col-span-7 flex justify-center items-center relative w-full pr-4 pl-4 select-none">
            {/* Mesh background glow inside mockup */}
            <div className="absolute w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            {/* Main Dashboard Window Container */}
            <div className="w-full bg-[#060611]/90 border border-indigo-950/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 aspect-[16/10.5] transform hover:scale-[1.01] transition-transform duration-300">
              
              {/* titlebar */}
              <div className="px-4 py-3 bg-[#040409] border-b border-indigo-950/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <div className="px-3 py-1 bg-[#090916] border border-indigo-950 rounded-md text-[9px] text-slate-500 font-mono w-44 text-center truncate">
                  fintrack.io/dashboard
                </div>
                <div className="w-8"></div>
              </div>
              
              {/* App Internal Workspace */}
              <div className="flex-1 flex overflow-hidden">
                {/* Mockup Sidebar */}
                <div className="w-32 bg-[#04040a]/80 border-r border-indigo-950/40 p-3 flex flex-col gap-3.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-1 pb-1.5 border-b border-indigo-950/30">
                    <div className="w-4.5 h-4.5 rounded bg-indigo-600 flex items-center justify-center text-[10px] text-white">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="font-extrabold text-[9px] text-slate-200 tracking-tight">FinTrack</span>
                  </div>
                  <ul className="space-y-1.5 text-[8px] font-bold text-slate-500">
                    <li className="flex items-center gap-2 px-2 py-1.5 bg-indigo-950/60 text-indigo-400 rounded-md">
                      <span>🏠</span> Overview
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                      <span>📖</span> Transactions
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                      <span>✉️</span> Budgets
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-600">
                      <span>🎯</span> Goals <span className="bg-indigo-900/50 text-indigo-400 text-[6px] px-1 rounded ml-auto">PRO</span>
                    </li>
                    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                      <span>💬</span> AI Advisor
                    </li>
                  </ul>
                </div>
                
                {/* Mockup Content area */}
                <div className="flex-1 bg-[#060611] p-3.5 space-y-3.5 overflow-hidden flex flex-col justify-between">
                  {/* Header row */}
                  <div className="flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-extrabold text-slate-200">Personal Wealth command</span>
                    <span className="text-[6px] text-indigo-400 border border-indigo-900 bg-indigo-950/30 rounded px-1.5 py-0.5 font-black uppercase">Local Sync Active</span>
                  </div>
                  
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 gap-2.5 shrink-0">
                    <div className="border border-indigo-950 p-2 rounded-lg space-y-0.5 bg-[#09091b]/50 shadow-inner">
                      <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Net worth</span>
                      <div className="text-[11px] font-black text-slate-200">₹ 8,42,18,930</div>
                      <span className="text-[6px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <span>▲</span> +3.45%
                      </span>
                    </div>
                    <div className="border border-indigo-950 p-2 rounded-lg space-y-0.5 bg-[#09091b]/50 shadow-inner">
                      <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Monthly Cash Flow</span>
                      <div className="text-[11px] font-black text-slate-200">₹ 2,45,300</div>
                      <span className="text-[6px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <span>▲</span> +18.6%
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart area */}
                  <div className="border border-indigo-950 rounded-lg p-2.5 flex-1 flex flex-col justify-between min-h-0 bg-[#09091b]/20 relative">
                    <div className="flex-1 relative flex items-end">
                      <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradHero" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <path d="M 0,22 Q 15,18 35,14 T 70,8 T 100,4" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                        <path d="M 0,22 Q 15,18 35,14 T 70,8 T 100,4 L 100,25 L 0,25 Z" fill="url(#chartGradHero)" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[5px] text-slate-500 font-mono mt-1 select-none">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    </div>
                  </div>

                  {/* Bottom metrics */}
                  <div className="grid grid-cols-2 gap-2.5 shrink-0">
                    <div className="border border-indigo-950 p-2 rounded-lg flex items-center gap-2 bg-[#09091b]/30">
                      <div className="relative w-8 h-8 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#12122b" strokeWidth="3" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#6366f1" strokeWidth="3" strokeDasharray="54 75" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="13 75" strokeDashoffset="-54" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[5px] font-black text-slate-300 font-mono">72%</div>
                      </div>
                      <div className="text-[5px] text-slate-400 font-bold space-y-0.5 leading-none">
                        <div className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-indigo-500"></span> Equities 72%</div>
                        <div className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-emerald-400"></span> Cash 18%</div>
                      </div>
                    </div>
                    
                    <div className="border border-indigo-950 p-2 rounded-lg space-y-1 text-[5px] bg-[#09091b]/30">
                      <div className="flex justify-between items-center text-slate-500 font-bold uppercase pb-0.5 border-b border-indigo-950">
                        <span>Ledger Entry</span>
                      </div>
                      <div className="space-y-0.5 text-slate-400 font-mono">
                        <div className="flex justify-between"><span>Salary Credited</span><span className="text-emerald-400">+₹1,85,000</span></div>
                        <div className="flex justify-between"><span>Mutual Fund SIP</span><span className="text-rose-400">-₹25,000</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Card 1: Milestone Goal (Bottom Left) */}
            <div className="absolute -bottom-5 -left-6 bg-[#0b0b1c] border border-indigo-950/85 rounded-xl shadow-2xl p-3.5 w-44 z-20 flex flex-col gap-1.5 animate-bounce-slow">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-indigo-950">
                <span className="text-[10px]">🎯</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Milestone Goa SIP</span>
              </div>
              <div className="text-[8px] font-bold text-slate-350">Travel Fund</div>
              <div className="text-xs font-black text-white leading-none font-mono">₹ 1,50,000</div>
              <div className="space-y-1">
                <div className="w-full h-1 bg-indigo-950 rounded-full overflow-hidden">
                  <div className="w-[68%] h-full bg-indigo-500 rounded-full"></div>
                </div>
                <div className="flex justify-between text-[6px] text-slate-500 font-bold leading-none">
                  <span>68% Completed</span>
                  <span>Target: Dec 2025</span>
                </div>
              </div>
            </div>

            {/* Floating Card 2: AI Insight (Top Right) */}
            <div className="absolute -top-5 -right-6 bg-[#0b0b1c] border border-indigo-950/85 rounded-xl shadow-2xl p-3 w-40 z-20 flex flex-col gap-1.5 animate-bounce-slow" style={{ animationDelay: "2.5s" }}>
              <div className="flex items-center gap-1 pb-1 border-b border-indigo-950">
                <span className="text-[9px]">✨</span>
                <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-wider">AI INSIGHT</span>
              </div>
              <p className="text-[8px] text-slate-400 leading-normal font-semibold">
                You can save <strong className="text-white font-black">₹18,500 more</strong> this month.
              </p>
              <span className="text-[7px] text-indigo-400 font-bold hover:underline cursor-pointer">
                Run optimization →
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Social Proof Logo Wall & Stats */}
      <section className="bg-[#04040e]/90 border-y border-indigo-950/50 py-16 px-6 shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border border-indigo-950 bg-[#080816]/75 backdrop-blur rounded-2xl p-8 shadow-2xl relative">
            <div className="space-y-1">
              <div className="text-3xl font-black text-white tracking-tight">10,000+</div>
              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Active Wealth Builders</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white tracking-tight">₹50 Cr+</div>
              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Assets Monitored</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white tracking-tight">1M+</div>
              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Transactions Processed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white tracking-tight">99.99%</div>
              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Uptime SLA Guarantee</div>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest select-none">
              compatible with major indian financial services
            </h3>
            
            {/* Grayscale partner logos wall */}
            <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 select-none opacity-40 hover:opacity-75 transition-opacity duration-300">
              <div className="flex items-center gap-1 font-black text-slate-400 tracking-wider text-sm select-none">ZERODHA</div>
              <div className="flex items-center gap-1.5 font-extrabold text-slate-400 tracking-tight text-sm select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Groww
              </div>
              <div className="flex items-center gap-1 font-bold text-slate-400 text-sm select-none">
                <span>upstox</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-black tracking-widest text-slate-400 border border-slate-700 px-2 py-0.5 rounded select-none">
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
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">The Core Challenge</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Why traditional finance apps fail.</h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Existing tools treat wealth like a static table of numbers. They sell your financial data to ads, or lack the offline automation needed to actually compound capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-[#080816]/70 border border-indigo-950 rounded-2xl shadow-xl space-y-4">
            <div className="w-9 h-9 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-center justify-center text-sm">❌</div>
            <h4 className="font-extrabold text-slate-200 text-sm">Scattered Financial Data</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Your bank accounts, mutual funds, budgets, and goals live in isolated, incompatible dashboards.</p>
          </div>
          <div className="p-6 bg-[#080816]/70 border border-indigo-950 rounded-2xl shadow-xl space-y-4">
            <div className="w-9 h-9 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-center justify-center text-sm">❌</div>
            <h4 className="font-extrabold text-slate-200 text-sm">No Net Worth Visibility</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Tracking assets and liabilities is a manual spreadsheet nightmare that fails to reflect live progress.</p>
          </div>
          <div className="p-6 bg-[#080816]/70 border border-indigo-950 rounded-2xl shadow-xl space-y-4">
            <div className="w-9 h-9 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-center justify-center text-sm">❌</div>
            <h4 className="font-extrabold text-slate-200 text-sm">Zero Financial Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Traditional apps tell you where your money went, but fail to guide you on how to save and allocate it.</p>
          </div>
        </div>

        <div className="pt-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl text-xs font-bold text-indigo-300 shadow-md">
            <span>💡</span>
            <span>Positioning: <strong className="font-black text-white">FinTrack</strong> acts as your Personal Wealth Operating System</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-24 px-6 bg-[#04040c]/40 border-y border-indigo-950/40 w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Platform Modules</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Engineered for wealth compounding.</h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
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
                    ? "bg-[#0b0b1c] border-indigo-800 shadow-lg text-white" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-[#070715]/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "dashboard" ? "bg-indigo-600 text-white" : "bg-[#111126] text-slate-400"}`}><Layers size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs">Wealth Dashboard</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Asset allocations and accounts aggregates.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("expense")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "expense" 
                    ? "bg-[#0b0b1c] border-indigo-800 shadow-lg text-white" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-[#070715]/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "expense" ? "bg-indigo-600 text-white" : "bg-[#111126] text-slate-400"}`}><Activity size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs">Expense Intelligence</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Automated transaction categorization & tags.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("budgets")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "budgets" 
                    ? "bg-[#0b0b1c] border-indigo-800 shadow-lg text-white" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-[#070715]/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "budgets" ? "bg-indigo-600 text-white" : "bg-[#111126] text-slate-400"}`}><Wallet size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs">Budget Envelopes</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Monthly limits and custom spending caps.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("investments")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "investments" 
                    ? "bg-[#0b0b1c] border-indigo-800 shadow-lg text-white" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-[#070715]/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "investments" ? "bg-indigo-600 text-white" : "bg-[#111126] text-slate-400"}`}><PieChart size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs">Investment Tracking</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Monitor stocks, mutual funds, crypto, and gold.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("goals")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "goals" 
                    ? "bg-[#0b0b1c] border-indigo-800 shadow-lg text-white" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-[#070715]/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "goals" ? "bg-indigo-600 text-white" : "bg-[#111126] text-slate-400"}`}><TrendingUp size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs">Goal Planning</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Track emergency funds, vacation milestones, etc.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("ai")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                  activeFeatureTab === "ai" 
                    ? "bg-[#0b0b1c] border-indigo-800 shadow-lg text-white" 
                    : "bg-transparent border-transparent text-slate-500 hover:bg-[#070715]/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow ${activeFeatureTab === "ai" ? "bg-indigo-600 text-white" : "bg-[#111126] text-slate-400"}`}><Sparkles size={15} /></div>
                <div>
                  <h4 className="font-bold text-xs">AI Financial Advisor</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Offline-capable Hinglish/English queries.</p>
                </div>
              </button>
            </div>

            {/* Tab Preview Dashboard */}
            <div className="lg:col-span-8 bg-[#070716] border border-indigo-950 rounded-2xl shadow-2xl p-6 aspect-[16/10.5] flex flex-col justify-between overflow-hidden relative">
              <div className="absolute inset-0 bg-dark-grid opacity-10 pointer-events-none"></div>
              
              {activeFeatureTab === "dashboard" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-200">Wealth Dashboard</h3>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">Live Aggregate</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-indigo-950 p-3 rounded-xl bg-[#09091a]/40">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Total Assets</span>
                      <div className="text-sm font-black text-slate-200 mt-1">₹ 9,50,00,000</div>
                    </div>
                    <div className="border border-indigo-950 p-3 rounded-xl bg-[#09091a]/40">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Liabilities</span>
                      <div className="text-sm font-black text-rose-400 mt-1">₹ 1,07,81,070</div>
                    </div>
                    <div className="border border-indigo-950 p-3 rounded-xl bg-[#0b0b24] border-indigo-900/50">
                      <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider">Net Position</span>
                      <div className="text-sm font-black text-white mt-1">₹ 8,42,18,930</div>
                    </div>
                  </div>
                  <div className="border border-indigo-950 rounded-xl p-4 flex-1 flex items-end bg-[#09091a]/20">
                    <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M 0,18 L 20,16 Q 40,12 60,10 T 80,6 T 100,2" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              )}

              {activeFeatureTab === "expense" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-200">Expense Intelligence</h3>
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/30 border border-indigo-900/30 px-2 py-0.5 rounded">Smart tagging</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#09091d]/60 border border-indigo-950 rounded-lg flex justify-between text-xs items-center">
                      <div>
                        <div className="font-bold text-slate-200">Swiggy Restaurant Delivery</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">Category: Food & Dining · UPI Payment</div>
                      </div>
                      <span className="font-extrabold text-rose-400">-₹850</span>
                    </div>
                    <div className="p-3 bg-[#09091d]/60 border border-indigo-950 rounded-lg flex justify-between text-xs items-center">
                      <div>
                        <div className="font-bold text-slate-200">Amazon Web Services AWS</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">Category: Subscriptions · Credit Card</div>
                      </div>
                      <span className="font-extrabold text-rose-400">-₹4,290</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 text-center font-semibold">Flags recurring subscriptions and categorizes merchant transactions offline.</div>
                </div>
              )}

              {activeFeatureTab === "budgets" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-200">Envelope Budget Limits</h3>
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded">92% utilized</span>
                  </div>
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>🍔 Food & Dining</span>
                        <span>₹11,040 / ₹12,000</span>
                      </div>
                      <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-amber-500"></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>🚗 Uber & Travel</span>
                        <span>₹3,150 / ₹8,000</span>
                      </div>
                      <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden">
                        <div className="w-[39%] h-full bg-indigo-600"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-lg text-[10px] text-amber-300 font-semibold">
                    ⚠️ Alert: Food & Dining envelope is crossing 75% limit before the mid-month cycle.
                  </div>
                </div>
              )}

              {activeFeatureTab === "investments" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-200">Investment Tracker</h3>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">Live Rates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                    <div className="space-y-2 text-[10px] text-slate-400 font-bold">
                      <div className="flex justify-between items-center p-2 bg-[#09091e]/50 border border-indigo-950 rounded-md">
                        <span>📈 Indian Equities (Nifty)</span><span>45%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-[#09091e]/50 border border-indigo-950 rounded-md">
                        <span>📊 Mutual Funds (SIP)</span><span>35%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-[#09091e]/50 border border-indigo-950 rounded-md">
                        <span>🪙 Digital Gold</span><span>10%</span>
                      </div>
                    </div>
                    {/* Circle chart */}
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-8 border-indigo-600 flex items-center justify-center font-black text-slate-200">
                        80%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === "goals" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-200">Milestone Goals</h3>
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/30 border border-indigo-900/30 px-2 py-0.5 rounded">Active milestones</span>
                  </div>
                  <div className="border border-indigo-950 p-4 rounded-xl space-y-2.5 bg-[#09091e]/40">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>MacBook Pro M4 Goal</span>
                      <span>₹45,000 / ₹1,20,000</span>
                    </div>
                    <div className="w-full h-2.5 bg-indigo-950 rounded-full overflow-hidden">
                      <div className="w-[37.5%] h-full bg-indigo-600"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold pt-1">
                      <span>Target Velocity: ₹15,000/mo</span>
                      <span>Estimated Timeline: 5 Months</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === "ai" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn relative z-10">
                  <div className="flex justify-between items-center border-b border-indigo-950 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🤖</span>
                      <h3 className="text-xs font-extrabold text-slate-200">FinTrack Offline RAG</h3>
                    </div>
                    <span className="text-[8px] font-bold bg-[#11112b] border border-indigo-900/30 text-indigo-400 px-1.5 py-0.5 rounded">Latency: 8ms</span>
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-end text-[10px]">
                    <div className="bg-indigo-600 text-white p-2.5 rounded-xl rounded-tr-none max-w-[80%] self-end ml-auto">
                      Goa trip target hit kab tak hoga?
                    </div>
                    <div className="bg-[#12122b] border border-indigo-950 text-slate-300 p-2.5 rounded-xl rounded-tl-none max-w-[80%] self-start mr-auto">
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
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Brand Identity Concepts</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">VC-Ready brand architecture.</h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Designed to communicate growth, security, and trajectory. We explore three visual design pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Concept 1 */}
          <div className="p-6 bg-[#080816]/70 border border-indigo-950 rounded-2xl shadow-xl space-y-4 border-t-4 border-t-indigo-600">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-900/50 text-indigo-300 text-[8px] font-bold rounded uppercase">APPROVED CONCEPT</span>
              <span className="text-xs text-slate-500 font-bold">Concept 1</span>
            </div>
            
            <div className="h-28 bg-[#04040b] rounded-xl border border-indigo-950/50 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-dark-grid opacity-10"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-slate-200 text-sm">The Ascent Path</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">An abstract geometric rising trajectory symbol that combines the letter &quot;F&quot; and an upward growth trend path. Communicates execution.</p>
          </div>

          {/* Concept 2 */}
          <div className="p-6 bg-[#080816]/70 border border-indigo-950 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-indigo-950/20 border border-indigo-900/20 text-slate-400 text-[8px] font-bold rounded uppercase">EXPLORATION</span>
              <span className="text-xs text-slate-500 font-bold">Concept 2</span>
            </div>
            
            <div className="h-28 bg-[#04040b] rounded-xl border border-indigo-950/50 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-dark-grid opacity-10"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#0e0e24] border border-indigo-900/60 flex items-center justify-center shadow-md">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center relative">
                    <div className="absolute w-2 h-2 rounded-full bg-indigo-400 top-0.5 left-0.5"></div>
                  </div>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-slate-200 text-sm">The Wealth Helix</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Two intersecting circular vector loops representing the orbit of cash inflows and target goals. Focuses on the compounding cycle.</p>
          </div>

          {/* Concept 3 */}
          <div className="p-6 bg-[#080816]/70 border border-indigo-950 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-indigo-950/20 border border-indigo-900/20 text-slate-400 text-[8px] font-bold rounded uppercase">EXPLORATION</span>
              <span className="text-xs text-slate-500 font-bold">Concept 3</span>
            </div>
            
            <div className="h-28 bg-[#04040b] rounded-xl border border-indigo-950/50 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-dark-grid opacity-10"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#0e0e24] border border-indigo-900/60 flex items-center justify-center shadow-md font-serif text-indigo-400 text-base font-black">
                  ||
                </div>
                <span className="font-bold text-xl text-white tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-slate-200 text-sm">The Solid Pillar</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">A classic, modern Roman column representing absolute structural stability, security, and capital preservation. Emphasizes institutional trust.</p>
          </div>
        </div>
      </section>

      {/* Visually Rich Analytics Panel */}
      <section className="py-24 px-6 bg-[#04040c]/40 border-y border-indigo-950/40 w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Executive Analytics</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Granular wealth intelligence.</h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Unlock deep cash-flow breakdowns and asset trends formatted for founders and high-income professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Spending Heatmap Card */}
            <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-950/80 pb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity size={14} className="text-indigo-400" />
                  Spending Heatmap
                </span>
                <span className="text-[8px] font-bold text-indigo-400 font-mono tracking-wider uppercase">Live Ledger</span>
              </div>
              
              <SpendingHeatmap />
            </div>

            {/* Savings Rate radial Gauge */}
            <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-950/80 pb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-indigo-400" />
                  Savings Gauge
                </span>
                <span className="text-[8px] font-bold text-indigo-400 font-mono tracking-wider uppercase">Optimal</span>
              </div>
              <div className="flex flex-col items-center justify-center py-2 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#0c0c20" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#6366f1" strokeWidth="3" strokeDasharray="68 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                  <span className="text-xl font-black text-white">68%</span>
                  <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-wide">SAVINGS RATE</span>
                </div>
              </div>
            </div>

            {/* Cash Flow allocation splits */}
            <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-950/80 pb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Wallet size={14} className="text-indigo-400" />
                  Cash Allocation
                </span>
                <span className="text-[8px] font-bold text-indigo-400 font-mono tracking-wider uppercase">50/30/20 Rule</span>
              </div>
              <div className="space-y-3 font-semibold text-[10px] text-slate-400">
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Needs (Essentials)</span><span>48%</span></div>
                  <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden">
                    <div className="w-[48%] h-full bg-indigo-500"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Wants (Dining, Shopping)</span><span>28%</span></div>
                  <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden">
                    <div className="w-[28%] h-full bg-violet-500"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Savings & Investing</span><span>24%</span></div>
                  <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden">
                    <div className="w-[24%] h-full bg-emerald-500"></div>
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
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Local Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Your Data. Your Control.</h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            FinTrack is engineered as a local-first browser application. Your transactions, budgets, and keys are saved in your local state—never on our servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-3.5">
            <div className="w-9 h-9 bg-indigo-950 border border-indigo-900/60 rounded-xl flex items-center justify-center text-sm text-indigo-400">
              <Database size={16} />
            </div>
            <h4 className="font-extrabold text-slate-200 text-sm">Local Storage DB</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">All financial data is saved inside your local browser database. Your data stays on your hardware.</p>
          </div>

          <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-3.5">
            <div className="w-9 h-9 bg-indigo-950 border border-indigo-900/60 rounded-xl flex items-center justify-center text-sm text-indigo-400">
              <Lock size={16} />
            </div>
            <h4 className="font-extrabold text-slate-200 text-sm">End-to-End Encryption</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">When fetching advanced insights via API, keys are saved in browser storage. Request payloads are encrypted in transit.</p>
          </div>

          <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-3.5">
            <div className="w-9 h-9 bg-indigo-950 border border-indigo-900/60 rounded-xl flex items-center justify-center text-sm text-indigo-400">
              <Shield size={16} />
            </div>
            <h4 className="font-extrabold text-slate-200 text-sm">Zero Ads or Tracking</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">We do not track cookies, trace logs, sell data, or host ads. We monetize through simple premium memberships.</p>
          </div>
        </div>
      </section>

      {/* Dedicated AI Chat Simulator Showcase */}
      <section className="py-24 px-6 bg-[#04040c]/40 border-y border-indigo-950/40 w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Agent Showroom</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Meet FinTrack AI.</h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
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
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Loved by builders & investors.</h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Here is how high-income engineers and founders track their wealth using FinTrack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {/* Rohan */}
          <div className="p-5 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">&quot;As a software engineer, I wanted an app that is fast, secure, and has zero ads. FinTrack is my financial command center. The RAG advisor answers instantly.&quot;</p>
            <div className="flex items-center gap-3 border-t border-indigo-950/60 pt-3">
              <div className="w-8 h-8 rounded-full bg-[#111126] flex items-center justify-center text-sm shadow-sm select-none">👨‍💻</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-200">Rohan Dev</div>
                <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider">Staff Software Engineer</div>
              </div>
            </div>
          </div>
          
          {/* Anjali */}
          <div className="p-5 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">&quot;Managing scattered startup cash reserves and personal equity is difficult. FinTrack helps me track my asset allocations and budgets in one place offline.&quot;</p>
            <div className="flex items-center gap-3 border-t border-indigo-950/60 pt-3">
              <div className="w-8 h-8 rounded-full bg-[#111126] flex items-center justify-center text-sm shadow-sm select-none">👩‍💼</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-200">Anjali Mehta</div>
                <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider">Fintech Founder</div>
              </div>
            </div>
          </div>

          {/* Siddharth */}
          <div className="p-5 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">&quot;Net worth auditing is super fast. FinTrack charts show allocations clearly and the direct mutual fund ratio checks saved me 1% commission leaks.&quot;</p>
            <div className="flex items-center gap-3 border-t border-indigo-950/60 pt-3">
              <div className="w-8 h-8 rounded-full bg-[#111126] flex items-center justify-center text-sm shadow-sm select-none">👨‍💼</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-200">Siddharth Shah</div>
                <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider">Angel Investor</div>
              </div>
            </div>
          </div>

          {/* Vikram */}
          <div className="p-5 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">&quot;I love the offline local database setup. No bank credential hacks, no credit cards required. Just simple budgeting that actually compounds.&quot;</p>
            <div className="flex items-center gap-3 border-t border-indigo-950/60 pt-3">
              <div className="w-8 h-8 rounded-full bg-[#111126] flex items-center justify-center text-sm shadow-sm select-none">👨‍🎨</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-200">Vikram Rao</div>
                <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider">Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern SaaS Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#04040c]/40 border-y border-indigo-950/40 w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pricing Strategy</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Transparent plans. Unlimited growth.</h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Choose the plan fitting your wealth trajectory. Save 20% by subscribing to annual cycles.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-3 pt-4 select-none">
              <span className={`text-[10px] font-black uppercase tracking-wider ${billingCycle === "monthly" ? "text-indigo-400" : "text-slate-500"}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-10 h-6 bg-indigo-950 border border-indigo-900/60 rounded-full p-0.5 transition-all flex items-center shadow cursor-pointer relative"
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${billingCycle === "yearly" ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
              <span className={`text-[10px] font-black uppercase tracking-wider ${billingCycle === "yearly" ? "text-indigo-400" : "text-slate-500"}`}>
                Yearly <span className="bg-indigo-950 text-indigo-400 border border-indigo-900/40 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ml-1">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-200">Starter Plan</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Basic Personal tracking</p>
                </div>
                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-3xl font-black text-white">₹0</span>
                  <span className="text-[10px] text-slate-500 font-bold">/ forever</span>
                </div>
                <ul className="space-y-2 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 5 Transaction Ledger entries</li>
                  <li className="flex items-center gap-2">🟢 Basic budget envelopes</li>
                  <li className="flex items-center gap-2 text-slate-600">🔴 AI insights blocked</li>
                  <li className="flex items-center gap-2 text-slate-600">🔴 Excel CSV Exports locked</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-[#12122b] border border-indigo-950 hover:bg-[#1a1a3a] text-slate-300 hover:text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center">
                    Start Free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-[#12122b] border border-indigo-950 hover:bg-[#1a1a3a] text-slate-300 hover:text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-6 bg-[#0c0c24] border-2 border-indigo-600 rounded-2xl shadow-2xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow shadow-indigo-650/40 leading-none select-none">
                Most Popular
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-250">Pro Plan</h3>
                  <p className="text-[9px] text-indigo-400 font-bold uppercase mt-0.5">runway optimization</p>
                </div>
                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-3xl font-black text-white">
                    ₹{billingCycle === "monthly" ? "799" : "639"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    / {billingCycle === "monthly" ? "month" : "month billed annually"}
                  </span>
                </div>
                <ul className="space-y-2 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 Unlimited Ledger transactions</li>
                  <li className="flex items-center gap-2">🟢 Unlimited Budget Envelopes</li>
                  <li className="flex items-center gap-2">🟢 AI financial insights unlocked</li>
                  <li className="flex items-center gap-2">🟢 Direct Mutual Fund Ratio checks</li>
                  <li className="flex items-center gap-2">🟢 Secure Excel CSV Data Exports</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-indigo-600/35 text-center">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-indigo-600/35 text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Elite */}
            <div className="p-6 bg-[#080816]/75 border border-indigo-950 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-200">Elite Plan</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Family offices & Teams</p>
                </div>
                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-3xl font-black text-white">
                    ₹{billingCycle === "monthly" ? "1,999" : "1,599"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    / {billingCycle === "monthly" ? "month" : "month billed annually"}
                  </span>
                </div>
                <ul className="space-y-2 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 Everything in Pro Plan</li>
                  <li className="flex items-center gap-2">🟢 Multi-account Family support</li>
                  <li className="flex items-center gap-2">🟢 Custom RAG advisor context loading</li>
                  <li className="flex items-center gap-2">🟢 Priority developer support channels</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-[#12122b] border border-indigo-950 hover:bg-[#1a1a3a] text-slate-300 hover:text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-[#12122b] border border-indigo-950 hover:bg-[#1a1a3a] text-slate-300 hover:text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center block"
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
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 border border-indigo-900/50 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-dark-grid opacity-10"></div>
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Wealth Intelligence</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              Take Control of Your Financial Future.
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Start managing your net worth, transaction history, budget envelopes, and compound savings goals dynamically from a single AI-powered dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <SignedOut>
              <SignUpButton forceRedirectUrl="/dashboard">
                <button className="px-6 py-3.5 bg-indigo-650 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 cursor-pointer text-xs">
                  Start Free Today
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-indigo-650 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 cursor-pointer text-xs block text-center"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            
            <button 
              onClick={() => alert("Welcome! Click Start Free to log into your Personal Wealth OS dashboard.")}
              className="px-6 py-3.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 font-bold rounded-xl transition-all text-xs cursor-pointer"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-950/50 py-12 px-6 bg-[#030012]/80 shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10 text-xs text-slate-400 font-semibold leading-normal">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-indigo-650 flex items-center justify-center text-xs text-white">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-extrabold text-white text-base">FinTrack</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">The Personal Wealth Operating System engineered for founders, software developers, and builders.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-[10px] text-slate-500">
              <li><span className="hover:text-indigo-400 cursor-pointer">Dashboard</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Budgets</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Savings Goals</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">AI Advisor</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-3">Security</h4>
            <ul className="space-y-2 text-[10px] text-slate-500">
              <li><span className="hover:text-indigo-400 cursor-pointer">Encryption Protocol</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Local Storage DB</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">No Data Sales</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Zero Ads Policies</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-[10px] text-slate-500">
              <li><span className="hover:text-indigo-400 cursor-pointer">About Us</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Careers</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Contact Desk</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-bold text-slate-500 pt-6 border-t border-indigo-950/65">
          <div>© 2026 FinTrack Inc. All rights reserved. Made in Bengaluru.</div>
          <div className="flex gap-5">
            <span className="hover:text-indigo-400 cursor-pointer">Security Protocol</span>
            <span className="hover:text-indigo-400 cursor-pointer">Privacy Guidelines</span>
            <span className="hover:text-indigo-400 cursor-pointer">Terms of Service</span>
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
