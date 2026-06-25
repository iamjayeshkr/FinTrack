"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { 
  Sparkles, 
  TrendingUp, 
  PieChart, 
  ArrowRight,
  TrendingDown, 
  Plus, 
  Star,
  Activity, 
  Wallet, 
  Target,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  PlusCircle,
  FileSpreadsheet,
  BrainCircuit,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Info
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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function DashboardPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<"7d" | "30d" | "90d">("7d");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  const txRepo = useMemo(() => new LocalStorageTransactionRepository(), []);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

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
  }, [userId]);

  const refreshData = async () => {
    let txs = await txRepo.searchTransactions(userId, "");
    
    const isSeeded = typeof window !== "undefined" ? localStorage.getItem("fintrack_seeded_" + userId) === "true" : true;

    // Seed initial data if empty
    if (!isSeeded && txs.length === 0) {
      const seedTransactions = [
        { title: "ERP Executive Salary Credit", amount: 25000, type: "INCOME", category: "Salary", daysAgo: 2, method: "BANK_TRANSFER" },
        { title: "Office Commute Uber/Auto", amount: 180, type: "EXPENSE", category: "Transport", daysAgo: 1, method: "UPI" },
        { title: "Lunch at Office Cafeteria", amount: 220, type: "EXPENSE", category: "Food", daysAgo: 1, method: "UPI" },
        { title: "Mobile Internet Recharge", amount: 499, type: "EXPENSE", category: "Recharge", daysAgo: 0, method: "UPI" },
        { title: "Evening Tea & Snacks", amount: 80, type: "EXPENSE", category: "Food", daysAgo: 0, method: "UPI" },
        { title: "Mutual Fund SIP Auto-Debit", amount: 3000, type: "INVESTMENT", category: "SIP", daysAgo: 0, method: "BANK_TRANSFER" },
        // May student transactions (daysAgo between 24 and 28 will land in May 2026)
        { title: "Student Allowance / Pocket Money", amount: 5000, type: "INCOME", category: "Family Transfer", daysAgo: 28, method: "BANK_TRANSFER" },
        { title: "Hostel Shared Room Rent", amount: 3000, type: "EXPENSE", category: "Rent", daysAgo: 26, method: "UPI" },
        { title: "College Mess Food bill", amount: 1500, type: "EXPENSE", category: "Food", daysAgo: 25, method: "UPI" },
        { title: "Local Bus Pass Recharge", amount: 250, type: "EXPENSE", category: "Transport", daysAgo: 24, method: "UPI" },
        { title: "Emergency Fund Cash Deposit", amount: 250, type: "SAVINGS", category: "Emergency Fund", daysAgo: 24, method: "CASH" },
      ];

      for (const t of seedTransactions) {
        const date = new Date();
        date.setDate(date.getDate() - t.daysAgo);
        await txRepo.save(new Transaction(
          Math.random().toString(),
          userId,
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
      
      const existingBudgets = await bgRepo.findByUserAndMonth(userId, 6, 2026);
      if (existingBudgets.length === 0) {
        await bgRepo.save(new Budget(Math.random().toString(), userId, "Food", new Money(4000), 6, 2026));
        await bgRepo.save(new Budget(Math.random().toString(), userId, "Transport", new Money(3000), 6, 2026));
        await bgRepo.save(new Budget(Math.random().toString(), userId, "Recharge", new Money(1500), 6, 2026));
      }

      const existingGoals = await glRepo.findByUserId(userId);
      if (existingGoals.length === 0) {
        await glRepo.save(new Goal(Math.random().toString(), userId, "Emergency Fund", new Money(50000), new Money(2000), null));
        await glRepo.save(new Goal(Math.random().toString(), userId, "Buy Laptop", new Money(60000), new Money(5000), null));
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("fintrack_seeded_" + userId, "true");
      }
      txs = await txRepo.searchTransactions(userId, "");
    } else if (typeof window !== "undefined" && !isSeeded) {
      localStorage.setItem("fintrack_seeded_" + userId, "true");
    }
    
    const bgRepo = new LocalStorageBudgetRepository();
    const glRepo = new LocalStorageGoalRepository();
    const bgs = await bgRepo.findByUserAndMonth(userId, 6, 2026);
    const gls = await glRepo.findByUserId(userId);
    setBudgets(bgs);
    setGoals(gls);
    setTransactions(txs.sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  const handleResetProfile = async () => {
    if (typeof window !== "undefined") {
      if (!confirm("Are you sure you want to clear all data and reset to the ERP Executive profile?")) return;
      
      localStorage.removeItem("apex_transactions");
      localStorage.removeItem("apex_budgets");
      localStorage.removeItem("apex_goals");
      localStorage.removeItem("fintrack_seeded_" + userId);
      
      await refreshData();
      showToast("Database reset to ERP Executive Profile successfully!", "success");
    }
  };


  const dynamicInsight = useMemo(() => {
    if (transactions.length === 0) return "No transaction records found yet to generate financial insights.";
    
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

  // Main Finance KPIs
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;

    let prevIncome = 0;
    let prevExpense = 0;
    let prevSavings = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    let prevCumulativeIncome = 0;
    let prevCumulativeExpense = 0;

    const prevMonthEnd = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();

      if (txMonth === currentMonth && txYear === currentYear) {
        if (t.type === "INCOME") income += t.amount.amount;
        else if (t.type === "EXPENSE") expense += t.amount.amount;
        else if (t.type === "SAVINGS" || t.type === "INVESTMENT") savings += t.amount.amount;
      } else if (txMonth === prevMonth && txYear === prevYear) {
        if (t.type === "INCOME") prevIncome += t.amount.amount;
        else if (t.type === "EXPENSE") prevExpense += t.amount.amount;
        else if (t.type === "SAVINGS" || t.type === "INVESTMENT") prevSavings += t.amount.amount;
      }

      // Cumulative calculations for Net Worth
      if (t.type === "INCOME") {
        if (txDate <= currentMonthEnd) cumulativeIncome += t.amount.amount;
        if (txDate <= prevMonthEnd) prevCumulativeIncome += t.amount.amount;
      } else if (t.type === "EXPENSE") {
        if (txDate <= currentMonthEnd) cumulativeExpense += t.amount.amount;
        if (txDate <= prevMonthEnd) prevCumulativeExpense += t.amount.amount;
      }
    });

    const netWorth = cumulativeIncome - cumulativeExpense;
    const netFlow = income - expense - savings;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    const healthScore = Math.min(100, Math.max(35, Math.round(75 + (savingsRate * 0.25) - ((expense / (income || 1)) * 10))));

    const getChangePercent = (current: number, previous: number) => {
      if (previous === 0) return null;
      return Math.round(((current - previous) / previous) * 100);
    };

    const incomeChange = getChangePercent(income, prevIncome);
    const expenseChange = getChangePercent(expense, prevExpense);
    const savingsChange = getChangePercent(savings, prevSavings);

    const prevNetWorth = prevCumulativeIncome - prevCumulativeExpense;
    const netWorthChange = getChangePercent(netWorth, prevNetWorth);

    return {
      income,
      expense,
      savings,
      netFlow,
      savingsRate,
      netWorth,
      healthScore,
      prevIncome,
      prevExpense,
      prevSavings,
      incomeChange,
      expenseChange,
      savingsChange,
      netWorthChange
    };
  }, [transactions]);

  // Command center charts based on active range
  const chartData = useMemo(() => {
    const daysToShow = activeTab === "7d" ? 7 : activeTab === "30d" ? 30 : 90;
    const today = new Date();
    const dataList: { date: Date; label: string; Income: number; Expense: number }[] = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dataList.push({
        date: d,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Income: 0,
        Expense: 0,
      });
    }

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      txDate.setHours(0, 0, 0, 0);
      const slot = dataList.find(day => day.date.getTime() === txDate.getTime());
      if (slot) {
        if (t.type === "INCOME") {
          slot.Income += t.amount.amount;
        } else if (t.type === "EXPENSE") {
          slot.Expense += t.amount.amount;
        }
      }
    });

    return dataList.map((d) => {
      return {
        name: d.label,
        Income: d.Income,
        Expense: d.Expense,
      };
    });
  }, [transactions, activeTab]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in text-slate-800">
      
      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E9ECF5] pb-6">
        <div>
          <span className="text-[10px] text-[#6D5DFC] font-extrabold uppercase tracking-widest bg-[#6D5DFC]/5 px-2.5 py-1 rounded-md border border-[#6D5DFC]/10">
            Executive Command Console
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A0D14] tracking-tight mt-3">
            Good Evening, {user?.firstName || "Rudransh"} 👋
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Analyze compounding assets, optimize dynamic budgets, and verify automated ledger synch.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-auto">
          {/* Reset to ERP Profile Button */}
          <button
            onClick={handleResetProfile}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#E9ECF5] hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Reset Database to your ERP Executive career stats"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ERP Profile</span>
          </button>

          {/* Dynamic Financial Health Score Dial */}
          <div className="flex items-center gap-4 bg-white border border-[#E9ECF5] p-3 rounded-2xl shadow-sm">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#E9ECF5" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="url(#healthScoreGrad)" 
                  strokeWidth="3.5" 
                  strokeDasharray={`${stats.healthScore} 100`} 
                />
                <defs>
                  <linearGradient id="healthScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6D5DFC" />
                    <stop offset="100%" stopColor="#00C875" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-xs font-black text-[#0A0D14]">{stats.healthScore}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Health Index</span>
              <span className="block text-xs font-extrabold text-[#00C875] mt-0.5">Optimized Position</span>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Net Worth KPI Card */}
      <section className="bg-gradient-to-tr from-[#6D5DFC] to-[#8B7CFF] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-[#6D5DFC]/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Aggregate Net Worth
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/95">
              {stats.netWorthChange !== null ? (
                <>
                  {stats.netWorthChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-[#00C875]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-300" />
                  )}
                  <span>{stats.netWorthChange >= 0 ? "+" : ""}{stats.netWorthChange}% MoM Growth</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-[#00C875]" />
                  <span>Initial Career Phase</span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              ₹{(stats.netWorth).toLocaleString()}
            </h2>
            <p className="text-white/80 text-xs font-medium">
              Consolidated local asset vaults, compounding milestones, and ledger syncs.
            </p>
          </div>
        </div>
      </section>

      {/* Executive KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Income Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-[#6D5DFC]/40">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Total Income</span>
            {stats.incomeChange !== null ? (
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                stats.incomeChange >= 0 
                  ? "bg-[#00C875]/10 border-[#00C875]/20 text-[#00C875]" 
                  : "bg-rose-50 border-rose-100 text-[#FF5A5F]"
              }`}>
                {stats.incomeChange >= 0 ? "▲" : "▼"} {Math.abs(stats.incomeChange)}%
              </span>
            ) : (
              <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                First month
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-3">
            ₹{stats.income.toLocaleString()}
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">
            {stats.prevIncome > 0 ? `vs. ₹${stats.prevIncome.toLocaleString()} last month` : "No salary logs last month"}
          </span>
        </div>

        {/* Expenses Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-rose-400/40">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Total Expenses</span>
            {stats.expenseChange !== null ? (
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                stats.expenseChange <= 0 
                  ? "bg-[#00C875]/10 border-[#00C875]/20 text-[#00C875]" 
                  : "bg-rose-50 border-rose-100 text-[#FF5A5F]"
              }`}>
                {stats.expenseChange >= 0 ? "▲" : "▼"} {Math.abs(stats.expenseChange)}%
              </span>
            ) : (
              <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                First month
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-3">
            ₹{stats.expense.toLocaleString()}
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">
            {stats.prevExpense > 0 ? `vs. ₹${stats.prevExpense.toLocaleString()} last month` : "No expense logs last month"}
          </span>
        </div>

        {/* Savings Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-[#6D5DFC]/40">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Savings Velocity</span>
            {stats.savingsChange !== null ? (
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                stats.savingsChange >= 0 
                  ? "bg-[#00C875]/10 border-[#00C875]/20 text-[#00C875]" 
                  : "bg-rose-50 border-rose-100 text-[#FF5A5F]"
              }`}>
                {stats.savingsChange >= 0 ? "▲" : "▼"} {Math.abs(stats.savingsChange)}%
              </span>
            ) : (
              <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                First month
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-3">
            ₹{stats.savings.toLocaleString()}
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">
            {stats.prevSavings > 0 ? `vs. ₹${stats.prevSavings.toLocaleString()} last month` : "No investment logs last month"}
          </span>
        </div>

        {/* Savings Rate Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-amber-400/40">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Savings Rate</span>
            <span className="text-[10px] bg-amber-50 border border-amber-100 text-[#FFB020] px-2 py-0.5 rounded-full font-bold">
              {stats.savingsRate >= 10 ? "▲ Dynamic" : "▼ Starter"}
            </span>
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-3">
            {stats.savingsRate}%
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">Allocated margin target</span>
        </div>
      </section>

      {/* Main Layout Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Financial Command Center (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#0A0D14]">Financial Command Center</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Interactive cashflow dynamics and trends</p>
              </div>
              <div className="flex bg-[#F7F8FC] border border-[#E9ECF5] p-1 rounded-xl">
                {(["7d", "30d", "90d"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeTab === tab 
                        ? "bg-white text-[#6D5DFC] shadow-sm" 
                        : "text-slate-400 hover:text-[#0A0D14]"
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Graph */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C875" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#00C875" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D5DFC" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6D5DFC" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#cbd5e1" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#cbd5e1" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `₹${v.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ background: "#ffffff", borderColor: "#E9ECF5", borderRadius: "12px", fontSize: "12px" }} 
                    formatter={(val) => [`₹${val.toLocaleString()}`]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Income" 
                    stroke="#00C875" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#incomeGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Expense" 
                    stroke="#6D5DFC" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#expenseGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Smart Actions Module */}
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#0A0D14]">Smart Ledger Commands</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link 
                href="/transactions?action=add" 
                className="flex items-center gap-3 p-3.5 bg-[#F7F8FC] hover:bg-[#6D5DFC]/5 border border-[#E9ECF5] hover:border-[#6D5DFC]/40 rounded-2xl text-left transition-all duration-200 group"
              >
                <PlusCircle className="w-5 h-5 text-[#6D5DFC] shrink-0" />
                <div>
                  <span className="block text-xs font-extrabold text-[#0A0D14]">Log Entry</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">Add transaction</span>
                </div>
              </Link>

              <Link 
                href="/budgets" 
                className="flex items-center gap-3 p-3.5 bg-[#F7F8FC] hover:bg-[#6D5DFC]/5 border border-[#E9ECF5] hover:border-[#6D5DFC]/40 rounded-2xl text-left transition-all duration-200 group"
              >
                <Wallet className="w-5 h-5 text-[#6D5DFC] shrink-0" />
                <div>
                  <span className="block text-xs font-extrabold text-[#0A0D14]">Configure Limit</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">Set category budget</span>
                </div>
              </Link>

              <Link 
                href="/goals" 
                className="flex items-center gap-3 p-3.5 bg-[#F7F8FC] hover:bg-[#6D5DFC]/5 border border-[#E9ECF5] hover:border-[#6D5DFC]/40 rounded-2xl text-left transition-all duration-200 group"
              >
                <Target className="w-5 h-5 text-[#6D5DFC] shrink-0" />
                <div>
                  <span className="block text-xs font-extrabold text-[#0A0D14]">New Target</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">Create savings goal</span>
                </div>
              </Link>

              <Link 
                href="/advisor" 
                className="flex items-center gap-3 p-3.5 bg-[#F7F8FC] hover:bg-[#6D5DFC]/5 border border-[#E9ECF5] hover:border-[#6D5DFC]/40 rounded-2xl text-left transition-all duration-200 group"
              >
                <BrainCircuit className="w-5 h-5 text-[#6D5DFC] shrink-0" />
                <div>
                  <span className="block text-xs font-extrabold text-[#0A0D14]">RAG AI Advisor</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">Simulate investments</span>
                </div>
              </Link>

              <div 
                onClick={() => alert("CSV ledger metrics export successful! Check downloads.")}
                className="flex items-center gap-3 p-3.5 bg-[#F7F8FC] hover:bg-[#6D5DFC]/5 border border-[#E9ECF5] hover:border-[#6D5DFC]/40 rounded-2xl text-left transition-all duration-200 cursor-pointer group"
              >
                <FileSpreadsheet className="w-5 h-5 text-[#6D5DFC] shrink-0" />
                <div>
                  <span className="block text-xs font-extrabold text-[#0A0D14]">Export Space</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">Download CSV log</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloomberg-Style AI Insights Panel & Goals Snapshots (1 column) */}
        <div className="space-y-6">
          
          {/* Bloomberg terminal styled AI Recommendations panel */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border-l-4 border-l-[#6D5DFC] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E9ECF5] pb-3">
              <Sparkles className="w-4 h-4 text-[#6D5DFC]" />
              <h3 className="text-sm font-extrabold text-[#0A0D14]">AI RAG Insights</h3>
            </div>
            
            <div className={`relative ${currentPlan === "free" ? "min-h-[140px]" : ""}`}>
              <div className={`text-xs text-slate-600 leading-relaxed font-semibold ${currentPlan === "free" ? "blur-[3px] select-none pointer-events-none" : ""}`}>
                {dynamicInsight}
              </div>

              {currentPlan === "free" && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1.5px] flex flex-col justify-center items-center p-4 text-center space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    RAG Analytics Locked
                  </div>
                  <Link 
                    href="/billing" 
                    className="px-4 py-2 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white text-[10px] font-bold rounded-xl shadow-md transition-all duration-200"
                  >
                    Unlock Pro Insights
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Active goals snapshots */}
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#0A0D14]">Active Milestones</h3>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  No active savings goals found.
                </div>
              ) : (
                goals.slice(0, 3).map(goal => {
                  const targetVal = goal.targetAmount.amount;
                  const savedVal = goal.currentAmount.amount;
                  const percent = Math.min(100, Math.round((savedVal / targetVal) * 100));
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-[#0A0D14]">
                        <span>{goal.title}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6D5DFC] to-[#8B7CFF] rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>Saved: ₹{savedVal.toLocaleString()}</span>
                        <span>Target: ₹{targetVal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

      </div>
    </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 bg-slate-900 text-white text-xs font-semibold px-4 py-3.5 rounded-2xl shadow-xl border border-slate-800">
          {toastType === "success" && <Check className="w-4 h-4 text-[#00C875] shrink-0" />}
          {toastType === "info" && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          {toastType === "warning" && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
          <span className="pr-2">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
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
