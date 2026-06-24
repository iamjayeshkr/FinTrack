"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LocalStorageTransactionRepository,
  LocalStorageBudgetRepository,
} from "../../infrastructure/db/local-storage-repositories";
import { Transaction } from "../../domain/entities/transaction";
import { Budget } from "../../domain/entities/budget";
import { Money } from "../../domain/value-objects/money";

export default function BudgetsPage() {
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
  }, []);

  const refreshData = async () => {
    const txs = await txRepo.searchTransactions("user1", "");
    const bgs = await bgRepo.findByUserAndMonth("user1", 6, 2026);
    setTransactions(txs);
    setBudgets(bgs);
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgLimit) return;

    const budget = new Budget(
      Math.random().toString(),
      "user1",
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

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Monthly Budgets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Proactive envelope allocations for category spending limit checks.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Forms */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Define Envelope</h3>
            <form onSubmit={handleAddBudget} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Category</label>
                <select
                  value={bgCategory}
                  onChange={(e) => setBgCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Monthly Limit (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={bgLimit}
                  onChange={(e) => setBgLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all text-xs shadow-sm"
              >
                Create Budget Limit
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Indicators */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-800">Envelope Limits Overview</h3>
            <div className="space-y-4">
              {budgets.map(b => {
                const spent = transactions
                  .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE")
                  .reduce((sum, t) => sum + t.amount.amount, 0);

                const percentage = Math.min(Math.round((spent / b.limitAmount.amount) * 100), 100);

                return (
                  <div key={b.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 text-sm">{b.categoryId} Budget</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">
                          ₹{spent} of ₹{b.limitAmount.amount} ({percentage}%)
                        </span>
                        <button
                          onClick={() => handleDeleteBudget(b.id)}
                          className="text-rose-600 hover:text-rose-700 font-semibold ml-2 text-[10px] hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${percentage >= 90 ? "bg-rose-500" : percentage >= 75 ? "bg-amber-500" : "bg-indigo-600"}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {budgets.length === 0 && (
                <div className="text-center text-slate-400 py-12 text-sm">
                  No budgets configured. Define an envelope limit on the left to start.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
