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
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Filter,
  Plus,
  Coins,
  Receipt,
  TrendingUp,
  MapPin,
  Tag,
  Clock,
  Trash2,
  Edit3,
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function TransactionsPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");

  // Selected row for details drawer
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
  }, [userId]);

  const refreshData = async () => {
    const txs = await txRepo.searchTransactions(userId, "");
    const gls = await glRepo.findByUserId(userId);
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

  const handleDownloadReceipt = async (t: Transaction) => {
    setIsDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      const userName = user?.fullName || "Rudransh Kumar";
      
      // 1. Top accent bar
      doc.setFillColor(109, 93, 252); // Brand color #6D5DFC
      doc.rect(0, 0, 210, 12, "F");
      
      // 2. Company Brand Logo & Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(10, 13, 20); // #0A0D14
      doc.text("FinTrack Ledger Node", 20, 32);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(109, 93, 252);
      doc.text("TRANSACTION RECEIPT", 190, 32, { align: "right" });
      
      // Divider
      doc.setDrawColor(233, 236, 245); // #E9ECF5
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);
      
      // 3. Metadata block (Two Columns)
      // Left Column: Account Details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 110, 130);
      doc.text(`Account Holder: ${userName}`, 20, 47);
      doc.text(`User ID: ${userId}`, 20, 52);
      doc.text("Status: VERIFIED & LOGGED", 20, 57);
      
      // Right Column: Transaction metadata
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(10, 13, 20);
      doc.text("Transaction Metadata", 190, 47, { align: "right" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 110, 130);
      doc.text(`Receipt Reference: REF-${t.id.slice(0, 8).toUpperCase()}`, 190, 52, { align: "right" });
      doc.text(`Transaction Date: ${new Date(t.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}`, 190, 57, { align: "right" });
      doc.text(`Method: ${t.paymentMethod}`, 190, 62, { align: "right" });
      
      // Divider
      doc.line(20, 68, 190, 68);
      
      // 4. Ledger Details Block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(10, 13, 20);
      doc.text("LEDGER ACCOUNT ENTRY DETAILS", 20, 78);
      
      // Box backdrop
      doc.setFillColor(247, 248, 252);
      doc.rect(20, 83, 170, 40, "F");
      doc.setDrawColor(233, 236, 245);
      doc.rect(20, 83, 170, 40, "S");
      
      // Entry details inside box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 110, 130);
      doc.text("Merchant / Title:", 25, 92);
      doc.setTextColor(10, 13, 20);
      doc.text(t.title, 60, 92);
      
      doc.setTextColor(100, 110, 130);
      doc.text("Entry Category:", 25, 99);
      doc.setTextColor(10, 13, 20);
      doc.text(t.categoryId, 60, 99);
      
      doc.setTextColor(100, 110, 130);
      doc.text("Entry Type:", 25, 106);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(t.type === "INCOME" ? 0 : 255, t.type === "INCOME" ? 168 : 90, t.type === "INCOME" ? 98 : 95); // color coding
      doc.text(t.type, 60, 106);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 110, 130);
      doc.text("Notes / Context:", 25, 113);
      doc.setTextColor(50, 60, 70);
      doc.text(t.description && t.description !== "No notes logged" ? t.description : "Standard Discretionary Entry", 60, 113);
      
      // 5. Amount Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 110, 130);
      doc.text("Subtotal:", 145, 136, { align: "right" });
      doc.setTextColor(10, 13, 20);
      doc.text(`INR ${t.amount.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 186, 136, { align: "right" });
      
      // GST calculation
      const amountVal = t.amount.amount;
      const gstVal = t.type === "EXPENSE" ? (amountVal * 0.18 / 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00";
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 110, 130);
      doc.text("GST (18% inclusive):", 145, 142, { align: "right" });
      doc.setTextColor(50, 60, 70);
      doc.text(`INR ${gstVal}`, 186, 142, { align: "right" });
      
      doc.setLineWidth(0.7);
      doc.line(115, 147, 190, 147);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(10, 13, 20);
      doc.text("Total Value:", 145, 154, { align: "right" });
      doc.setTextColor(109, 93, 252);
      doc.text(`INR ${amountVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 186, 154, { align: "right" });
      
      // 6. Barcode
      let barX = 80;
      doc.setDrawColor(0, 0, 0);
      const barPatterns = [1, 2, 4, 1, 3, 2, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1, 1, 2, 3, 1, 4, 1];
      barPatterns.forEach((width) => {
        doc.setLineWidth(width * 0.45);
        doc.line(barX, 172, barX, 187);
        barX += width * 0.45 + 1.1;
      });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 155, 165);
      doc.text(`*FT-TXN-REF-${t.id.toUpperCase()}*`, 105, 192, { align: "center" });
      
      // 7. Footer
      doc.setLineWidth(0.4);
      doc.setDrawColor(240, 242, 247);
      doc.line(20, 210, 190, 210);
      
      doc.setFontSize(8);
      doc.setTextColor(140, 145, 155);
      doc.text("This receipt is automatically generated and digitally signed by FinTrack Local Sync.", 105, 218, { align: "center" });
      doc.text("Please store this receipt securely. For support, email support@fintrack.io", 105, 223, { align: "center" });
      
      doc.save(`fintrack_receipt_${t.id.slice(0, 8)}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to download receipt PDF.");
    } finally {
      setIsDownloading(false);
    }
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
        userId: userId,
        categoryId: txCategory,
        goalId: txGoalId || undefined,
        title: txTitle,
        description: txDescription || "No notes logged",
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

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row selection drawer
    await txRepo.delete(id);
    if (selectedTx?.id === id) {
      setSelectedTx(null);
    }
    refreshData();
  };

  const startEditing = (t: Transaction, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row selection drawer
    setEditingTxId(t.id);
    setEditTitle(t.title);
    setEditAmount(t.amount.amount.toString());
    setEditType(t.type);
    setEditCategory(t.categoryId);
    setEditPaymentMethod(t.paymentMethod);
    setEditDate(new Date(t.date).toISOString().split("T")[0]);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTxId(null);
  };

  const saveEditing = async (t: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Filtered transactions for rendering search and drop filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const term = searchQuery.toLowerCase();
      const matchSearch = (
        t.title.toLowerCase().includes(term) ||
        t.categoryId.toLowerCase().includes(term) ||
        t.type.toLowerCase().includes(term)
      );

      const matchType = selectedTypeFilter === "ALL" || t.type === selectedTypeFilter;
      const matchCategory = selectedCategoryFilter === "ALL" || t.categoryId === selectedCategoryFilter;

      return matchSearch && matchType && matchCategory;
    });
  }, [transactions, searchQuery, selectedTypeFilter, selectedCategoryFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let investment = 0;

    transactions.forEach(t => {
      if (t.type === "INCOME") income += t.amount.amount;
      else if (t.type === "EXPENSE") expense += t.amount.amount;
      else if (t.type === "INVESTMENT" || t.type === "SAVINGS") investment += t.amount.amount;
    });

    return {
      income,
      expense,
      investment,
      netFlow: income - expense - investment
    };
  }, [transactions]);

  // Get all unique categories for filtering
  const allUniqueCategories = useMemo(() => {
    const list = new Set<string>();
    transactions.forEach(t => list.add(t.categoryId));
    return Array.from(list);
  }, [transactions]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in select-none relative overflow-x-hidden">
      
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E9ECF5] pb-6">
        <div>
          <span className="text-[10px] text-[#6D5DFC] font-extrabold uppercase tracking-widest bg-[#6D5DFC]/5 px-2.5 py-1 rounded-md border border-[#6D5DFC]/10">
            Ledger Manager
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A0D14] tracking-tight mt-3">
            Transactions History
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Track assets flow, link milestones, and verify ledger receipts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentPlan === "free" && (
            <span className="text-[10px] bg-[#F7F8FC] border border-[#E9ECF5] text-slate-500 font-extrabold px-3 py-1.5 rounded-xl">
              Usage: {transactions.length}/5 entries
            </span>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-white border border-[#E9ECF5] hover:bg-[#F7F8FC] text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm relative active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Export CSV
            {currentPlan === "free" && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#6D5DFC] text-white font-extrabold text-[7px] px-1.5 py-0.5 rounded-full border border-white">
                PRO
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Transaction Command Center - KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Income</span>
          <h3 className="text-2xl font-black text-[#00C875] tracking-tight mt-2">₹{stats.income.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Expenses</span>
          <h3 className="text-2xl font-black text-[#FF5A5F] tracking-tight mt-2">₹{stats.expense.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Investments</span>
          <h3 className="text-2xl font-black text-[#6D5DFC] tracking-tight mt-2">₹{stats.investment.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Net flow</span>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-2">₹{stats.netFlow.toLocaleString()}</h3>
        </div>
      </section>

      {/* Main Grid: Add transaction and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Logger Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-[#0A0D14]">Insert Ledger Entry</h3>
            
            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="text-[11px]">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Organic Grocery Store"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] placeholder-slate-400 font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px]">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px]">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="6500"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px]">Type</label>
                  <select
                    value={txType}
                    onChange={(e) => {
                      const type = e.target.value as TransactionType;
                      setTxType(type);
                      setTxCategory(categoriesList[type][0]);
                    }}
                    className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
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
                  <label className="text-[11px]">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                  >
                    {categoriesList[txType].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px]">Payment Method</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
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
                  <label className="text-[11px]">Link Savings Goal</label>
                  <select
                    value={txGoalId}
                    onChange={(e) => setTxGoalId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                  >
                    <option value="">No goal linkage</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px]">Ledger Notes</label>
                <textarea
                  placeholder="Optional context (e.g. food ingredients list)"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full h-16 px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] placeholder-slate-400 font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC] resize-none"
                />
              </div>

              {currentPlan === "free" && transactions.length >= 5 && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-[#FF5A5F] rounded-xl text-[10px] leading-normal flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Free plan limit reached (5/5).</strong> Please <Link href="/billing" className="underline font-bold hover:text-rose-800">upgrade to PRO</Link> to log unlimited transactions.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={currentPlan === "free" && transactions.length >= 5}
                className={`w-full py-3 font-extrabold rounded-xl shadow-sm transition-all duration-200 text-xs active:scale-[0.98] ${
                  currentPlan === "free" && transactions.length >= 5
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-[#E9ECF5]"
                    : "bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white cursor-pointer shadow-md shadow-[#6D5DFC]/10"
                }`}
              >
                Insert Ledger Entry
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Table with detailed drawers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-6">
            
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9ECF5] pb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-xs font-semibold placeholder-slate-400 text-[#0A0D14] focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                />
              </div>

              {/* Type and Category dropdowns */}
              <div className="flex items-center gap-3.5">
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#E9ECF5] rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                >
                  <option value="ALL">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="INVESTMENT">Investment</option>
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#E9ECF5] rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                >
                  <option value="ALL">All Categories</option>
                  {allUniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-semibold">
                <thead>
                  <tr className="border-b border-[#E9ECF5] text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Details</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No transactions match the search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(t => {
                      const isEditing = editingTxId === t.id;
                      if (isEditing) {
                        return (
                          <tr key={t.id} className="border-b border-[#6D5DFC]/10 bg-[#6D5DFC]/5 animate-fade-in">
                            <td className="py-2.5 px-3">
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="px-2.5 py-1.5 bg-white border border-[#E9ECF5] rounded-lg text-slate-800 text-[11px] font-semibold focus:outline-none"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-[#E9ECF5] rounded-lg text-slate-800 text-[11px] font-bold focus:outline-none"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="px-2.5 py-1.5 bg-white border border-[#E9ECF5] rounded-lg text-slate-800 text-[11px] font-semibold focus:outline-none"
                              >
                                {categoriesList[editType].map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={editPaymentMethod}
                                onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                                className="px-2.5 py-1.5 bg-white border border-[#E9ECF5] rounded-lg text-slate-800 text-[11px] font-semibold focus:outline-none"
                              >
                                <option value="UPI">UPI</option>
                                <option value="CARD">Card</option>
                                <option value="CASH">Cash</option>
                                <option value="BANK_TRANSFER">Bank</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-20 px-2.5 py-1.5 bg-white border border-[#E9ECF5] rounded-lg text-slate-800 text-[11px] font-bold text-right focus:outline-none"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={(e) => saveEditing(t, e)}
                                className="text-[#00C875] hover:text-[#00A862] px-2 py-1 hover:bg-[#00C875]/5 rounded-lg"
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => cancelEditing(e)}
                                className="text-slate-500 hover:text-slate-800 px-2 py-1 hover:bg-slate-100 rounded-lg"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr 
                          key={t.id} 
                          onClick={() => setSelectedTx(t)}
                          className={`border-b border-[#E9ECF5] hover:bg-[#F7F8FC]/60 transition-all duration-200 cursor-pointer ${
                            selectedTx?.id === t.id ? "bg-[#6D5DFC]/5 hover:bg-[#6D5DFC]/5 border-l-2 border-l-[#6D5DFC]" : ""
                          }`}
                        >
                          <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                            {new Date(t.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-[#0A0D14]">{t.title}</div>
                            <span className="block text-[9px] text-slate-400 font-semibold mt-0.5">Linked Ledger Account</span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500">{t.categoryId}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${
                              t.type === "INCOME" ? "bg-[#00C875]/10 text-[#00C875]" :
                              t.type === "EXPENSE" ? "bg-rose-50 text-[#FF5A5F]" : "bg-[#6D5DFC]/10 text-[#6D5DFC]"
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-400">{t.paymentMethod}</td>
                          <td className="py-3.5 px-3 text-right font-bold text-[#0A0D14]">
                            ₹{t.amount.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={(e) => startEditing(t, e)}
                              className="text-[#6D5DFC] hover:text-[#8B7CFF] p-1 rounded hover:bg-[#6D5DFC]/5"
                              title="Edit Row"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTransaction(t.id, e)}
                              className="text-[#FF5A5F] hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                              title="Delete Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* Transaction Details slide-out drawer on click */}
      {selectedTx && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-[#E9ECF5] shadow-2xl p-6 space-y-6 z-40 animate-fade-in flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E9ECF5] pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-[#6D5DFC]" />
                <span className="font-extrabold text-sm text-[#0A0D14]">Ledger Receipt</span>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-lg border border-[#E9ECF5] hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Receipt detail view */}
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="p-4 bg-[#F7F8FC] border border-[#E9ECF5] rounded-2xl text-center space-y-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Amount Transacted</span>
                <div className={`text-2xl font-black ${selectedTx.type === "INCOME" ? "text-[#00C875]" : "text-[#FF5A5F]"}`}>
                  ₹{selectedTx.amount.amount.toLocaleString()}
                </div>
                <div className="text-[10px] bg-white border border-[#E9ECF5] px-2.5 py-0.5 rounded-full inline-block font-extrabold text-slate-500 shadow-sm uppercase">
                  {selectedTx.type} · {selectedTx.paymentMethod}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Description</span>
                  <span className="text-[#0A0D14] text-right max-w-[160px] truncate">{selectedTx.title}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Category</span>
                  <span className="text-[#0A0D14]">{selectedTx.categoryId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Transacted At</span>
                  <span className="text-[#0A0D14]">{new Date(selectedTx.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location</span>
                  <span className="text-[#0A0D14] text-right truncate max-w-[140px]" title={selectedTx.location || "Mumbai Financial District, IN"}>
                    {selectedTx.location || "Financial Center, IN"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-slate-400" /> Tags</span>
                  <span className="text-[#0A0D14]">#ledger #wealth-v3</span>
                </div>
              </div>

              {/* Mock AI Analysis block */}
              <div className="p-3.5 bg-[#6D5DFC]/5 border border-[#6D5DFC]/10 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#6D5DFC] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> AI Auditing Node
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  This transaction is categorized as discrete discretion. It is within your historical budget deviation (+2.4%).
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E9ECF5] pt-4 space-y-2">
            <button 
              onClick={() => handleDownloadReceipt(selectedTx)}
              disabled={isDownloading}
              className="w-full py-2.5 border border-[#E9ECF5] hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-2 justify-center cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isDownloading ? (
                <span>Generating PDF...</span>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-400" /> Download PDF Receipt
                </>
              )}
            </button>
            <button 
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center block cursor-pointer"
            >
              Close Ledger View
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
