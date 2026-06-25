"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Percent,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  ChevronRight
} from "lucide-react";
import {
  LocalStorageTransactionRepository,
  LocalStorageBudgetRepository
} from "../../infrastructure/db/local-storage-repositories";
import { DocumentGeneratorService } from "../../application/services/document-generator";
import { Transaction } from "../../domain/entities/transaction";
import { Budget } from "../../domain/entities/budget";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const MONTHS = [
  { value: "5-2026", label: "May 2026" },
  { value: "6-2026", label: "June 2026" },
  { value: "7-2026", label: "July 2026" }
];

const COLORS = ["#6D5DFC", "#00C875", "#FFB020", "#FF5A5F", "#8B7CFF", "#00D2F6"];

export default function ReportsPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  const [selectedPeriod, setSelectedPeriod] = useState<string>("6-2026");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const txRepo = useMemo(() => new LocalStorageTransactionRepository(), []);
  const bgRepo = useMemo(() => new LocalStorageBudgetRepository(), []);

  const [month, year] = useMemo(() => {
    const parts = selectedPeriod.split("-");
    return [parseInt(parts[0]), parseInt(parts[1])];
  }, [selectedPeriod]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    const txList = await txRepo.searchTransactions(userId, "");
    // Filter transactions to only match the selected month & year
    const filteredTx = txList.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month - 1 && d.getFullYear() === year;
    });
    setTransactions(filteredTx.sort((a, b) => b.date.getTime() - a.date.getTime()));

    const budgetList = await bgRepo.findByUserAndMonth(userId, month, year);
    setBudgets(budgetList);
  };

  useEffect(() => {
    loadData();
  }, [userId, selectedPeriod]);

  // Aggregate stats
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let investments = 0;
    let savings = 0;

    transactions.forEach(t => {
      if (t.type === "INCOME") income += t.amount.amount;
      else if (t.type === "EXPENSE") expenses += t.amount.amount;
      else if (t.type === "INVESTMENT") investments += t.amount.amount;
      else if (t.type === "SAVINGS") savings += t.amount.amount;
    });

    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;
    const healthScore = Math.min(100, Math.max(35, Math.round(70 + (savingsRate * 0.25) - ((expenses / (income || 1)) * 10))));

    return {
      income,
      expenses,
      investments,
      savings,
      netSavings,
      savingsRate,
      healthScore
    };
  }, [transactions]);

  // Category chart breakdown data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === "EXPENSE")
      .forEach(t => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount.amount;
      });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Dynamic daily cash flow for chart
  const cashFlowTimeline = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      return {
        day: dayNum,
        label: `${dayNum} ${new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short" })}`,
        Income: 0,
        Expense: 0
      };
    });

    transactions.forEach(t => {
      const d = new Date(t.date);
      const dayIndex = d.getDate() - 1;
      if (dayIndex >= 0 && dayIndex < daysInMonth) {
        if (t.type === "INCOME") {
          daysArray[dayIndex].Income += t.amount.amount;
        } else if (t.type === "EXPENSE") {
          daysArray[dayIndex].Expense += t.amount.amount;
        }
      }
    });

    return daysArray;
  }, [transactions, month, year]);

  // Filtered transactions for the UI list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.categoryId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || t.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategory]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.categoryId)));
  }, [transactions]);

  // Export to PDF
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const monthLabel = MONTHS.find(m => m.value === selectedPeriod)?.label || `Period ${selectedPeriod}`;
      
      // Map active budgets
      const docBudgets = budgets.map(b => {
        // Calculate spent amount from transactions
        const spent = transactions
          .filter(t => t.type === "EXPENSE" && t.categoryId === b.categoryId)
          .reduce((sum, t) => sum + t.amount.amount, 0);
        const percent = b.limitAmount.amount > 0 ? Math.round((spent / b.limitAmount.amount) * 100) : 0;
        
        return {
          category: b.categoryId,
          limit: b.limitAmount.amount,
          spent,
          percentage: percent,
          status: percent < 80 ? "On Track" as const : percent >= 100 ? "Breached" as const : "Warning" as const
        };
      });

      // Map top spends
      const topSpends = [...transactions]
        .filter(t => t.type === "EXPENSE")
        .slice(0, 5)
        .map(t => ({
          title: t.title,
          category: t.categoryId,
          amount: t.amount.amount,
          date: new Date(t.date).toLocaleDateString("en-IN", { dateStyle: "short" }),
          method: t.paymentMethod
        }));

      const reportId = `STMT-${year}-${month.toString().padStart(2, "0")}`;

      const statementData = {
        id: reportId,
        date: new Date().toLocaleDateString("en-IN", { dateStyle: "long" }),
        monthName: monthLabel,
        customer: {
          name: user?.fullName || "Rudransh Kumar",
          email: user?.primaryEmailAddress?.emailAddress || "bituofficial44@gmail.com",
          billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN",
          tier: localStorage.getItem("fintrack_plan") || "free",
          customerId: `CUS-${userId.slice(0, 8).toUpperCase()}`
        },
        summary: {
          totalIncome: stats.income,
          totalExpenses: stats.expenses,
          netSavings: stats.netSavings,
          savingsRate: stats.savingsRate,
          activeBudgetsCount: budgets.length
        },
        budgets: docBudgets,
        topSpends,
        currency: "INR",
        healthScore: stats.healthScore
      };

      await DocumentGeneratorService.generateAccountStatementPDF(statementData, [109, 93, 252]);
      showToast("PDF Account Statement generated successfully!");
    } catch (error) {
      console.error(error);
      showToast("Error generating PDF Statement.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Date", "Title", "Type", "Category", "Amount", "Method", "Description"];
      const rows = transactions.map(t => [
        t.id,
        t.date.toLocaleDateString("en-IN"),
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        t.categoryId,
        t.amount.amount,
        t.paymentMethod,
        `"${(t.description || "").replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `fintrack_statement_${selectedPeriod}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV Statement exported successfully!");
    } catch (e) {
      console.error(e);
      showToast("Error exporting CSV.");
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0A0D14] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 animate-slide-up text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-[#00C875]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E9ECF5] pb-6">
        <div>
          <span className="text-[10px] text-[#6D5DFC] font-extrabold uppercase tracking-widest bg-[#6D5DFC]/5 px-2.5 py-1 rounded-md border border-[#6D5DFC]/10">
            Treasury & Wealth Audit
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A0D14] tracking-tight mt-3">
            Financial Statements & Auditing
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Export tax-ready reports, verify savings rates, and analyze category distributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-[#E9ECF5] hover:border-slate-300 px-4 py-2.5 pr-10 rounded-xl text-xs font-bold text-slate-700 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* PDF Export Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#6D5DFC]/10 hover:shadow-lg disabled:opacity-70 cursor-pointer"
          >
            {isExportingPDF ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>PDF Statement</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E9ECF5] hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00C875]" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cash Inflow */}
        <div className="bg-white border border-[#E9ECF5] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-[#6D5DFC]/30 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Total Cash Inflow</span>
            <div className="w-7 h-7 rounded-lg bg-[#00C875]/10 flex items-center justify-center text-[#00C875]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-3">
            ₹{stats.income.toLocaleString()}
          </h3>
          <span className="text-[10px] text-[#00C875] font-bold mt-1">
            Settled bank transfers & salary
          </span>
        </div>

        {/* Cash Outflow */}
        <div className="bg-white border border-[#E9ECF5] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-[#6D5DFC]/30 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Total Cash Outflow</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-3">
            ₹{stats.expenses.toLocaleString()}
          </h3>
          <span className="text-[10px] text-rose-500 font-bold mt-1">
            Debited card & UPI spendings
          </span>
        </div>

        {/* Net Savings */}
        <div className="bg-white border border-[#E9ECF5] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-[#6D5DFC]/30 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Net Cash Position</span>
            <div className="w-7 h-7 rounded-lg bg-[#6D5DFC]/10 flex items-center justify-center text-[#6D5DFC]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-3">
            ₹{stats.netSavings.toLocaleString()}
          </h3>
          <span className={`text-[10px] font-bold mt-1 ${stats.netSavings >= 0 ? "text-[#00C875]" : "text-rose-500"}`}>
            {stats.netSavings >= 0 ? "Net Positive Balance" : "Net Deficit Balance"}
          </span>
        </div>

        {/* Savings Velocity & Health score */}
        <div className="bg-white border border-[#E9ECF5] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-[#6D5DFC]/30 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Savings Efficiency</span>
            <span className="text-[10px] bg-[#6D5DFC]/5 border border-[#6D5DFC]/10 text-[#6D5DFC] px-2 py-0.5 rounded-full font-bold">
              Score: {stats.healthScore}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight">
              {stats.savingsRate}%
            </h3>
            <span className="text-xs text-slate-400 font-extrabold uppercase">Rate</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">
            Target benchmark: 35% MoM
          </span>
        </div>
      </section>

      {/* Main Charts & Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trend Area Chart (Income vs Expense) */}
        <div className="bg-white border border-[#E9ECF5] rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E9ECF5] pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0A0D14]">Monthly Cash Flow Trend</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Daily income vs expense tracking</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#6D5DFC] rounded-full inline-block" /> Inflow</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#FF5A5F] rounded-full inline-block" /> Outflow</span>
            </div>
          </div>

          <div className="h-72 w-full">
            {transactions.length === 0 ? (
              <div className="h-full flex items-center justify-center flex-col text-slate-400">
                <HelpCircle className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                <span className="text-xs font-semibold">No records found for this period.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6D5DFC" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6D5DFC" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF5A5F" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#FF5A5F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#A0AEC0" fontSize={10} tickLine={false} />
                  <YAxis stroke="#A0AEC0" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0A0D14", borderRadius: "12px", border: "1px solid #1E293B" }}
                    labelStyle={{ color: "#E2E8F0", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Area type="monotone" dataKey="Income" name="Inflow" stroke="#6D5DFC" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                  <Area type="monotone" dataKey="Expense" name="Outflow" stroke="#FF5A5F" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense Category Allocation Pie Chart */}
        <div className="bg-white border border-[#E9ECF5] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="border-b border-[#E9ECF5] pb-4">
            <h2 className="text-base font-extrabold text-[#0A0D14]">Outflow Allocation</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Top expense categories this period</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center flex-col text-slate-400">
                <HelpCircle className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                <span className="text-xs font-semibold">No expenses recorded.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: "#0A0D14", borderRadius: "12px", border: "1px solid #1E293B", color: "#FFF" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legends & Bullet Lists */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="capitalize">{c.name}</span>
                </div>
                <span className="font-bold text-[#0A0D14]">₹{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audited Transaction Ledger Section */}
      <section className="bg-white border border-[#E9ECF5] rounded-2xl shadow-sm overflow-hidden">
        
        {/* Filter Controls Header */}
        <div className="p-6 border-b border-[#E9ECF5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-[#0A0D14]">Period Statement Ledger</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Auditing {filteredTransactions.length} of {transactions.length} entries</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#F8FAF9] border border-[#E9ECF5] hover:border-slate-300 focus:bg-white px-3 py-2 pl-9 rounded-xl text-xs font-semibold w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 text-slate-700"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-[#E9ECF5] hover:border-slate-300 px-3 py-2 pr-8 rounded-xl text-xs font-bold text-slate-700 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-slate-300 stroke-1 mb-2" />
              <span className="text-xs font-bold">No transactions found matching your criteria.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] text-[10px] text-slate-400 font-extrabold uppercase tracking-widest border-b border-[#E9ECF5]">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Method</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECF5]">
                {filteredTransactions.map(t => {
                  const isCredit = t.type === "INCOME";
                  const isInvestment = t.type === "INVESTMENT" || t.type === "SAVINGS";
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/55 transition-colors group">
                      <td className="py-4 px-6 text-xs text-slate-500 font-semibold whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-[#0A0D14] truncate max-w-xs">{t.title}</div>
                        {t.description && (
                          <div className="text-[10px] text-slate-400 font-semibold truncate max-w-xs mt-0.5">{t.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200/50">
                          {t.categoryId}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-semibold capitalize whitespace-nowrap">
                        {t.paymentMethod.replace("_", " ").toLowerCase()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isCredit 
                            ? "bg-[#00C875]/10 text-[#00C875]" 
                            : isInvestment 
                            ? "bg-[#6D5DFC]/10 text-[#6D5DFC]" 
                            : "bg-rose-50 text-rose-500"
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right text-xs font-black whitespace-nowrap ${
                        isCredit ? "text-[#00C875]" : isInvestment ? "text-[#6D5DFC]" : "text-slate-900"
                      }`}>
                        {isCredit ? "+" : "-"}₹{t.amount.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
