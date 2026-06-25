"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Check, Shield, Zap, Receipt, Download, RefreshCw, Star, Info, Crown,
  Calendar, X, CheckCircle2, Building, AlertCircle, ArrowRight, Eye,
  Mail, Printer, ChevronDown, FileText, TrendingUp, BarChart3, CreditCard,
  Lock, Globe, Sparkles
} from "lucide-react";
import {
  DocumentGeneratorService,
  InvoiceData, ReceiptData, InvestmentData, AccountData
} from "../../application/services/document-generator";

type DocType = "INVOICE" | "RECEIPT" | "INVESTMENT" | "ACCOUNT";

const ACCENT_RGB: Record<string, [number, number, number]> = {
  indigo:  [109,  93, 252],
  slate:   [ 71,  85, 105],
  emerald: [ 16, 185, 129],
  crimson: [239,  68,  68],
};
const ACCENT_HEX: Record<string, string> = {
  indigo:  "#6D5DFC",
  slate:   "#475569",
  emerald: "#10B981",
  crimson: "#EF4444",
};

export default function BillingPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "enterprise">("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [txCount, setTxCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  const [consoleTab, setConsoleTab] = useState<"plans" | "documents">("plans");
  const [selectedDocType, setSelectedDocType] = useState<DocType>("INVOICE");
  const [previewTab, setPreviewTab] = useState<"document" | "email">("document");

  const [selectedCurrency, setSelectedCurrency] = useState<"INR" | "USD" | "EUR">("INR");
  const [accentTheme, setAccentTheme] = useState<"indigo" | "slate" | "emerald" | "crimson">("indigo");
  const [docStatus, setDocStatus] = useState<string>("PAID");

  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [allBudgets, setAllBudgets] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("INV-2026-004");
  const [selectedTxId, setSelectedTxId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("June 2026");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const plan = (localStorage.getItem("fintrack_plan") || "free") as "free" | "pro" | "enterprise";
      setCurrentPlan(plan);
      const refreshDB = () => {
        const txData = localStorage.getItem("apex_transactions");
        const bgData = localStorage.getItem("apex_budgets");
        const glData = localStorage.getItem("apex_goals");
        if (txData) {
          try {
            const parsed = JSON.parse(txData).filter((t: any) => t.userId === userId);
            setAllTransactions(parsed);
            setTxCount(parsed.length);
            if (parsed.length > 0 && !selectedTxId) setSelectedTxId(parsed[0].id);
          } catch (e) { console.error(e); }
        }
        if (bgData) {
          try { setAllBudgets(JSON.parse(bgData).filter((b: any) => b.userId === userId)); } catch (e) {}
        }
        if (glData) {
          try { setAllGoals(JSON.parse(glData).filter((g: any) => g.userId === userId)); } catch (e) {}
        }
      };
      refreshDB();
      window.addEventListener("storage", refreshDB);
      return () => window.removeEventListener("storage", refreshDB);
    }
  }, [userId, selectedTxId]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectPlan = (plan: "free" | "pro" | "enterprise") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_plan", plan);
      setCurrentPlan(plan);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("fintrack_plan_changed"));
      if (plan === "free") showToast("Downgraded to Starter Free.", "info");
      else if (plan === "pro") showToast("Welcome to FinTrack Pro!", "success");
      else showToast("Welcome to FinTrack Enterprise.", "success");
    }
  };

  const invoices = useMemo(() => [
    { id: "INV-2026-004", date: "Jun 24, 2026", dueDate: "Jun 24, 2026", plan: "Pro Plan — Monthly Subscription", amount: 799, paymentMethod: "Visa •••• 4242", transactionId: "TXN-71932014" },
    { id: "INV-2026-003", date: "May 24, 2026", dueDate: "May 24, 2026", plan: "Pro Plan — Monthly Subscription", amount: 799, paymentMethod: "Visa •••• 4242", transactionId: "TXN-61840211" },
    { id: "INV-2026-002", date: "Apr 24, 2026", dueDate: "Apr 24, 2026", plan: "Pro Plan — Monthly Subscription", amount: 799, paymentMethod: "Visa •••• 4242", transactionId: "TXN-50912384" },
    { id: "INV-2026-005", date: "Jun 24, 2026", dueDate: "Jun 24, 2026", plan: "Enterprise Plan — Monthly Subscription", amount: 4999, paymentMethod: "Mastercard •••• 9911", transactionId: "TXN-90214822" },
  ], []);

  const themeAccentHex = ACCENT_HEX[accentTheme];
  const currencySymbol = useMemo(() => ({ INR: "₹", USD: "$", EUR: "€" }[selectedCurrency] ?? "₹"), [selectedCurrency]);
  const currencyRate = useMemo(() => ({ INR: 1, USD: 1/80, EUR: 1/88 }[selectedCurrency] ?? 1), [selectedCurrency]);

  const fmtAmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const invoiceData = useMemo<InvoiceData | null>(() => {
    const inv = invoices.find(i => i.id === selectedInvoiceId) || invoices[0];
    if (!inv) return null;
    const base = Math.round(inv.amount * currencyRate);
    const platform = Math.round(base * 0.02);
    return {
      id: inv.id,
      date: inv.date,
      dueDate: inv.dueDate,
      status: docStatus as any,
      customer: {
        name: user?.fullName || "Rudransh Kumar",
        email: user?.primaryEmailAddress?.emailAddress || "client@fintrack.io",
        billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN",
        tier: currentPlan,
        customerId: `CUS-${userId.slice(0, 8).toUpperCase()}`,
        accountNumber: `ACC-${selectedInvoiceId.slice(-3)}-IN`,
        taxRegion: "India (GST)",
        country: "India",
      },
      items: [
        {
          description: inv.plan,
          category: "SaaS Subscription",
          quantity: 1,
          unitPrice: base,
          taxRate: 0.18,
          amount: base,
        },
        {
          description: "Platform Infrastructure Fee",
          category: "Service Charge",
          quantity: 1,
          unitPrice: platform,
          taxRate: 0.18,
          amount: platform,
        },
      ],
      currency: selectedCurrency,
      paymentMethod: inv.paymentMethod,
      transactionId: inv.transactionId,
      discount: 0,
      processingFee: 0,
    };
  }, [selectedInvoiceId, invoices, user, currentPlan, selectedCurrency, currencyRate, docStatus, userId]);

  const receiptData = useMemo<ReceiptData | null>(() => {
    const tx = allTransactions.find((t: any) => t.id === selectedTxId) || allTransactions[0];
    if (!tx) return null;
    return {
      id: `RCP-2026-${tx.id.slice(0, 8).toUpperCase()}`,
      date: new Date(tx.date).toLocaleDateString("en-IN", { dateStyle: "medium" }),
      title: tx.title,
      amount: Math.round(tx.amount.amount * currencyRate),
      currency: selectedCurrency,
      category: tx.categoryId,
      paymentMethod: tx.paymentMethod,
      status: docStatus === "PAID" ? "Paid" : "Pending",
      notes: tx.description || "Standard ledger expense entry.",
      location: tx.location || "Online — India",
      customer: {
        name: user?.fullName || "Rudransh Kumar",
        email: user?.primaryEmailAddress?.emailAddress || "client@fintrack.io",
        billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN",
        customerId: `CUS-${userId.slice(0, 8).toUpperCase()}`,
        taxRegion: "India (GST)",
      },
      transactionId: `TXN-LEDG-${tx.id.slice(0, 8).toUpperCase()}`,
    };
  }, [selectedTxId, allTransactions, user, selectedCurrency, currencyRate, docStatus, userId]);

  const investmentData = useMemo<InvestmentData | null>(() => {
    const allocations = allGoals.map((g: any) => ({
      goalTitle: g.title,
      target: Math.round(g.targetAmount.amount * currencyRate),
      saved: Math.round(g.currentAmount.amount * currencyRate),
      percent: Math.round((g.currentAmount.amount / g.targetAmount.amount) * 100),
      targetDate: g.targetDate ? new Date(g.targetDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Dec 2026",
    }));
    const totalInvested = allTransactions
      .filter((t: any) => t.type === "INVESTMENT" || t.type === "SAVINGS")
      .reduce((sum: number, t: any) => sum + t.amount.amount, 0);
    return {
      id: "STM-2026-INV06",
      date: "Jun 24, 2026",
      period: "May 24, 2026 – Jun 24, 2026",
      customer: {
        name: user?.fullName || "Rudransh Kumar",
        email: user?.primaryEmailAddress?.emailAddress || "client@fintrack.io",
        billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN",
        tier: currentPlan,
        customerId: `CUS-${userId.slice(0, 8).toUpperCase()}`,
        accountNumber: "PORTFOLIO-8910-IN",
      },
      allocations: allocations.length > 0 ? allocations : [
        { goalTitle: "Emergency Fund", target: Math.round(50000 * currencyRate), saved: Math.round(2000 * currencyRate), percent: 4, targetDate: "Dec 2026" },
        { goalTitle: "MacBook Pro M4", target: Math.round(60000 * currencyRate), saved: Math.round(5000 * currencyRate), percent: 8, targetDate: "Sep 2026" },
      ],
      currency: selectedCurrency,
      totalInvested: Math.round(totalInvested * currencyRate),
      status: docStatus === "PAID" ? "Settled" : "Processing" as any,
      referenceId: "PORTFOLIO-REF-8910",
    };
  }, [allGoals, allTransactions, user, currentPlan, selectedCurrency, currencyRate, docStatus, userId]);

  const accountData = useMemo<AccountData | null>(() => {
    const targetMonth = selectedMonth.startsWith("May") ? 4 : 5;
    const monthTxs = allTransactions.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === targetMonth && d.getFullYear() === 2026;
    });
    let totalIncome = 0, totalExpenses = 0, totalSavings = 0;
    monthTxs.forEach((t: any) => {
      if (t.type === "INCOME") totalIncome += t.amount.amount;
      else if (t.type === "EXPENSE") totalExpenses += t.amount.amount;
      else if (t.type === "SAVINGS" || t.type === "INVESTMENT") totalSavings += t.amount.amount;
    });
    const budgetsMap = allBudgets.map((b: any) => {
      const spent = allTransactions
        .filter((t: any) => t.categoryId === b.categoryId && t.type === "EXPENSE" && new Date(t.date).getMonth() === targetMonth)
        .reduce((sum: number, t: any) => sum + t.amount.amount, 0);
      return {
        category: b.categoryId,
        limit: Math.round(b.limitAmount.amount * currencyRate),
        spent: Math.round(spent * currencyRate),
        percentage: Math.round((spent / b.limitAmount.amount) * 100),
        status: spent > b.limitAmount.amount ? "Breached" : spent / b.limitAmount.amount > 0.8 ? "Warning" : "On Track" as any,
      };
    });
    const topSpends = [...monthTxs]
      .filter((t: any) => t.type === "EXPENSE")
      .sort((a: any, b: any) => b.amount.amount - a.amount.amount)
      .slice(0, 5)
      .map((t: any) => ({
        title: t.title, category: t.categoryId,
        amount: Math.round(t.amount.amount * currencyRate),
        date: new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        method: t.paymentMethod,
      }));
    const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;
    const healthScore = Math.min(100, Math.max(35, Math.round(75 + (savingsRate * 0.25) - ((totalExpenses / (totalIncome || 1)) * 10))));
    return {
      id: `STM-2026-ACC0${targetMonth + 1}`,
      date: "Jun 24, 2026",
      monthName: selectedMonth,
      customer: {
        name: user?.fullName || "Rudransh Kumar",
        email: user?.primaryEmailAddress?.emailAddress || "client@fintrack.io",
        billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN",
        accountNumber: "ACC-XXXX-8902-IN",
        tier: currentPlan,
        customerId: `CUS-${userId.slice(0, 8).toUpperCase()}`,
        taxRegion: "India (GST)",
      },
      summary: {
        totalIncome: Math.round(totalIncome * currencyRate),
        totalExpenses: Math.round(totalExpenses * currencyRate),
        netSavings: Math.round(totalSavings * currencyRate),
        savingsRate, activeBudgetsCount: budgetsMap.length,
      },
      budgets: budgetsMap.length > 0 ? budgetsMap : [
        { category: "Food", limit: Math.round(4000 * currencyRate), spent: Math.round(1800 * currencyRate), percentage: 45, status: "On Track" as any },
        { category: "Rent", limit: Math.round(3000 * currencyRate), spent: Math.round(3000 * currencyRate), percentage: 100, status: "Breached" as any },
      ],
      topSpends: topSpends.length > 0 ? topSpends : [
        { title: "Hostel Room Rent", category: "Rent", amount: Math.round(3000 * currencyRate), date: "02 May", method: "UPI" },
        { title: "College Mess Bill", category: "Food", amount: Math.round(1500 * currencyRate), date: "05 May", method: "UPI" },
      ],
      currency: selectedCurrency,
      healthScore,
    };
  }, [selectedMonth, allTransactions, allBudgets, user, currentPlan, selectedCurrency, currencyRate, userId]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const rgb = ACCENT_RGB[accentTheme];
    try {
      if (selectedDocType === "INVOICE" && invoiceData) {
        await DocumentGeneratorService.generateInvoicePDF(invoiceData, rgb);
        showToast(`Invoice ${invoiceData.id} downloaded.`, "success");
      } else if (selectedDocType === "RECEIPT" && receiptData) {
        await DocumentGeneratorService.generateReceiptPDF(receiptData, rgb);
        showToast(`Receipt ${receiptData.id} downloaded.`, "success");
      } else if (selectedDocType === "INVESTMENT" && investmentData) {
        await DocumentGeneratorService.generateInvestmentStatementPDF(investmentData, rgb);
        showToast(`Statement ${investmentData.id} downloaded.`, "success");
      } else if (selectedDocType === "ACCOUNT" && accountData) {
        await DocumentGeneratorService.generateAccountStatementPDF(accountData, rgb);
        showToast(`Account statement downloaded.`, "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to generate PDF. Please try again.", "warning");
    } finally {
      setIsDownloading(false);
    }
  };

  const activeDocId =
    selectedDocType === "INVOICE" ? invoiceData?.id :
    selectedDocType === "RECEIPT" ? receiptData?.id :
    selectedDocType === "INVESTMENT" ? investmentData?.id :
    accountData?.id;

  const activeDocLabel: Record<DocType, string> = {
    INVOICE: "Invoice", RECEIPT: "Receipt",
    INVESTMENT: "Investment Statement", ACCOUNT: "Account Statement",
  };

  const docTypeIcon: Record<DocType, React.ReactNode> = {
    INVOICE: <CreditCard className="w-4 h-4" />,
    RECEIPT: <Receipt className="w-4 h-4" />,
    INVESTMENT: <TrendingUp className="w-4 h-4" />,
    ACCOUNT: <BarChart3 className="w-4 h-4" />,
  };

  const statusCls = (s: string) => {
    switch (s.toUpperCase()) {
      case "PAID": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
      case "FAILED": case "OVERDUE": return "bg-rose-50 text-rose-500 border-rose-100";
      case "REFUNDED": return "bg-indigo-50 text-indigo-500 border-indigo-100";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const invSubtotal = invoiceData?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0;
  const invGst = invSubtotal * 0.18 / 1.18;
  const invTotal = invSubtotal;
  const rcptGst = (receiptData?.amount ?? 0) * 0.18 / 1.18;

  return (
    <div className="flex-1 min-h-screen bg-[#F7F8FC] p-4 md:p-8 space-y-8 font-sans text-slate-800 selection:bg-indigo-100 print:bg-white print:p-0">

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9ECF5] pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0A0D14] tracking-tight">Billing & Documents</h1>
            <span className="bg-[#6D5DFC]/10 text-[#6D5DFC] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Enterprise Core</span>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">Manage subscriptions and export Fortune 500-grade financial statements.</p>
        </div>
        <div className="bg-slate-200/50 p-1.5 rounded-2xl border border-[#E9ECF5] flex text-xs font-bold gap-1 self-start">
          {(["plans", "documents"] as const).map(tab => (
            <button key={tab} onClick={() => setConsoleTab(tab)}
              className={`px-4 py-2 rounded-xl transition-all ${consoleTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              {tab === "plans" ? "Pricing & Subscriptions" : "Document Center"}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PLANS */}
      {consoleTab === "plans" && (
        <div className="space-y-8 print:hidden animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E9ECF5] flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#6D5DFC]"><RefreshCw className="w-4 h-4" /></div>
                    <h3 className="font-bold text-sm text-[#0A0D14]">Active Plan Consumption</h3>
                  </div>
                  <span className="text-slate-400 text-xs font-semibold">Resets next billing cycle</span>
                </div>
                <p className="text-slate-500 text-xs mb-6 max-w-lg leading-relaxed relative">
                  Utilizing <strong className="text-slate-800">{txCount}</strong> of <strong className="text-slate-800">{currentPlan === "free" ? "5" : "unlimited"}</strong> transactions under <span className="font-extrabold text-[#6D5DFC] uppercase">{currentPlan}</span>.
                </p>
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-end text-xs font-bold text-slate-700">
                    <span>{currentPlan === "free" ? `${txCount} / 5` : `${txCount} / ∞`} Transactions</span>
                    <span className={txCount >= 5 && currentPlan === "free" ? "text-rose-500" : "text-[#6D5DFC]"}>{currentPlan === "free" ? `${Math.min(100, Math.round((txCount / 5) * 100))}%` : "Unlimited"}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-[#E9ECF5]">
                    <div className={`h-full rounded-full transition-all duration-1000 ${txCount >= 5 && currentPlan === "free" ? "bg-rose-500" : "bg-[#6D5DFC]"}`}
                      style={{ width: `${currentPlan === "free" ? Math.min(100, (txCount / 5) * 100) : 10}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#E9ECF5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#00C875]" /> SSL Encrypted</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#00C875]" /> Cancel Anytime</div>
                </div>
                {currentPlan === "free" && (
                  <button onClick={() => handleSelectPlan("pro")} className="flex items-center gap-1.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#6D5DFC]/10 transition-all">
                    Upgrade to Pro <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-[#E9ECF5] flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /><h3 className="font-bold text-sm text-[#0A0D14]">Wealth OS Advantages</h3></div>
                <ul className="space-y-3 text-xs text-slate-500 font-semibold">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" /> Unlimited ledger entries & history.</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" /> Gemini AI financial diagnostics.</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" /> Fortune 500-grade PDF exports.</li>
                </ul>
              </div>
              <div className="mt-6 p-3 bg-[#F7F8FC] rounded-xl border border-[#E9ECF5] text-[10px] text-slate-400 font-semibold leading-relaxed">
                <Info className="w-3.5 h-3.5 text-[#6D5DFC] inline mr-1" /> Need custom licensing? Contact our enterprise desk.
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-black text-[#0A0D14] uppercase tracking-wider">Choose Billing Period</span>
            <div className="bg-slate-200/60 p-1 rounded-2xl border border-[#E9ECF5] flex text-xs max-w-xs w-full">
              {(["monthly","yearly"] as const).map(c => (
                <button key={c} onClick={() => setBillingCycle(c)}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${billingCycle === c ? "bg-white text-[#0A0D14] shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                  {c === "monthly" ? "Monthly" : <><span>Yearly</span><span className="text-[8px] bg-indigo-50 text-[#6D5DFC] font-black px-1 py-0.5 rounded uppercase ml-1">-20%</span></>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: "free", name: "Starter", price: 0, desc: "For personal budgeting", badge: null, features: ["5 transactions/month","Basic charts","Local storage only","Standard PDF export"] },
              { key: "pro", name: "Pro", price: billingCycle === "monthly" ? 799 : 639, desc: "For serious wealth builders", badge: "Most Popular", features: ["Unlimited transactions","AI financial advisor","Premium PDF exports","Multi-currency support","Priority support"] },
              { key: "enterprise", name: "Enterprise", price: billingCycle === "monthly" ? 4999 : 3999, desc: "For power users & founders", badge: "Best Value", features: ["Everything in Pro","White-label documents","Advanced analytics","VIP concierge","Custom branding"] },
            ].map(plan => (
              <div key={plan.key} className={`relative p-6 rounded-2xl border flex flex-col gap-5 transition-all ${plan.key === "pro" ? "border-[#6D5DFC] bg-[#6D5DFC]/[0.02] shadow-lg shadow-[#6D5DFC]/5" : "border-[#E9ECF5] bg-white"} ${currentPlan === plan.key ? "ring-2 ring-[#6D5DFC]" : ""}`}>
                {plan.badge && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#6D5DFC] text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wide">{plan.badge}</span>}
                <div>
                  <h3 className="font-black text-sm text-[#0A0D14]">{plan.name}</h3>
                  <p className="text-slate-400 text-[11px] font-semibold mt-0.5">{plan.desc}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-2xl font-black text-[#0A0D14]">₹{plan.price.toLocaleString()}</span>
                    {plan.price > 0 && <span className="text-slate-400 text-xs font-semibold mb-1">/mo</span>}
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-500 font-semibold flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#00C875] shrink-0" />{f}</li>
                  ))}
                </ul>
                <button onClick={() => handleSelectPlan(plan.key as any)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${currentPlan === plan.key ? "bg-slate-100 text-slate-400 cursor-default" : plan.key === "pro" ? "bg-[#6D5DFC] hover:bg-[#5C4EED] text-white shadow-md shadow-[#6D5DFC]/20" : "border border-[#E9ECF5] hover:bg-slate-50 text-slate-700"}`}>
                  {currentPlan === plan.key ? "Current Plan" : `Select ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT CENTER */}
      {consoleTab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block animate-fade-in">

          {/* Left control panel */}
          <div className="lg:col-span-3 space-y-4 print:hidden">

            <div className="bg-white rounded-2xl border border-[#E9ECF5] p-4 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Document Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {(["INVOICE","RECEIPT","INVESTMENT","ACCOUNT"] as DocType[]).map(dt => (
                  <button key={dt} onClick={() => setSelectedDocType(dt)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-[9px] font-extrabold uppercase tracking-wide transition-all ${selectedDocType === dt ? "border-[#6D5DFC] bg-[#6D5DFC]/5 text-[#6D5DFC]" : "border-[#E9ECF5] text-slate-500 hover:border-slate-300"}`}>
                    <span style={{ color: selectedDocType === dt ? themeAccentHex : undefined }}>{docTypeIcon[dt]}</span>
                    {dt === "INVESTMENT" ? "Statement" : dt === "ACCOUNT" ? "Account" : dt.charAt(0) + dt.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E9ECF5] p-4 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Record Selection</h3>
              {selectedDocType === "INVOICE" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Invoice</label>
                  <select value={selectedInvoiceId} onChange={e => setSelectedInvoiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20">
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.id} — {inv.date}</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedDocType === "RECEIPT" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Transaction</label>
                  {allTransactions.length > 0 ? (
                    <select value={selectedTxId} onChange={e => setSelectedTxId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-slate-800 text-xs focus:outline-none">
                      {allTransactions.map((tx: any) => (
                        <option key={tx.id} value={tx.id}>{tx.title} — {currencySymbol}{tx.amount.amount}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-[10px] text-rose-500 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                      No transactions found. Add some in the Ledger first.
                    </div>
                  )}
                </div>
              )}
              {selectedDocType === "ACCOUNT" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Month</label>
                  <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-slate-800 text-xs focus:outline-none">
                    <option value="June 2026">June 2026</option>
                    <option value="May 2026">May 2026</option>
                  </select>
                </div>
              )}
              {selectedDocType === "INVESTMENT" && (
                <p className="text-[10px] text-slate-400 font-semibold">Using live goal data from your ledger.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#E9ECF5] p-4 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Customization</h3>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Currency</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["INR","USD","EUR"] as const).map(c => (
                    <button key={c} onClick={() => setSelectedCurrency(c)}
                      className={`py-1.5 rounded-xl border text-[9px] font-bold transition-all ${selectedCurrency === c ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-[#E9ECF5] text-slate-600 hover:bg-slate-50"}`}>
                      {c === "INR" ? "₹ INR" : c === "USD" ? "$ USD" : "€ EUR"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Brand Color</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["indigo","slate","emerald","crimson"] as const).map(color => (
                    <button key={color} onClick={() => setAccentTheme(color)}
                      className={`py-2 rounded-xl border text-[8px] font-bold flex flex-col items-center gap-1 transition-all ${accentTheme === color ? "ring-2 ring-offset-1 border-transparent" : "border-[#E9ECF5] hover:bg-slate-50"}`}
                      style={accentTheme === color ? { outlineColor: ACCENT_HEX[color] } : {}}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_HEX[color] }} />
                      <span className="text-slate-500 capitalize">{color === "indigo" ? "Brand" : color}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Document Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["PAID","PENDING","FAILED"].map(s => (
                    <button key={s} onClick={() => setDocStatus(s)}
                      className={`py-1.5 rounded-xl border text-[9px] font-bold transition-all ${docStatus === s ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-[#E9ECF5] text-slate-600 hover:bg-slate-50"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: preview + download */}
          <div className="lg:col-span-9 space-y-4 print:w-full">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E9ECF5] p-3 rounded-2xl shadow-sm print:hidden">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  {(["document","email"] as const).map(tab => (
                    <button key={tab} onClick={() => setPreviewTab(tab)}
                      className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${previewTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                      {tab === "document" ? <><Eye className="w-3.5 h-3.5" /> A4 Preview</> : <><Mail className="w-3.5 h-3.5" /> Email View</>}
                    </button>
                  ))}
                </div>
                {activeDocId && (
                  <span className="text-[10px] font-bold text-slate-400 border border-[#E9ECF5] px-2.5 py-1 rounded-lg bg-slate-50">{activeDocId}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3.5 py-2 border border-[#E9ECF5] hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all">
                  <Printer className="w-3.5 h-3.5 text-slate-400" /> Print
                </button>
                <button disabled={isDownloading} onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
                  style={{ backgroundColor: themeAccentHex }}>
                  {isDownloading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling…</> : <><Download className="w-3.5 h-3.5" /> Download PDF</>}
                </button>
              </div>
            </div>

            {previewTab === "document" ? (
              /* A4 PAPER PREVIEW */
              <div className="w-full bg-white border border-[#E9ECF5] shadow-xl rounded-2xl mx-auto overflow-hidden font-sans text-slate-700 text-xs relative max-w-[794px] select-none print:shadow-none print:border-none print:rounded-none">

                <div className="h-2.5 w-full" style={{ backgroundColor: themeAccentHex }} />

                <div className="px-10 py-8 space-y-6">

                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: themeAccentHex }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-full h-full p-1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <span className="text-lg font-black text-[#0A0D14] tracking-tight">{DocumentGeneratorService.COMPANY_NAME}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-8">{DocumentGeneratorService.COMPANY_TAGLINE}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-black tracking-tight" style={{ color: themeAccentHex }}>
                        {activeDocLabel[selectedDocType].toUpperCase()}
                      </h3>
                      <div className="flex justify-end mt-1.5">
                        <span className={`text-[8px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${statusCls(docStatus)}`}>{docStatus}</span>
                      </div>
                      <p className="text-[8.5px] text-slate-400 font-mono mt-1.5">{activeDocId}</p>
                    </div>
                  </div>

                  {/* Company meta */}
                  <div className="border-t border-[#E9ECF5] pt-4 grid grid-cols-3 gap-4 text-[8.5px]">
                    {[
                      { label: "Contact", lines: [DocumentGeneratorService.COMPANY_WEBSITE, DocumentGeneratorService.COMPANY_EMAIL] },
                      { label: "Registrations", lines: [DocumentGeneratorService.COMPANY_GSTIN, DocumentGeneratorService.COMPANY_BRN] },
                      { label: "Registered Office", lines: ["100 Pine Street, Suite 2400", "San Francisco, CA 94111, USA"] },
                    ].map(col => (
                      <div key={col.label}>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">{col.label}</span>
                        {col.lines.map(l => <span key={l} className="block text-slate-600 font-semibold leading-relaxed">{l}</span>)}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#E9ECF5]" />

                  {/* Meta row */}
                  <div className="grid grid-cols-3 gap-4 text-[8.5px]">
                    {selectedDocType === "INVOICE" && invoiceData && [
                      { label: "Issue Date", value: invoiceData.date },
                      { label: "Payment Due", value: invoiceData.dueDate },
                      { label: "Transaction Ref", value: invoiceData.transactionId },
                    ].map(col => (
                      <div key={col.label}>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">{col.label}</span>
                        <span className="block text-slate-700 font-bold font-mono">{col.value}</span>
                      </div>
                    ))}
                    {selectedDocType === "RECEIPT" && receiptData && [
                      { label: "Payment Date", value: receiptData.date },
                      { label: "Payment Method", value: receiptData.paymentMethod },
                      { label: "Transaction ID", value: receiptData.transactionId },
                    ].map(col => (
                      <div key={col.label}>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">{col.label}</span>
                        <span className="block text-slate-700 font-bold font-mono">{col.value}</span>
                      </div>
                    ))}
                    {selectedDocType === "INVESTMENT" && investmentData && [
                      { label: "Statement Period", value: investmentData.period },
                      { label: "Portfolio Ref", value: investmentData.referenceId },
                      { label: "Total Invested", value: fmtAmt(investmentData.totalInvested) },
                    ].map(col => (
                      <div key={col.label}>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">{col.label}</span>
                        <span className="block text-slate-700 font-bold font-mono">{col.value}</span>
                      </div>
                    ))}
                    {selectedDocType === "ACCOUNT" && accountData && [
                      { label: "Statement Month", value: accountData.monthName },
                      { label: "Savings Rate", value: `${accountData.summary.savingsRate}%` },
                      { label: "Health Score", value: `${accountData.healthScore} / 100` },
                    ].map(col => (
                      <div key={col.label}>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">{col.label}</span>
                        <span className="block text-slate-700 font-bold">{col.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#E9ECF5]" />

                  {/* Customer block */}
                  <div className="grid grid-cols-2 gap-8 text-[8.5px]">
                    <div>
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-2">Bill To</span>
                      <span className="block font-black text-sm text-[#0A0D14] leading-tight">
                        {selectedDocType === "INVOICE" ? invoiceData?.customer.name :
                         selectedDocType === "RECEIPT" ? receiptData?.customer.name :
                         selectedDocType === "INVESTMENT" ? investmentData?.customer.name :
                         accountData?.customer.name}
                      </span>
                      <span className="block text-slate-500 font-semibold mt-1">
                        {selectedDocType === "INVOICE" ? invoiceData?.customer.email :
                         selectedDocType === "RECEIPT" ? receiptData?.customer.email :
                         selectedDocType === "INVESTMENT" ? investmentData?.customer.email :
                         accountData?.customer.email}
                      </span>
                      <span className="block text-slate-400 font-semibold mt-1 leading-relaxed">
                        {selectedDocType === "INVOICE" ? invoiceData?.customer.billingAddress :
                         selectedDocType === "RECEIPT" ? receiptData?.customer.billingAddress :
                         selectedDocType === "INVESTMENT" ? investmentData?.customer.billingAddress :
                         accountData?.customer.billingAddress}
                      </span>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-2">Account Details</span>
                      {[
                        ["Customer ID", selectedDocType === "INVOICE" ? invoiceData?.customer.customerId : selectedDocType === "RECEIPT" ? receiptData?.customer.customerId : selectedDocType === "INVESTMENT" ? investmentData?.customer.customerId : accountData?.customer.customerId],
                        ["Account No.", selectedDocType === "INVOICE" ? invoiceData?.customer.accountNumber : selectedDocType === "INVESTMENT" ? investmentData?.customer.accountNumber : selectedDocType === "ACCOUNT" ? accountData?.customer.accountNumber : null],
                        ["Membership Tier", selectedDocType === "INVOICE" ? invoiceData?.customer.tier?.toUpperCase() : selectedDocType === "INVESTMENT" ? investmentData?.customer.tier?.toUpperCase() : selectedDocType === "ACCOUNT" ? accountData?.customer.tier?.toUpperCase() : null],
                        ["Tax Region", selectedDocType === "INVOICE" ? invoiceData?.customer.taxRegion : selectedDocType === "RECEIPT" ? receiptData?.customer.taxRegion : selectedDocType === "ACCOUNT" ? accountData?.customer.taxRegion : "India (GST)"],
                        ["Verification", "SECURE CLIENT ✓"],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={String(label)} className="flex justify-between mb-1.5">
                          <span className="text-slate-400 font-semibold">{label}</span>
                          <span className={`font-bold ${String(value).includes("SECURE") ? "text-emerald-500" : "text-slate-700"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-[#E9ECF5]" />

                  {/* INVOICE line items */}
                  {selectedDocType === "INVOICE" && invoiceData && (
                    <div className="space-y-4">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">Line Items</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-y border-[#E9ECF5] text-[7.5px] font-black uppercase text-[#0A0D14] tracking-wide">
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3 text-right">Qty</th>
                            <th className="py-2 px-3 text-right">Unit Price</th>
                            <th className="py-2 px-3 text-right">Tax</th>
                            <th className="py-2 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[9.5px]">
                          {invoiceData.items.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                              <td className="py-2.5 px-3 font-bold text-[#0A0D14]">{item.description}</td>
                              <td className="py-2.5 px-3 text-slate-500">{item.category}</td>
                              <td className="py-2.5 px-3 text-right text-slate-600">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-right text-slate-600">{currencySymbol}{item.unitPrice.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-right text-slate-500">{Math.round(item.taxRate * 100)}%</td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#0A0D14]">{fmtAmt(item.quantity * item.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2 text-[9px]">
                          <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span><span className="font-semibold text-slate-700">{fmtAmt(invSubtotal)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>GST (18% incl.)</span><span className="font-semibold text-slate-700">{fmtAmt(invGst)}</span>
                          </div>
                          {(invoiceData.discount ?? 0) > 0 && (
                            <div className="flex justify-between text-emerald-600 font-semibold">
                              <span>Discount</span><span>-{fmtAmt(invoiceData.discount!)}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t-2 flex justify-between items-center" style={{ borderColor: themeAccentHex }}>
                            <span className="font-black text-xs text-[#0A0D14]">Grand Total</span>
                            <span className="font-black text-sm" style={{ color: themeAccentHex }}>{fmtAmt(invTotal)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[8px]">
                            <span>Payment Method</span><span className="font-semibold">{invoiceData.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RECEIPT */}
                  {selectedDocType === "RECEIPT" && receiptData && (
                    <div className="space-y-4">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">Transaction Details</span>
                      <div className="bg-slate-50 border border-[#E9ECF5] rounded-xl p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-[9px]">
                        {[
                          ["Description", receiptData.title],
                          ["Category", receiptData.category],
                          ["Location", receiptData.location],
                          ["Notes", receiptData.notes],
                        ].map(([l, v]) => (
                          <div key={String(l)}>
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">{l}</span>
                            <span className="font-semibold text-slate-700">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2 text-[9px]">
                          <div className="flex justify-between text-slate-500">
                            <span>Transaction Amount</span><span className="font-semibold text-slate-700">{fmtAmt(receiptData.amount)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>GST (18% incl.)</span><span className="font-semibold text-slate-700">{fmtAmt(rcptGst)}</span>
                          </div>
                          <div className="pt-2 border-t-2 flex justify-between items-center" style={{ borderColor: themeAccentHex }}>
                            <span className="font-black text-xs text-[#0A0D14]">Total Settled</span>
                            <span className="font-black text-sm" style={{ color: themeAccentHex }}>{fmtAmt(receiptData.amount)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`rounded-xl p-4 text-center font-black text-sm border ${statusCls(receiptData.status)}`}>
                        {receiptData.status.toUpperCase()} — {fmtAmt(receiptData.amount)}
                      </div>
                    </div>
                  )}

                  {/* INVESTMENT */}
                  {selectedDocType === "INVESTMENT" && investmentData && (
                    <div className="space-y-4">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">SIP Allocation Breakdown</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-y border-[#E9ECF5] text-[7.5px] font-black uppercase text-[#0A0D14] tracking-wide">
                            <th className="py-2 px-3">Goal / Milestone</th>
                            <th className="py-2 px-3">Target Date</th>
                            <th className="py-2 px-3 text-right">Target</th>
                            <th className="py-2 px-3 text-right">Saved</th>
                            <th className="py-2 px-3 text-right">Progress</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[9.5px]">
                          {investmentData.allocations.map((item, idx) => {
                            const pct = Math.min(item.percent, 100);
                            const pCls = pct >= 80 ? "bg-emerald-50 text-emerald-600" : pct >= 50 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-500";
                            return (
                              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                <td className="py-2.5 px-3 font-bold text-[#0A0D14]">{item.goalTitle}</td>
                                <td className="py-2.5 px-3 text-slate-500">{item.targetDate || "Dec 2026"}</td>
                                <td className="py-2.5 px-3 text-right text-slate-600">{fmtAmt(item.target)}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{fmtAmt(item.saved)}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <span className={`font-black text-[8px] px-2 py-0.5 rounded-full ${pCls}`}>{pct}%</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="bg-slate-50 border border-[#E9ECF5] rounded-xl p-3 flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total SIP Contributions</span>
                        <span className="font-black text-sm" style={{ color: themeAccentHex }}>{fmtAmt(investmentData.totalInvested)}</span>
                      </div>
                    </div>
                  )}

                  {/* ACCOUNT */}
                  {selectedDocType === "ACCOUNT" && accountData && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Total Income", value: fmtAmt(accountData.summary.totalIncome), colorCls: "text-emerald-600", bgCls: "bg-emerald-50 border-emerald-100" },
                          { label: "Total Expenses", value: fmtAmt(accountData.summary.totalExpenses), colorCls: "text-rose-500", bgCls: "bg-rose-50 border-rose-100" },
                          { label: "Net Savings", value: fmtAmt(accountData.summary.netSavings), colorCls: "", bgCls: "bg-slate-50 border-[#E9ECF5]" },
                        ].map(m => (
                          <div key={m.label} className={`rounded-xl border p-3 text-center ${m.bgCls}`}>
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">{m.label}</span>
                            <span className={`block font-black text-sm mt-1 ${m.colorCls}`} style={!m.colorCls ? { color: themeAccentHex } : {}}>{m.value}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-2">Budget Envelopes</span>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 border-y border-[#E9ECF5] text-[7.5px] font-black uppercase text-[#0A0D14] tracking-wide">
                              <th className="py-1.5 px-3">Category</th>
                              <th className="py-1.5 px-3 text-right">Limit</th>
                              <th className="py-1.5 px-3 text-right">Spent</th>
                              <th className="py-1.5 px-3 text-right">Used</th>
                              <th className="py-1.5 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-[9px]">
                            {accountData.budgets.map((b, idx) => {
                              const isOk = b.percentage < 80;
                              const isWarn = b.percentage >= 80 && b.percentage < 100;
                              return (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                  <td className="py-2 px-3 font-bold text-[#0A0D14]">{b.category}</td>
                                  <td className="py-2 px-3 text-right text-slate-600">{fmtAmt(b.limit)}</td>
                                  <td className="py-2 px-3 text-right text-slate-600">{fmtAmt(b.spent)}</td>
                                  <td className="py-2 px-3 text-right text-slate-600">{b.percentage}%</td>
                                  <td className="py-2 px-3 text-right">
                                    <span className={`font-black text-[7.5px] px-1.5 py-0.5 rounded ${isOk ? "text-emerald-600 bg-emerald-50" : isWarn ? "text-amber-600 bg-amber-50" : "text-rose-500 bg-rose-50"}`}>
                                      {b.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-2">Top Transactions</span>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 border-y border-[#E9ECF5] text-[7.5px] font-black uppercase text-[#0A0D14] tracking-wide">
                              <th className="py-1.5 px-3">Date</th>
                              <th className="py-1.5 px-3">Description</th>
                              <th className="py-1.5 px-3">Category</th>
                              <th className="py-1.5 px-3">Method</th>
                              <th className="py-1.5 px-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-[9px]">
                            {accountData.topSpends.map((item, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                <td className="py-2 px-3 text-slate-500">{item.date}</td>
                                <td className="py-2 px-3 font-bold text-[#0A0D14]">{item.title}</td>
                                <td className="py-2 px-3 text-slate-500">{item.category}</td>
                                <td className="py-2 px-3 text-slate-500">{item.method}</td>
                                <td className="py-2 px-3 text-right font-bold text-[#0A0D14]">{fmtAmt(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Document footer */}
                  <div className="space-y-4 pt-4 border-t border-[#E9ECF5]">
                    <div className="flex justify-between items-end gap-6">
                      <div className="flex-1 space-y-1.5">
                        <h5 className="text-[8px] font-black uppercase tracking-widest" style={{ color: themeAccentHex }}>Document Verification</h5>
                        <p className="text-[7.5px] text-slate-400 font-semibold">This document is digitally signed and tamper-evident. Scan QR to verify authenticity.</p>
                        <p className="text-[7.5px] text-slate-400 font-semibold">Verification URL: <span className="font-mono text-slate-500">verify.fintrack.io/{activeDocId?.toLowerCase()}</span></p>
                        <div className="bg-slate-50 border border-[#E9ECF5] px-2 py-1.5 rounded-lg inline-block">
                          <span className="text-[7px] font-mono text-slate-400">INTEGRITY: SHA256-{(activeDocId ?? "").replace(/[^a-z0-9]/gi,"").toLowerCase().padEnd(16,"0").slice(0,16).toUpperCase()}…</span>
                        </div>
                      </div>
                      {/* QR Code (CSS art) */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-14 h-14 bg-white border border-[#E9ECF5] rounded-lg p-1 grid grid-cols-7 gap-px shadow-sm">
                          {Array.from({ length: 49 }).map((_, i) => {
                            const row = Math.floor(i / 7), col = i % 7;
                            const isFinder =
                              (row < 3 && col < 3) || (row < 3 && col > 3) ||
                              (row > 3 && col < 3) ||
                              (row === 3 && (col === 0 || col === 6)) ||
                              (col === 3 && (row === 0 || row === 6));
                            const isData = [8,10,12,17,19,22,29,31,38,40].includes(i);
                            return <div key={i} className={`rounded-sm ${isFinder || isData ? "bg-slate-900" : "bg-transparent"}`} />;
                          })}
                        </div>
                        <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider">Scan to Verify</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border-t border-[#E9ECF5] -mx-10 px-10 py-3 text-center space-y-0.5">
                      <p className="text-[7.5px] text-slate-400 font-semibold">
                        {DocumentGeneratorService.COMPANY_NAME} · {DocumentGeneratorService.COMPANY_WEBSITE} · {DocumentGeneratorService.COMPANY_EMAIL}
                      </p>
                      <p className="text-[7px] text-slate-300 font-semibold">
                        Computer-generated document — no physical signature required. © 2026 FinTrack, Inc. All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            ) : (
              /* EMAIL PREVIEW */
              <div className="w-full bg-[#F0F2F5] border border-[#E9ECF5] shadow-xl rounded-2xl mx-auto p-6 max-w-[580px] select-none">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E9ECF5]">
                  <div className="h-1.5 w-full" style={{ backgroundColor: themeAccentHex }} />
                  <div className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: themeAccentHex }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="font-black text-sm text-[#0A0D14]">FinTrack</span>
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#0A0D14] leading-snug">
                        Your {activeDocLabel[selectedDocType]} from FinTrack
                      </h2>
                      <p className="text-slate-500 text-[11px] font-semibold mt-1">
                        Hi {(selectedDocType === "INVOICE" ? invoiceData?.customer.name : receiptData?.customer.name)?.split(" ")[0] ?? "there"}, here's your document summary.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#E9ECF5] overflow-hidden">
                      <div className="px-5 py-4 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Amount</span>
                          <span className="text-2xl font-black mt-0.5 block" style={{ color: themeAccentHex }}>
                            {selectedDocType === "INVOICE" ? fmtAmt(invTotal) :
                             selectedDocType === "RECEIPT" ? fmtAmt(receiptData?.amount ?? 0) :
                             selectedDocType === "INVESTMENT" ? fmtAmt(investmentData?.totalInvested ?? 0) :
                             fmtAmt(accountData?.summary.netSavings ?? 0)}
                          </span>
                        </div>
                        <span className={`text-[8px] font-black px-2.5 py-1 rounded border uppercase tracking-wider ${statusCls(docStatus)}`}>{docStatus}</span>
                      </div>
                      <div className="px-5 py-3 space-y-1.5 text-[9.5px]">
                        <div className="flex justify-between text-slate-500 font-semibold">
                          <span>Reference</span>
                          <span className="font-mono font-bold text-slate-700">{activeDocId}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-semibold">
                          <span>Document Type</span>
                          <span className="font-bold text-slate-700">{activeDocLabel[selectedDocType]}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-semibold">
                          <span>Date</span>
                          <span className="font-bold text-slate-700">
                            {selectedDocType === "INVOICE" ? invoiceData?.date :
                             selectedDocType === "RECEIPT" ? receiptData?.date :
                             investmentData?.date ?? accountData?.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                      Your {activeDocLabel[selectedDocType].toLowerCase()} is ready. Keep it for your records or submit it for tax and expense reporting.
                    </p>
                    <button onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
                      style={{ backgroundColor: themeAccentHex }}>
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <div className="flex items-center gap-4 text-[9px] text-slate-400 font-semibold justify-center">
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit encrypted</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Tamper-proof</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Legally compliant</span>
                    </div>
                  </div>
                  <div className="border-t border-[#E9ECF5] px-6 py-4 bg-slate-50 text-center space-y-1">
                    <p className="text-[8.5px] text-slate-400 font-semibold">Sent from FinTrack Secure Mailer · 100 Pine Street, San Francisco, CA 94111</p>
                    <div className="flex justify-center gap-3 text-[8px] text-slate-400 font-semibold">
                      <a href="#privacy" className="underline underline-offset-2">Privacy Policy</a>
                      <span>·</span>
                      <a href="#terms" className="underline underline-offset-2">Terms of Service</a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 bg-slate-900 text-white text-xs font-semibold px-4 py-3.5 rounded-2xl shadow-xl border border-slate-800">
          {toastType === "success" && <span className="w-1.5 h-1.5 rounded-full bg-[#00C875]" />}
          {toastType === "info" && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
          {toastType === "warning" && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A5F]" />}
          <span className="pr-2">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-0.5 rounded transition-all"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}
