"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TransactionUseCase } from "../../application/services/transaction-usecase";
import {
  LocalStorageTransactionRepository,
  LocalStorageBudgetRepository,
  LocalStorageGoalRepository,
} from "../../infrastructure/db/local-storage-repositories";
import { Transaction, TransactionType, PaymentMethod } from "../../domain/entities/transaction";
import { Goal } from "../../domain/entities/goal";
import { Money } from "../../domain/value-objects/money";
import { INotificationService } from "../../application/ports/notification-service";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");

  // Form states
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<TransactionType>("EXPENSE");
  const [txCategory, setTxCategory] = useState("Food");
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>("UPI");
  const [txGoalId, setTxGoalId] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit states for inline editing
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<TransactionType>("EXPENSE");
  const [editCategory, setEditCategory] = useState("Food");
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>("UPI");
  const [editDate, setEditDate] = useState("");

  const categoriesList = {
    INCOME: ["Salary", "Freelance", "Refund", "Family Transfer"],
    EXPENSE: ["Rent", "Food", "Transport", "Recharge", "Entertainment", "Shopping", "Health", "Travel", "Miscellaneous"],
    SAVINGS: ["Emergency Fund", "FD", "Gold"],
    INVESTMENT: ["Mutual Funds", "SIP"],
    TRANSFER: ["Wallet Link"],
  };

  const txRepo = useMemo(() => new LocalStorageTransactionRepository(), []);
  const bgRepo = useMemo(() => new LocalStorageBudgetRepository(), []);
  const glRepo = useMemo(() => new LocalStorageGoalRepository(), []);

  const notifyService = useMemo<INotificationService>(() => ({
    notifyBudgetBreach: async () => {},
    notifyGoalMilestone: async () => {},
    notifyRecurringTransactionAlert: async () => {},
  }), []);

  const txUseCase = useMemo(() => new TransactionUseCase(txRepo, bgRepo, glRepo, notifyService), [txRepo, bgRepo, glRepo, notifyService]);

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
    const txs = await txRepo.searchTransactions("user1", "");
    const gls = await glRepo.findByUserId("user1");
    setTransactions(txs.sort((a, b) => b.date.getTime() - a.date.getTime()));
    setGoals(gls);
  };

  const handleExportCSV = () => {
    if (currentPlan === "free") {
      alert("Pro Feature: CSV Export is only available to FinTrack Pro subscribers. Please upgrade your plan in the Billing tab!");
      return;
    }
    
    const headers = ["Date", "Title", "Category", "Type", "Payment Method", "Amount (INR)"];
    const rows = transactions.map(t => [
      new Date(t.date).toISOString().split("T")[0],
      `"${t.title.replace(/"/g, '""')}"`,
      t.categoryId,
      t.type,
      t.paymentMethod,
      t.amount.amount
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fintrack_ledger_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    if (currentPlan === "free" && transactions.length >= 5) {
      alert("Pro Feature: You have reached the Free Plan limit of 5 transactions. Please upgrade to FinTrack Pro to insert unlimited entries!");
      return;
    }

    try {
      await txUseCase.executeCreate({
        userId: "user1",
        categoryId: txCategory,
        goalId: txGoalId || undefined,
        title: txTitle,
        description: txDescription,
        amount: parseFloat(txAmount),
        currency: "INR",
        type: txType,
        paymentMethod: txPaymentMethod,
        date: new Date(txDate),
      });

      setTxTitle("");
      setTxAmount("");
      setTxDescription("");
      setTxGoalId("");
      setTxDate(new Date().toISOString().split("T")[0]);
      refreshData();
    } catch (err: any) {
      alert(err.message || "Failed to create transaction");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    await txRepo.delete(id);
    refreshData();
  };

  const startEditing = (t: Transaction) => {
    setEditingTxId(t.id);
    setEditTitle(t.title);
    setEditAmount(t.amount.amount.toString());
    setEditType(t.type);
    setEditCategory(t.categoryId);
    setEditPaymentMethod(t.paymentMethod);
    setEditDate(new Date(t.date).toISOString().split("T")[0]);
  };

  const cancelEditing = () => {
    setEditingTxId(null);
  };

  const saveEditing = async (t: Transaction) => {
    if (!editTitle || !editAmount) return;
    try {
      const updatedTx = new Transaction(
        t.id,
        t.userId,
        editCategory,
        editTitle,
        new Money(parseFloat(editAmount)),
        editType,
        editPaymentMethod,
        new Date(editDate),
        t.description,
        t.goalId,
        t.tags,
        t.location,
        t.attachments,
        t.createdAt,
        new Date()
      );
      await txRepo.save(updatedTx);
      setEditingTxId(null);
      refreshData();
    } catch (err: any) {
      alert(err.message || "Failed to update transaction");
    }
  };

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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Transactions History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, filter, and log financial ledger entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 w-64 shadow-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Logger Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Log Transaction</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Starbucks Coffee"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Date</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Type</label>
                  <select
                    value={txType}
                    onChange={(e) => {
                      const type = e.target.value as TransactionType;
                      setTxType(type);
                      setTxCategory(categoriesList[type][0]);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {categoriesList[txType].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Payment</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank</option>
                  </select>
                </div>
              </div>

              {(txType === "SAVINGS" || txType === "INVESTMENT") && goals.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Link to Goal</label>
                  <select
                    value={txGoalId}
                    onChange={(e) => setTxGoalId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">No goal linkage</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {currentPlan === "free" && transactions.length >= 5 && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs leading-normal">
                  <strong>Free limit reached (5/5).</strong> Please <Link href="/billing" className="font-bold underline hover:text-rose-800">upgrade to PRO</Link> to log unlimited transactions.
                </div>
              )}

              <button
                type="submit"
                disabled={currentPlan === "free" && transactions.length >= 5}
                className={`w-full py-2.5 font-semibold rounded-lg shadow-sm transition-all text-xs ${
                  currentPlan === "free" && transactions.length >= 5
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                Insert Ledger Entry
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Table */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Ledger History</h3>
              <div className="flex items-center gap-3">
                {currentPlan === "free" && (
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-semibold px-2 py-0.5 rounded-full select-none">
                    Limit: {transactions.length}/5 entries
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-sm relative group"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                  {currentPlan === "free" && (
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-extrabold text-[7px] px-1 rounded-full border border-white">
                      PRO
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Title</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Method</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => {
                    const isEditing = editingTxId === t.id;
                    if (isEditing) {
                      return (
                        <tr key={t.id} className="border-b border-indigo-100 bg-indigo-50/20">
                          <td className="py-2 pr-2">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full min-w-[100px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {categoriesList[editType].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={editType}
                              onChange={(e) => {
                                const newType = e.target.value as TransactionType;
                                setEditType(newType);
                                setEditCategory(categoriesList[newType][0]);
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="EXPENSE">Expense</option>
                              <option value="INCOME">Income</option>
                              <option value="SAVINGS">Savings</option>
                              <option value="INVESTMENT">Investment</option>
                            </select>
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={editPaymentMethod}
                              onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="UPI">UPI</option>
                              <option value="CARD">Card</option>
                              <option value="CASH">Cash</option>
                              <option value="BANK_TRANSFER">Bank</option>
                            </select>
                          </td>
                          <td className="py-2 pr-2 text-right">
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 text-[11px] font-semibold text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="py-2 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => saveEditing(t)}
                              className="text-emerald-600 hover:text-emerald-700 font-semibold px-1.5 py-0.5 hover:bg-emerald-50 rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-slate-500 hover:text-slate-700 font-semibold px-1.5 py-0.5 hover:bg-slate-100 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-500 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 font-semibold text-slate-800">{t.title}</td>
                        <td className="py-3 text-slate-500">{t.categoryId}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.type === "INCOME" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            t.type === "EXPENSE" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{t.paymentMethod}</td>
                        <td className="py-3 text-right font-semibold text-slate-900">₹{t.amount.amount.toLocaleString()}</td>
                        <td className="py-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => startEditing(t)}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold px-1.5 py-0.5 hover:bg-indigo-50 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-rose-600 hover:text-rose-700 font-semibold px-1.5 py-0.5 hover:bg-rose-55 hover:bg-rose-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
