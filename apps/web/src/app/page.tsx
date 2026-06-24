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
  X
} from "lucide-react";

// ----------------------------------------------------
// Landing Page component (Fully MNC, Corporate style)
// ----------------------------------------------------
function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeFeatureTab, setActiveFeatureTab] = useState<"dashboard" | "expense" | "budgets" | "investments" | "goals" | "ai">("dashboard");

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-900 flex flex-col justify-between selection:bg-indigo-150 font-sans relative overflow-x-hidden bg-grid-pattern">
      
      {/* Top Header Navbar */}
      <header className="border-b border-slate-200/40 bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40 shrink-0 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-150">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              FinTrack
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
            <a href="#features" className="hover:text-slate-800 transition-colors">Features</a>
            <a href="#problem" className="hover:text-slate-800 transition-colors">Solutions</a>
            <a href="#security" className="hover:text-slate-800 transition-colors">Security</a>
            <a href="#pricing" className="hover:text-slate-800 transition-colors">Pricing</a>
            <a href="#logo-concepts" className="hover:text-slate-800 transition-colors">Brand Identity</a>
          </nav>

          {/* Auth Action triggers */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <button
                  className="text-slate-650 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/dashboard">
                <button
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg transition-all shadow-sm shadow-indigo-100 cursor-pointer"
                >
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg transition-all shadow-sm shadow-indigo-100 cursor-pointer flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <span>➔</span>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-5 space-y-8 text-left relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-indigo-700 select-none shadow-sm animate-fadeIn">
              <span>🏆</span>
              <span>Trusted by 10,000+ software engineers & founders</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Command your <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-650 to-indigo-750 bg-clip-text text-transparent">
                personal wealth.
              </span>
            </h1>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl font-medium">
              Track transaction histories, configure monthly budgets, log compounding goals, and consult your offline RAG financial advisor—all in a premium, private client-first interface.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2.5 cursor-pointer text-xs"
                  >
                    <span>Start Free Today</span>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] leading-none shrink-0">
                      ➔
                    </span>
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2.5 cursor-pointer text-xs"
                >
                  <span>Go to Dashboard</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] leading-none shrink-0">
                    ➔
                  </span>
                </Link>
              </SignedIn>
              
              <button 
                onClick={() => alert("Thank you for your interest! Dynamic demo walkthrough will be available soon.")}
                className="px-6 py-3.5 bg-white border border-slate-250 hover:border-slate-350 hover:bg-slate-50/50 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-xs cursor-pointer"
              >
                Watch Demo
              </button>
            </div>

            {/* Verification Checkmarks */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-[10px] font-bold text-slate-400 select-none">
              <span className="flex items-center gap-1">
                🛡️ Bank-grade Security
              </span>
              <span className="flex items-center gap-1">
                💻 Local First
              </span>
              <span className="flex items-center gap-1">
                🔑 End-to-End Encryption
              </span>
              <span className="flex items-center gap-1">
                🚫 Zero Ads
              </span>
            </div>
          </div>

          {/* Right Column: Layered Dashboard Mockup */}
          <div className="lg:col-span-7 flex justify-center items-center relative w-full pr-4 pl-4 select-none">
            {/* Background mockup shadow bubble */}
            <div className="absolute w-[85%] h-[85%] bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
            
            {/* Main Mockup Window Container */}
            <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 aspect-[16/10] transform hover:scale-[1.01] transition-transform duration-300">
              
              {/* macOS style titlebar */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-450"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-450"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-450"></span>
                </div>
                <div className="px-3 py-1 bg-white border border-slate-200/60 rounded-md text-[9px] text-slate-400 font-mono w-44 text-center truncate">
                  fintrack.io/dashboard
                </div>
                <div className="w-8"></div>
              </div>
              
              {/* App Internal Workspace */}
              <div className="flex-1 flex overflow-hidden">
                {/* Mockup Sidebar */}
                <div className="w-32 bg-slate-50 border-r border-slate-100 p-3 flex flex-col gap-3.5 shrink-0">
                  {/* Brand logo */}
                  <div className="flex items-center gap-1.5 px-1 pb-1.5 border-b border-slate-200/40">
                    <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-[9px] text-white">
                      💬
                    </div>
                    <span className="font-extrabold text-[9px] text-slate-800 tracking-tight">FinTrack</span>
                  </div>
                  {/* Sidebar Menu */}
                  <ul className="space-y-1 text-[7px] font-bold text-slate-400">
                    <li className="flex items-center gap-1.5 px-2 py-1.5 bg-indigo-50/50 text-indigo-650 rounded-md">
                      <span>🏠</span> Overview
                    </li>
                    <li className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <span>💳</span> Accounts
                    </li>
                    <li className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <span>📖</span> Transactions
                    </li>
                    <li className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <span>✉️</span> Budgets
                    </li>
                    <li className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <span>🎯</span> Goals
                    </li>
                    <li className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <span>📊</span> Reports
                    </li>
                    <li className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <span>📈</span> Investments
                    </li>
                    <li className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <span>💬</span> Advisor
                    </li>
                  </ul>
                </div>
                
                {/* Mockup Dashboard Content */}
                <div className="flex-1 bg-white p-3.5 space-y-3.5 overflow-hidden flex flex-col justify-between">
                  {/* Header row */}
                  <div className="flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-extrabold text-slate-800 font-sans">Overview</span>
                    <span className="text-[6px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 font-black uppercase">Active Ledger</span>
                  </div>
                  
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 gap-2.5 shrink-0">
                    {/* Net Worth */}
                    <div className="border border-slate-100 p-2 rounded-lg space-y-0.5 shadow-sm bg-slate-50/30">
                      <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Net Worth</span>
                      <div className="text-[11px] font-black text-slate-850">₹ 8,42,18,930</div>
                      <span className="text-[6px] text-emerald-500 font-bold flex items-center gap-0.5">
                        <span>▲</span> +3.45% vs last month
                      </span>
                    </div>
                    {/* Cash Flow */}
                    <div className="border border-slate-100 p-2 rounded-lg space-y-0.5 shadow-sm bg-slate-50/30">
                      <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Cash Flow</span>
                      <div className="text-[11px] font-black text-slate-850">₹ 2,45,300</div>
                      <span className="text-[6px] text-emerald-500 font-bold flex items-center gap-0.5">
                        <span>▲</span> +18.6% vs last month
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart area */}
                  <div className="border border-slate-100 rounded-lg p-2.5 flex-1 flex flex-col justify-between min-h-0 bg-slate-50/10">
                    <div className="flex-1 relative flex items-end">
                      <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15"/>
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <path d="M 0,22 Q 15,18 35,14 T 70,8 T 100,4" fill="none" stroke="#4f46e5" strokeWidth="1.2" />
                        <path d="M 0,22 Q 15,18 35,14 T 70,8 T 100,4 L 100,25 L 0,25 Z" fill="url(#chartGrad)" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[5px] text-slate-400 font-bold mt-1 select-none font-mono">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    </div>
                  </div>

                  {/* Allocation and Transactions Row */}
                  <div className="grid grid-cols-2 gap-2.5 shrink-0">
                    {/* Asset Allocation */}
                    <div className="border border-slate-100 p-2 rounded-lg flex items-center gap-2 bg-slate-50/20 shadow-sm">
                      {/* Mini Donut Chart */}
                      <div className="relative w-8 h-8 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#f1f5f9" strokeWidth="3.5" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#4f46e5" strokeWidth="3.5" strokeDasharray="54 75" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#10b981" strokeWidth="3.5" strokeDasharray="13 75" strokeDashoffset="-54" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#3b82f6" strokeWidth="3.5" strokeDasharray="5 75" strokeDashoffset="-67" />
                          <circle cx="16" cy="16" r="12" fill="transparent" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="3 75" strokeDashoffset="-72" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[5px] font-black text-slate-800 font-mono">72%</div>
                      </div>
                      <div className="text-[5px] text-slate-500 font-bold space-y-0.5 leading-none">
                        <div className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-indigo-650"></span> Equities 72%</div>
                        <div className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> Debt 18%</div>
                        <div className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-blue-500"></span> Real Estate 7%</div>
                      </div>
                    </div>
                    {/* Recent Transactions list */}
                    <div className="border border-slate-100 p-2 rounded-lg space-y-1 text-[5px] bg-slate-50/20 shadow-sm">
                      <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-wider pb-0.5 border-b border-slate-100">
                        <span>Recent Ledger</span>
                      </div>
                      <div className="space-y-0.5 text-slate-650 font-semibold leading-normal font-mono">
                        <div className="flex justify-between"><span>Tata Consultancy</span><span>₹1,25,000</span></div>
                        <div className="flex justify-between"><span>HDFC Bank</span><span>₹45,000</span></div>
                        <div className="flex justify-between"><span>Amazon India</span><span>₹8,549</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Card 1: Milestone Goal (Bottom Left) */}
            <div className="absolute -bottom-5 -left-6 bg-white border border-slate-200/80 rounded-xl shadow-xl p-3 w-44 z-20 flex flex-col gap-1.5 animate-bounce-slow">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-50">
                <span className="text-[10px]">🎯</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Milestone Goal</span>
              </div>
              <div className="text-[8px] font-bold text-slate-700">Goa Vacation</div>
              <div className="text-xs font-black text-slate-950 leading-none font-mono">₹ 1,50,000</div>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[68%] h-full bg-indigo-650 rounded-full"></div>
                </div>
                <div className="flex justify-between text-[6px] text-slate-400 font-bold leading-none select-none">
                  <span>68% Completed</span>
                  <span>Target: Dec 2025</span>
                </div>
              </div>
            </div>

            {/* Floating Card 2: AI Insight (Top Right) */}
            <div className="absolute -top-5 -right-6 bg-white border border-slate-200/80 rounded-xl shadow-xl p-3 w-40 z-20 flex flex-col gap-1 animate-bounce-slow" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-1 pb-1 border-b border-slate-50">
                <span className="text-[9px]">✨</span>
                <span className="text-[7px] font-bold text-indigo-750 uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-[8px] text-slate-600 leading-normal font-bold">
                You can save <strong className="text-slate-800 font-black">₹18,500 more</strong> this month
              </p>
              <span className="text-[7px] text-indigo-650 font-bold hover:underline cursor-pointer">
                View details →
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Social Proof Logo Wall & Stats */}
      <section className="bg-slate-50/50 border-y border-slate-200/50 py-12 px-6 shrink-0 relative z-10 bg-dot-pattern">
        <div className="max-w-6xl mx-auto space-y-8 text-center">
          
          {/* Platform Scale Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border border-slate-200/70 bg-white/70 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">10,000+</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Users</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">₹50 Cr+</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Wealth Tracked</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">1M+</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transactions Processed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">99.99%</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Uptime Reliability</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">
              Trusted by industry leaders and growing teams
            </h3>
            
            {/* Grayscale partner logos wall */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 select-none opacity-60 hover:opacity-90 transition-opacity duration-300">
              <div className="flex items-center gap-1 font-black text-slate-400 tracking-wider"><span className="text-sm">ZERODHA</span></div>
              <div className="flex items-center gap-1.5 font-extrabold text-slate-400 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></span>
                <span className="text-sm">Groww</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-slate-400">
                <span className="text-sm">upstox</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-black tracking-widest text-slate-400 border border-slate-300 px-1.5 py-0.5 rounded shrink-0">
                <span>CRED</span>
              </div>
              <div className="flex items-center gap-0.5 font-bold italic text-slate-400 tracking-tight">
                <span className="text-sm">Razorpay</span>
                <span className="text-slate-400 font-extrabold">/</span>
              </div>
              <div className="flex items-center gap-0.5 font-bold text-slate-400">
                <span className="text-slate-400 text-sm">IND</span>
                <span className="text-sm">money</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section id="problem" className="py-20 px-6 max-w-6xl mx-auto w-full text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">The Problem</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Why traditional finance apps fail.</h2>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            Existing tools treat wealth like a static table of numbers. They are fragmented, sell your data to ads, or lack the intelligence needed to grow your capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
            <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-sm shadow-inner">❌</div>
            <h4 className="font-extrabold text-slate-800 text-sm">Scattered Financial Data</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Your bank accounts, mutual funds, budgets, and goals live in isolated apps with zero cross-linking capability.</p>
          </div>
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
            <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-sm shadow-inner">❌</div>
            <h4 className="font-extrabold text-slate-800 text-sm">No Net Worth Visibility</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Tracking assets and liabilities is a manual spreadsheet nightmare that fails to reflect live changes.</p>
          </div>
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
            <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-sm shadow-inner">❌</div>
            <h4 className="font-extrabold text-slate-800 text-sm">Zero Financial Intelligence</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Traditional apps simply tell you where your money went, but fail to guide you on how to compound it.</p>
          </div>
        </div>

        <div className="pt-6">
          <div className="inline-flex items-center gap-2 px-5 py-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-900 shadow-sm leading-none select-none">
            <span>💡</span>
            <span>Enter <strong className="font-extrabold text-indigo-700">FinTrack</strong>: The Personal Wealth Operating System</span>
          </div>
        </div>
      </section>

      {/* 4. Interactive Feature Showcase */}
      <section id="features" className="py-20 px-6 bg-slate-50/30 border-y border-slate-200/30 w-full select-none">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Platform capabilities</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Engineered for wealth compounding.</h2>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Every tool in the operating system is modular, offline-first, and designed to optimize your financial runway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Tab Selector Links (Left Column) */}
            <div className="lg:col-span-4 flex flex-col gap-2 shrink-0">
              <button 
                onClick={() => setActiveFeatureTab("dashboard")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  activeFeatureTab === "dashboard" 
                    ? "bg-white border-indigo-200 shadow-md text-indigo-900" 
                    : "bg-transparent border-transparent hover:bg-slate-100/60 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm ${activeFeatureTab === "dashboard" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-650"}`}><Layers size={16} /></div>
                <div>
                  <h4 className="font-bold text-xs">Wealth Dashboard</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Net worth trackers & accounts aggregates.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("expense")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  activeFeatureTab === "expense" 
                    ? "bg-white border-indigo-200 shadow-md text-indigo-900" 
                    : "bg-transparent border-transparent hover:bg-slate-100/60 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm ${activeFeatureTab === "expense" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-650"}`}><Activity size={16} /></div>
                <div>
                  <h4 className="font-bold text-xs">Expense Intelligence</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Smart transaction tags and category checks.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("budgets")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  activeFeatureTab === "budgets" 
                    ? "bg-white border-indigo-200 shadow-md text-indigo-900" 
                    : "bg-transparent border-transparent hover:bg-slate-100/60 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm ${activeFeatureTab === "budgets" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-650"}`}><Wallet size={16} /></div>
                <div>
                  <h4 className="font-bold text-xs">Budget Envelopes</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Monthly envelope caps and live utilization checks.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("investments")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  activeFeatureTab === "investments" 
                    ? "bg-white border-indigo-200 shadow-md text-indigo-900" 
                    : "bg-transparent border-transparent hover:bg-slate-100/60 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm ${activeFeatureTab === "investments" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-650"}`}><PieChart size={16} /></div>
                <div>
                  <h4 className="font-bold text-xs">Investment Tracking</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Stocks, SIP Mutual Funds, and cash reserves.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("goals")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  activeFeatureTab === "goals" 
                    ? "bg-white border-indigo-200 shadow-md text-indigo-900" 
                    : "bg-transparent border-transparent hover:bg-slate-100/60 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm ${activeFeatureTab === "goals" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-650"}`}><TrendingUp size={16} /></div>
                <div>
                  <h4 className="font-bold text-xs">Goal Planning</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Milestones pacing and compounding calculations.</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveFeatureTab("ai")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  activeFeatureTab === "ai" 
                    ? "bg-white border-indigo-200 shadow-md text-indigo-900" 
                    : "bg-transparent border-transparent hover:bg-slate-100/60 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm ${activeFeatureTab === "ai" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-650"}`}><Sparkles size={16} /></div>
                <div>
                  <h4 className="font-bold text-xs">AI Financial Advisor</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Conversational RAG diagnostics offline.</p>
                </div>
              </button>
            </div>

            {/* Tab Preview Dashboard (Right Column) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 aspect-[16/10] flex flex-col justify-between overflow-hidden">
              {activeFeatureTab === "dashboard" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-800">Wealth Dashboard</h3>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Real-time Sync</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Asset Ledger</span>
                      <div className="text-sm font-black text-slate-800 mt-1">₹ 9,50,00,000</div>
                    </div>
                    <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Liabilities</span>
                      <div className="text-sm font-black text-rose-600 mt-1">₹ 1,07,81,070</div>
                    </div>
                    <div className="border border-slate-100 p-3 rounded-xl bg-indigo-50/40 border-indigo-100/50">
                      <span className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider">Net Position</span>
                      <div className="text-sm font-black text-indigo-900 mt-1">₹ 8,42,18,930</div>
                    </div>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-4 flex-1 flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M 0,18 L 20,17 L 40,14 L 60,11 L 80,7 L 100,2" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              )}

              {activeFeatureTab === "expense" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-800">Expense Intelligence</h3>
                    <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">Smart Categorized</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-700">Swiggy Restaurant Delivery</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Category: Food & Dining · UPI Transfer</div>
                      </div>
                      <span className="font-extrabold text-rose-600">-₹850</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-700">Amazon Web Services AWS</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Category: Subscriptions · Credit Card</div>
                      </div>
                      <span className="font-extrabold text-rose-600">-₹4,290</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center font-bold">Smart filters automatically flags recurring transactions.</div>
                </div>
              )}

              {activeFeatureTab === "budgets" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-800">Envelope Budget Limits</h3>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">92% utilized</span>
                  </div>
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>🍔 Food & Dining</span>
                        <span>₹11,040 / ₹12,000</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-amber-500"></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>🚗 Uber & Travel</span>
                        <span>₹3,150 / ₹8,000</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-[39%] h-full bg-indigo-600"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-850 font-bold">
                    ⚠️ Alert: Food & Dining envelope is crossing 75% limit before the 15th of the month.
                  </div>
                </div>
              )}

              {activeFeatureTab === "investments" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-800">Investment Tracker</h3>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Yield positive</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                    <div className="space-y-2 text-[10px] text-slate-500 font-bold">
                      <div className="flex justify-between items-center p-2 border border-slate-100 rounded-md">
                        <span>📈 Stocks (Nifty 50)</span><span>45%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border border-slate-100 rounded-md">
                        <span>📊 Mutual Funds SIP</span><span>35%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border border-slate-100 rounded-md">
                        <span>🪙 Digital Gold</span><span>10%</span>
                      </div>
                    </div>
                    {/* Circle chart */}
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-8 border-indigo-600 flex items-center justify-center font-black text-slate-800">
                        80%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === "goals" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-800">Milestone Goals Pacing</h3>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Compounding</span>
                  </div>
                  <div className="border border-slate-100 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>MacBook Pro M4 Goal</span>
                      <span>₹45,000 / ₹1,20,000</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[37.5%] h-full bg-indigo-600"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold pt-1">
                      <span>Velocity: ₹15,000/mo</span>
                      <span>Timeline: 5 Months Remaining</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === "ai" && (
                <div className="space-y-4 h-full flex flex-col justify-between animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🤖</span>
                      <h3 className="text-xs font-extrabold text-slate-800">FinTrack RAG Advisor</h3>
                    </div>
                    <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Latency: 8ms</span>
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-end text-[10px]">
                    <div className="bg-indigo-50 text-indigo-950 p-2.5 rounded-xl rounded-tr-none max-w-[85%] self-end ml-auto">
                      macbook ke liye saving kab tak hogi?
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 text-slate-850 p-2.5 rounded-xl rounded-tl-none max-w-[85%] self-start mr-auto space-y-1.5">
                      <p>Aapka current savings rate **24%** hai. **MacBook Pro M4** target balance ₹1,20,000 bacha hai jise complete karne me aapko lagbhag **5 mahine** lagenge!</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 5. Logo Concepts Showcase */}
      <section id="logo-concepts" className="py-20 px-6 max-w-6xl mx-auto w-full text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Brand Identity</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Logo Concepts.</h2>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            FinTrack represents growth, trajectory, and stability. We designed three brand concepts fitting for a VC-funded startup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Concept 1: Approved */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-md space-y-4 border-t-4 border-t-indigo-600">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-bold rounded uppercase">Approved Design</span>
              <span className="text-xs text-slate-400 font-bold">Concept 1</span>
            </div>
            
            {/* Logo Vector Render */}
            <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
              <div className="flex items-center gap-3 relative z-10">
                {/* Vector icon */}
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-150">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-slate-800 text-sm">Concept 1: The Ascent Path</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">An abstract geometric rising trajectory symbol that combines the letter &quot;F&quot; and an upward growth trend path. Communicates trajectory and execution.</p>
          </div>

          {/* Concept 2 */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold">Concept 2</span>
            </div>
            
            {/* Logo Vector Render */}
            <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
              <div className="flex items-center gap-3 relative z-10">
                {/* Vector icon */}
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 rounded-full border-[3px] border-indigo-650 flex items-center justify-center relative">
                    <div className="absolute w-2 h-2 rounded-full bg-indigo-600 top-0.5 left-0.5"></div>
                  </div>
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-slate-800 text-sm">Concept 2: The Wealth Helix</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Two intersecting circular vector loops representing the orbit of cash inflows and target goals. Focuses on the compounding cycle.</p>
          </div>

          {/* Concept 3 */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold">Concept 3</span>
            </div>
            
            {/* Logo Vector Render */}
            <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center select-none relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
              <div className="flex items-center gap-3 relative z-10">
                {/* Vector icon */}
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-md font-serif text-lg font-black text-indigo-750">
                  ||
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">FinTrack</span>
              </div>
            </div>
            
            <h4 className="font-extrabold text-slate-800 text-sm">Concept 3: The Solid Pillar</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">A classic, modern Roman column representing absolute structural stability, security, and capital preservation. Emphasizes institutional trust.</p>
          </div>
        </div>
      </section>

      {/* 6. Visually Rich Analytics Panel */}
      <section className="py-20 px-6 bg-slate-50/20 border-y border-slate-200/30 w-full select-none">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Executive Analytics</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Granular wealth intelligence.</h2>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Unlock deep cash-flow breakdowns and asset trends formatted for founders and high-income professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Spending Heatmap Card */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity size={14} className="text-indigo-600" />
                  Spending Heatmap
                </span>
                <span className="text-[8px] font-bold text-slate-400 font-mono">Last 30 Days</span>
              </div>
              
              {/* Heatmap Grid boxes */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 28 }).map((_, idx) => {
                    // Random shading levels
                    const shades = ["bg-indigo-50", "bg-indigo-100", "bg-indigo-300", "bg-indigo-500", "bg-indigo-650"];
                    const shade = shades[idx % shades.length];
                    return (
                      <div 
                        key={idx} 
                        className={`aspect-square rounded-md ${shade} border border-white hover:scale-[1.1] transition-transform duration-200 cursor-pointer relative group`}
                      >
                        {/* Heatmap tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-slate-950 text-white text-[8px] px-1.5 py-1 rounded hidden group-hover:block whitespace-nowrap shadow z-30">
                          Day {idx + 1}: ₹{(idx * 150 + 100).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[8px] text-slate-450 font-bold select-none pt-2">
                  <span>Less Spends</span>
                  <span>More Spends</span>
                </div>
              </div>
            </div>

            {/* Savings Rate radial Gauge */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-indigo-600" />
                  Savings Gauge
                </span>
                <span className="text-[8px] font-bold text-slate-400 font-mono">Runway optimized</span>
              </div>
              <div className="flex flex-col items-center justify-center py-2 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#4f46e5" strokeWidth="3" strokeDasharray="68 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                  <span className="text-lg font-black text-slate-850">68%</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wide">Savings rate</span>
                </div>
              </div>
            </div>

            {/* Cash Flow allocation splits */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Wallet size={14} className="text-indigo-600" />
                  Cash Allocation
                </span>
                <span className="text-[8px] font-bold text-slate-400 font-mono">50/30/20 Balance</span>
              </div>
              <div className="space-y-3 font-semibold text-[10px] text-slate-700">
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Needs (Essential drafts)</span><span>48%</span></div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[48%] h-full bg-emerald-500"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Wants (Dining, Shopping)</span><span>28%</span></div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[28%] h-full bg-indigo-600"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Savings & Pay Down</span><span>24%</span></div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[24%] h-full bg-blue-500"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Local-First Security Section */}
      <section id="security" className="py-20 px-6 max-w-6xl mx-auto w-full text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Local Architecture</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Data. Your Control.</h2>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            FinTrack is engineered as an offline-first browser application. Your transactions, budgets, and keys are saved in your local state—never on our servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-sm text-indigo-600 shadow-inner">
              <Database size={16} />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Local Storage DB</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">All financial data is saved inside your local browser database. Your data stays on your hardware.</p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-sm text-indigo-600 shadow-inner">
              <Lock size={16} />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">End-to-End Encryption</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">When fetching advanced insights via API, keys are saved in browser storage. Request payloads are encrypted in transit.</p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-sm text-indigo-600 shadow-inner">
              <Shield size={16} />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Zero Ads or Tracking</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">We do not track cookies, trace logs, sell data, or host ads. We monetize through simple premium memberships.</p>
          </div>
        </div>
      </section>

      {/* 8. Dedicated AI Chat Simulator Showcase */}
      <section className="py-20 px-6 bg-slate-50/20 border-y border-slate-200/30 w-full select-none">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">AI Agent Showroom</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Meet FinTrack AI Advisor.</h2>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              An offline RAG reasoning engine that parses your query and aggregates local transactions, warning limits, and compounding goals in under 100ms.
            </p>
          </div>

          {/* AI Chat preview shell */}
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden aspect-[16/10] flex flex-col justify-between">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <span className="text-xs font-extrabold text-slate-800">FinTrack RAG Intelligence</span>
              </div>
              <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded uppercase">Connected</span>
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto flex flex-col justify-end text-xs leading-relaxed">
              {/* User message */}
              <div className="flex gap-2 max-w-[85%] self-end ml-auto flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">U</div>
                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm">
                  zomato kharcha kam kaise karein?
                </div>
              </div>

              {/* Assistant message */}
              <div className="flex gap-2 max-w-[85%] self-start mr-auto">
                <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs shrink-0 shadow-sm">🤖</div>
                <div className="bg-slate-50 border border-slate-200/80 text-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm space-y-3">
                  <p className="font-medium">Maine aapke transactions analyze kiye hain. Is month aapne Food aur Dining par total **₹11,040** spend kiya hai across **14 orders**. Swiggy/Zomato orders thoda control karke aap har hafte lagbhag **₹1,500** bacha sakte hain!</p>
                  
                  {/* DOs & DONTs preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-150 text-[10px]">
                    <div className="space-y-1">
                      <div className="font-bold text-emerald-700 uppercase tracking-wide text-[8px]">💡 Dos</div>
                      <div className="text-slate-650 bg-white p-2 rounded-lg border border-slate-100">Set weekly cap on food delivery apps.</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-rose-700 uppercase tracking-wide text-[8px]">⚠️ Donts</div>
                      <div className="text-slate-650 bg-white p-2 rounded-lg border border-slate-100 font-medium">Do not spend past ₹12,000 envelope limit.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 shrink-0 select-none">
              <input 
                type="text" 
                placeholder="Ask advisor: e.g. How to save ₹2L/year?" 
                disabled 
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none"
              />
              <button disabled className="p-2.5 bg-indigo-600 text-white rounded-lg opacity-80 cursor-not-allowed">➔</button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Premium User Testimonials */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full text-center space-y-12 select-none">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Loved by builders & investors.</h2>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            Here is how high-income engineers and founders track their wealth using FinTrack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {/* Rohan */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">&quot;As a software engineer, I wanted an app that is fast, secure, and has zero ads. FinTrack is my financial command center. The RAG advisor answers instantly.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👨‍💻</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-800">Rohan Dev</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">Staff Software Engineer</div>
              </div>
            </div>
          </div>
          {/* Anjali */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">&quot;Managing scattered startup cash reserves and personal equity is difficult. FinTrack helps me track my asset allocations and budgets in one place offline.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👩‍💼</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-800">Anjali Mehta</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">Fintech Founder</div>
              </div>
            </div>
          </div>
          {/* Siddharth */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">&quot;Net worth auditing is super fast. FinTrack charts show allocations clearly and the direct mutual fund ratio checks saved me 1% commission leaks.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👨‍💼</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-800">Siddharth Shah</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">Angel Investor</div>
              </div>
            </div>
          </div>
          {/* Vikram */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">&quot;I love the offline local database setup. No bank credential hacks, no credit cards required. Just simple budgeting that actually compounds.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm select-none">👨‍🎨</div>
              <div>
                <div className="font-extrabold text-[10px] text-slate-800">Vikram Rao</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Modern SaaS Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-slate-50/20 border-y border-slate-200/30 w-full select-none">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">Pricing Strategy</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Transparent plans. Unlimited growth.</h2>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Choose the plan fitting your wealth trajectory. Save 20% by subscribing to annual cycles.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-[10px] font-bold ${billingCycle === "monthly" ? "text-indigo-650 font-black" : "text-slate-400"}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-10 h-6 bg-indigo-650 rounded-full p-0.5 transition-all flex items-center shadow cursor-pointer relative"
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-sm ${billingCycle === "yearly" ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
              <span className={`text-[10px] font-bold ${billingCycle === "yearly" ? "text-indigo-650 font-black" : "text-slate-400"}`}>
                Yearly <span className="bg-indigo-100 text-indigo-850 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ml-1">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Starter Plan</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Basic Personal tracking</p>
                </div>
                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-3xl font-black text-slate-900">₹0</span>
                  <span className="text-[10px] text-slate-450 font-bold">/ forever</span>
                </div>
                <ul className="space-y-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 5 Transaction Ledger entries</li>
                  <li className="flex items-center gap-2">🟢 basic budget envelopes</li>
                  <li className="flex items-center gap-2">🔴 AI insights blocked</li>
                  <li className="flex items-center gap-2">🔴 Excel CSV Exports locked</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center">
                    Start Free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-6 bg-white border-2 border-indigo-600 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm leading-none select-none">
                Most Popular
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Pro Plan</h3>
                  <p className="text-[9px] text-indigo-650 font-bold uppercase mt-0.5">runway optimization</p>
                </div>
                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === "monthly" ? "799" : "639"}
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold">
                    / {billingCycle === "monthly" ? "month" : "month billed annually"}
                  </span>
                </div>
                <ul className="space-y-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 Unlimited Ledger transactions</li>
                  <li className="flex items-center gap-2">🟢 Unlimited Budget Envelopes</li>
                  <li className="flex items-center gap-2">🟢 AI financial insights unlocked</li>
                  <li className="flex items-center gap-2">🟢 Direct Mutual Fund checks</li>
                  <li className="flex items-center gap-2">🟢 Secure Excel CSV Data Exports</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-indigo-100 text-center">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-md shadow-indigo-100 text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Elite */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Elite Plan</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Family offices & Teams</p>
                </div>
                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === "monthly" ? "1,999" : "1,599"}
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold">
                    / {billingCycle === "monthly" ? "month" : "month billed annually"}
                  </span>
                </div>
                <ul className="space-y-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  <li className="flex items-center gap-2">🟢 Everything in Pro Plan</li>
                  <li className="flex items-center gap-2">🟢 Multi-account Family support</li>
                  <li className="flex items-center gap-2">🟢 Custom RAG advisor context loading</li>
                  <li className="flex items-center gap-2">🟢 Priority developer support channels</li>
                </ul>
              </div>
              <SignedOut>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm text-center block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Final Conversion CTA */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full select-none">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-950 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Take Control</span>
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
                <button className="px-6 py-3.5 bg-indigo-655 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg cursor-pointer text-xs">
                  Start Free Today
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-indigo-655 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg cursor-pointer text-xs block text-center"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            
            <button 
              onClick={() => alert("Thank you for your interest! Demo scheduling will be available soon.")}
              className="px-6 py-3.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-250 font-bold rounded-xl transition-all text-xs cursor-pointer"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer copyright and resources */}
      <footer className="border-t border-slate-200/50 py-10 px-6 bg-white shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10 text-xs text-slate-500 font-semibold leading-normal">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-xs text-white">💬</div>
              <span className="font-extrabold text-slate-800">FinTrack</span>
            </div>
            <p className="text-[10px] text-slate-405 font-medium leading-relaxed">The Personal Wealth Operating System engineered for founders, software developers, and builders.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-750 text-[10px] uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-slate-850 cursor-pointer">Dashboard</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">Budgets</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">Savings Goals</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">AI Advisor</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-750 text-[10px] uppercase tracking-wider mb-3">Security</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-slate-855 cursor-pointer">Encryption Protocol</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">Local Storage DB</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">No Data Sales</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">Zero Ads Policies</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-750 text-[10px] uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-slate-855 cursor-pointer">About Us</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">Careers</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-slate-855 cursor-pointer">Contact Desk</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-bold text-slate-400 pt-6 border-t border-slate-100">
          <div>© 2026 FinTrack Inc. All rights reserved. Made in Bengaluru.</div>
          <div className="flex gap-5">
            <span className="hover:text-slate-650 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-650 cursor-pointer">Privacy Guidelines</span>
            <span className="hover:text-slate-650 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ----------------------------------------------------
// Page Root Component (Route entrance)
// ----------------------------------------------------
export default function Page() {
  return <LandingPage />;
}

