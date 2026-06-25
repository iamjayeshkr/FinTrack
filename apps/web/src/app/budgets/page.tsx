"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LocalStorageTransactionRepository,
  LocalStorageBudgetRepository,
} from "../../infrastructure/db/local-storage-repositories";
import { Transaction } from "../../domain/entities/transaction";
import { Budget } from "../../domain/entities/budget";
import { Money } from "../../domain/value-objects/money";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles,
  Wallet,
  Activity,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Trash2,
  AlertOctagon,
  Percent
} from "lucide-react";

export default function BudgetsPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Form states
  const [bgCategory, setBgCategory] = useState("Food");
  const [bgLimit, setBgLimit] = useState("");

  const categoriesList = ["Rent", "Food", "Transport", "Recharge", "Entertainment", "Shopping", "Health", "Travel", "Miscellaneous"];

  const txRepo = useMemo(() => new LocalStorageTransactionRepository(), []);
  const bgRepo = useMemo(() => new LocalStorageBudgetRepository(), []);

  useEffect(() => {
    refreshData();
  }, [userId]);

  const refreshData = async () => {
    const txs = await txRepo.searchTransactions(userId, "");
    const bgs = await bgRepo.findByUserAndMonth(userId, 6, 2026);
    setTransactions(txs);
    setBudgets(bgs);
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgLimit) return;

    const budget = new Budget(
      crypto.randomUUID(),
      userId,
      bgCategory,
      new Money(parseFloat(bgLimit)),
      6,
      2026
    );

    await bgRepo.save(budget);
    setBgLimit("");
    refreshData();
  };

  const handleDeleteBudget = async (id: string) => {
    await bgRepo.delete(id);
    refreshData();
  };

  // Re-calculate statistics dynamically
  const budgetStats = useMemo(() => {
    const totalAllocated = budgets.reduce((sum, b) => sum + b.limitAmount.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => {
      const categorySpent = transactions
        .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE")
        .reduce((s, t) => s + t.amount.amount, 0);
      return sum + categorySpent;
    }, 0);

    const remaining = Math.max(0, totalAllocated - totalSpent);
    const utilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    const score = Math.max(10, Math.round(100 - (utilization > 100 ? (utilization - 100) * 2 : utilization * 0.5)));

    return {
      totalAllocated,
      totalSpent,
      remaining,
      utilization,
      score
    };
  }, [budgets, transactions]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in select-none">
      
      {/* Header bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E9ECF5] pb-6">
        <div>
          <span className="text-[10px] text-[#6D5DFC] font-extrabold uppercase tracking-widest bg-[#6D5DFC]/5 px-2.5 py-1 rounded-md border border-[#6D5DFC]/10">
            Envelope Planner
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A0D14] tracking-tight mt-3">
            Budget Envelopes
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Configure category spend ceilings, track real-time utilization, and analyze overspend risks.
          </p>
        </div>
      </header>

      {/* Budget KPIs Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm border-l-4 border-l-[#6D5DFC]">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Budgeted</span>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-2">₹{budgetStats.totalAllocated.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Spent to Date</span>
          <h3 className="text-2xl font-black text-[#FF5A5F] tracking-tight mt-2">₹{budgetStats.totalSpent.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Remaining Margin</span>
          <h3 className="text-2xl font-black text-[#00C875] tracking-tight mt-2">₹{budgetStats.remaining.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm relative">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Health Index</span>
            <span className="text-[10px] text-[#00C875] font-black">{budgetStats.score}/100</span>
          </div>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-2">{budgetStats.utilization}% Used</h3>
        </div>
      </section>

      {/* Main Grid: Forms and Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create Budget Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-[#0A0D14]">Configure Envelope</h3>
            
            <form onSubmit={handleAddBudget} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="text-[11px]">Category</label>
                <select
                  value={bgCategory}
                  onChange={(e) => setBgCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                >
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px]">Monthly Ceiling Limit (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="12000"
                  value={bgLimit}
                  onChange={(e) => setBgLimit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white font-extrabold rounded-xl shadow-md shadow-[#6D5DFC]/10 transition-all duration-200 text-xs active:scale-[0.98] cursor-pointer"
              >
                Create Budget Limit
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Indicators overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active envelopes listing */}
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#0A0D14]">Active Envelope Allocations</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgets.map(b => {
                const spent = transactions
                  .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE")
                  .reduce((sum, t) => sum + t.amount.amount, 0);

                const limitVal = b.limitAmount.amount;
                const percentage = Math.min(Math.round((spent / limitVal) * 100), 100);
                const isOverspent = spent > limitVal;

                return (
                  <div key={b.id} className="p-4 bg-[#F7F8FC]/50 border border-[#E9ECF5] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#6D5DFC]/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Category</span>
                        <h4 className="text-sm font-extrabold text-[#0A0D14] mt-0.5">{b.categoryId}</h4>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteBudget(b.id)}
                        className="text-slate-400 hover:text-[#FF5A5F] p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Envelope"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-2 bg-[#E9ECF5] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverspent ? "bg-[#FF5A5F]" : percentage >= 85 ? "bg-[#FFB020]" : "bg-[#6D5DFC]"
                          }`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Used: ₹{spent.toLocaleString()}</span>
                        <span>Ceiling: ₹{limitVal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E9ECF5]">
                      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase">
                        {isOverspent ? (
                          <>
                            <AlertOctagon className="w-3.5 h-3.5 text-[#FF5A5F]" />
                            <span className="text-[#FF5A5F]">Ceiling Breached</span>
                          </>
                        ) : percentage >= 85 ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-[#FFB020]" />
                            <span className="text-[#FFB020]">Overspend Risk</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-[#00C875]" />
                            <span className="text-[#00C875]">On Track</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-slate-500">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
              
              {budgets.length === 0 && (
                <div className="col-span-2 text-center text-slate-400 py-12 text-xs font-semibold">
                  No budgets configured. Define an envelope limit on the left to start.
                </div>
              )}
            </div>
          </div>

          {/* AI Auditing Recommendation Box */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border-l-4 border-l-[#00C875] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C875]" />
              <h3 className="text-xs font-extrabold text-[#0A0D14] uppercase tracking-wider">AI Budget Optimization</h3>
            </div>
            <p className="text-xs text-slate-500 leading-normal font-semibold">
              Based on historical Swiggy/Zomato orders, your **Food** budget is projected to end at 98% utilization this month. We recommend raising your Food ceiling by **₹1,500** to absorb discretionary order variations or turning on smart alerts to throttle dining transactions after 80% utilization.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
