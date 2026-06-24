"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
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
import {
  LocalStorageTransactionRepository,
  LocalStorageBudgetRepository,
  LocalStorageGoalRepository,
} from "../../infrastructure/db/local-storage-repositories";
import { Transaction } from "../../domain/entities/transaction";
import { Budget } from "../../domain/entities/budget";
import { Goal } from "../../domain/entities/goal";
import { Money } from "../../domain/value-objects/money";
import { RagService } from "../../application/services/rag-service";

function DashboardPage() {

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");

  const txRepo = useMemo(() => new LocalStorageTransactionRepository(), []);

  useEffect(() => {
    refreshData();
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

  const refreshData = async () => {
    let txs = await txRepo.searchTransactions("user1", "");
    
    const isSeeded = typeof window !== "undefined" ? localStorage.getItem("fintrack_seeded") === "true" : true;

    // Seed initial transactions if empty and never seeded before
    if (!isSeeded && txs.length === 0) {
      const seedTransactions = [
        { title: "Salary Credit", amount: 85000, type: "INCOME", category: "Salary", daysAgo: 6, method: "BANK_TRANSFER" },
        { title: "Rent payment", amount: 22000, type: "EXPENSE", category: "Rent", daysAgo: 5, method: "BANK_TRANSFER" },
        { title: "Grocery Shopping", amount: 4500, type: "EXPENSE", category: "Food", daysAgo: 4, method: "UPI" },
        { title: "Electric Bill", amount: 3200, type: "EXPENSE", category: "Recharge", daysAgo: 3, method: "CARD" },
        { title: "Mutual Fund SIP", amount: 15000, type: "INVESTMENT", category: "SIP", daysAgo: 2, method: "BANK_TRANSFER" },
        { title: "Swiggy Delivery", amount: 850, type: "EXPENSE", category: "Food", daysAgo: 1, method: "UPI" },
        { title: "Starbucks Coffee", amount: 350, type: "EXPENSE", category: "Food", daysAgo: 0, method: "UPI" },
        { title: "Freelance UI Design", amount: 12000, type: "INCOME", category: "Freelance", daysAgo: 0, method: "UPI" },
      ];

      for (const t of seedTransactions) {
        const date = new Date();
        date.setDate(date.getDate() - t.daysAgo);
        await txRepo.save(new Transaction(
          Math.random().toString(),
          "user1",
          t.category,
          t.title,
          new Money(t.amount),
          t.type as any,
          t.method as any,
          date
        ));
      }
      
      const bgRepo = new LocalStorageBudgetRepository();
      const glRepo = new LocalStorageGoalRepository();
      
      const existingBudgets = await bgRepo.findByUserAndMonth("user1", 6, 2026);
      if (existingBudgets.length === 0) {
        await bgRepo.save(new Budget(Math.random().toString(), "user1", "Food", new Money(12000), 6, 2026));
        await bgRepo.save(new Budget(Math.random().toString(), "user1", "Rent", new Money(25000), 6, 2026));
      }

      const existingGoals = await glRepo.findByUserId("user1");
      if (existingGoals.length === 0) {
        await glRepo.save(new Goal(Math.random().toString(), "user1", "Save for MacBook", new Money(80000), new Money(15000), null));
        await glRepo.save(new Goal(Math.random().toString(), "user1", "Emergency Fund", new Money(150000), new Money(45000), null));
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("fintrack_seeded", "true");
      }
      txs = await txRepo.searchTransactions("user1", "");
    } else if (typeof window !== "undefined" && !isSeeded) {
      localStorage.setItem("fintrack_seeded", "true");
    }
    
    const bgRepo = new LocalStorageBudgetRepository();
    const glRepo = new LocalStorageGoalRepository();
    const bgs = await bgRepo.findByUserAndMonth("user1", 6, 2026);
    const gls = await glRepo.findByUserId("user1");
    setBudgets(bgs);
    setGoals(gls);
    setTransactions(txs.sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  const dynamicInsight = useMemo(() => {
    if (transactions.length === 0) return "No transaction records found yet to generate financial insights.";
    
    // Run BM25 search with a general query to retrieve relevant guidelines
    const { docs } = RagService.retrieveRelevantKnowledge("general savings rate budget");
    const dummyTrace = { average_doc_length: 0, corpus_size: 0, term_frequencies: {}, document_frequencies: {}, scores: [], selected_docs: [] };
    
    const analysis = RagService.calculateLocalInsights(
      "general checkup",
      transactions,
      budgets,
      goals,
      docs,
      dummyTrace
    );
    
    return analysis.summary;
  }, [transactions, budgets, goals]);

  // Financial Metrics Calculations
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;

    transactions.forEach(t => {
      if (t.type === "INCOME") income += t.amount.amount;
      else if (t.type === "EXPENSE") expense += t.amount.amount;
      else if (t.type === "SAVINGS" || t.type === "INVESTMENT") savings += t.amount.amount;
    });

    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    return {
      income,
      expense,
      savings,
      netFlow: income - expense - savings,
      savingsRate,
    };
  }, [transactions]);

  const { chartData, maxAmount } = useMemo(() => {
    const days: { date: Date; label: string; amount: number }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d,
        label: d.toLocaleDateString("en-US", { weekday: "short" }), // e.g., "Mon", "Tue"
        amount: 0,
      });
    }

    transactions.forEach(t => {
      if (t.type === "EXPENSE") {
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);
        
        const slot = days.find(day => day.date.getTime() === txDate.getTime());
        if (slot) {
          slot.amount += t.amount.amount;
        }
      }
    });

    const max = Math.max(...days.map(d => d.amount), 1000);
    // Round max to nearest 500 or 1000
    const roundedMax = Math.ceil(max / 500) * 500;

    const data = days.map(d => ({
      label: d.label,
      amount: d.amount,
      percentage: (d.amount / roundedMax) * 100,
    }));

    return { chartData: data, maxAmount: roundedMax };
  }, [transactions]);

  const maxAmountLabel = maxAmount.toLocaleString();
  const midAmountLabel = (maxAmount / 2).toLocaleString();

  // Filtered transactions for rendering search
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const term = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(term) ||
        t.categoryId.toLowerCase().includes(term) ||
        t.type.toLowerCase().includes(term)
      );
    });
  }, [transactions, searchQuery]);

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Header bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Wealth Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time aggregates, target budgets, and goals projections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search recent transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 w-64 shadow-sm"
          />
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Income</span>
          <h2 className="text-2xl font-bold mt-2 text-emerald-600">₹{stats.income.toLocaleString()}</h2>
        </div>
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Expenses</span>
          <h2 className="text-2xl font-bold mt-2 text-rose-600">₹{stats.expense.toLocaleString()}</h2>
        </div>
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Savings</span>
          <h2 className="text-2xl font-bold mt-2 text-indigo-600">₹{stats.savings.toLocaleString()}</h2>
        </div>
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Net Flow</span>
          <h2 className="text-2xl font-bold mt-2 text-slate-800">₹{stats.netFlow.toLocaleString()}</h2>
        </div>
        <div className="glass-card p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Savings Rate</span>
          <h2 className="text-2xl font-bold mt-2 text-amber-600">{stats.savingsRate}%</h2>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Performance Chart & Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-6">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Daily Spending (Last 7 Days)</h3>
            
            {/* Visual Chart representation (SVG styled) */}
            <div className="flex gap-4 items-stretch h-56 mt-4">
              {/* Y-axis Labels */}
              <div className="flex flex-col justify-between text-[10px] text-slate-400 font-semibold pb-5 select-none w-10 text-right">
                <span>₹{maxAmountLabel}</span>
                <span>₹{midAmountLabel}</span>
                <span>₹0</span>
              </div>
              
              {/* Chart container with background grid lines */}
              <div className="flex-1 bg-slate-50/50 rounded-xl border border-slate-200/60 p-6 relative flex items-end justify-between gap-3 min-w-0">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-200/50 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-200/50 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-200/50 pointer-events-none"></div>
                
                {/* Columns */}
                {chartData.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group relative z-10">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20 border border-slate-800">
                      ₹{day.amount.toLocaleString()}
                    </div>
                    
                    {/* Bar */}
                    <div className="w-full flex justify-center h-full items-end">
                      <div
                        style={{ height: `${day.percentage}%` }}
                        className="w-full sm:w-8 bg-gradient-to-t from-indigo-500/80 to-indigo-600 rounded-t-md hover:from-indigo-600 hover:to-indigo-700 shadow-sm transition-all duration-300 min-h-[4px] border-t border-indigo-400/30"
                      ></div>
                    </div>
                    
                    <span className="text-[10px] text-slate-500 font-medium select-none">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100/80 rounded-xl flex gap-3 relative overflow-hidden">
              <span className="text-xl">✨</span>
              <div className={`text-xs text-indigo-950/80 leading-relaxed transition-all ${currentPlan === "free" ? "filter blur-[3px] select-none pointer-events-none" : ""}`}>
                <strong className="text-indigo-900 font-semibold">FinTrack Insights:</strong> {dynamicInsight}
              </div>
              {currentPlan === "free" && (
                <div className="absolute inset-0 bg-indigo-50/40 backdrop-blur-[1px] flex items-center justify-between px-6">
                  <div className="text-indigo-950/90 text-xs font-semibold flex items-center gap-1.5 select-none">
                    <span>✨</span> AI Insights locked
                  </div>
                  <Link href="/billing" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded shadow-sm transition-all whitespace-nowrap">
                    Upgrade to PRO
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recent Transactions List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Recent Transactions</h3>
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {filteredTransactions.slice(0, 5).map(t => (
                <div key={t.id} className="p-3 bg-slate-55 border border-slate-100 rounded-lg text-xs flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800">{t.title}</div>
                    <div className="text-slate-500 mt-0.5">{t.categoryId} · {t.paymentMethod}</div>
                  </div>
                  <div className={`font-bold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.type === "INCOME" ? "+" : "-"}₹{t.amount.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <SignedIn>
        <DashboardPage />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
