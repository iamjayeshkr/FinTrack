"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Check,
  Shield,
  Zap,
  Receipt,
  Download,
  RefreshCw,
  Star,
  Info,
  Crown,
  Calendar,
  X,
  CheckCircle2,
  Building,
  AlertCircle,
  ArrowRight,
  Eye,
  Mail,
  Printer,
  ChevronDown
} from "lucide-react";
import {
  DocumentGeneratorService,
  InvoiceData,
  ReceiptData,
  InvestmentData,
  AccountData
} from "../../application/services/document-generator";

// Document type options
type DocType = "INVOICE" | "RECEIPT" | "INVESTMENT" | "ACCOUNT";

export default function BillingPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  // Subscription plan states
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "enterprise">("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [txCount, setTxCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  // Document Console states
  const [consoleTab, setConsoleTab] = useState<"plans" | "documents">("plans");
  const [selectedDocType, setSelectedDocType] = useState<DocType>("INVOICE");
  const [previewTab, setPreviewTab] = useState<"document" | "email">("document");
  
  // Customization controls
  const [selectedCurrency, setSelectedCurrency] = useState<"INR" | "USD" | "EUR">("INR");
  const [accentTheme, setAccentTheme] = useState<"indigo" | "slate" | "emerald" | "crimson">("indigo");
  const [docStatus, setDocStatus] = useState<string>("PAID");

  // Local storage loaded data
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [allBudgets, setAllBudgets] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);

  // Selected item hooks for templates
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("INV-2026-004");
  const [selectedTxId, setSelectedTxId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("June 2026");

  const [isDownloading, setIsDownloading] = useState(false);

  // Load plan and transaction data
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
            if (parsed.length > 0 && !selectedTxId) {
              setSelectedTxId(parsed[0].id);
            }
          } catch (e) {
            console.error(e);
          }
        }
        if (bgData) {
          try {
            const parsed = JSON.parse(bgData).filter((b: any) => b.userId === userId);
            setAllBudgets(parsed);
          } catch (e) {}
        }
        if (glData) {
          try {
            const parsed = JSON.parse(glData).filter((g: any) => g.userId === userId);
            setAllGoals(parsed);
          } catch (e) {}
        }
      };
      
      refreshDB();
      window.addEventListener("storage", refreshDB);
      return () => {
        window.removeEventListener("storage", refreshDB);
      };
    }
  }, [userId, selectedTxId]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectPlan = (plan: "free" | "pro" | "enterprise") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_plan", plan);
      setCurrentPlan(plan);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("fintrack_plan_changed"));
      
      if (plan === "free") {
        showToast("Successfully downgraded to the Starter Free plan.", "info");
      } else if (plan === "pro") {
        showToast("Welcome to FinTrack Pro! Premium wealth management tools unlocked.", "success");
      } else {
        showToast("Welcome to FinTrack Enterprise. VIP concierge and priority advisor activated.", "success");
      }
    }
  };

  // Mock static invoices
  const invoices = useMemo(() => {
    return [
      {
        id: "INV-2026-004",
        date: "Jun 24, 2026",
        dueDate: "Jun 24, 2026",
        plan: "Pro Plan (Monthly Subscription)",
        amount: 799,
        status: "PAID",
        paymentMethod: "Visa ending in 4242",
        transactionId: "TXN-71932014"
      },
      {
        id: "INV-2026-003",
        date: "May 24, 2026",
        dueDate: "May 24, 2026",
        plan: "Pro Plan (Monthly Subscription)",
        amount: 799,
        status: "PAID",
        paymentMethod: "Visa ending in 4242",
        transactionId: "TXN-61840211"
      },
      {
        id: "INV-2026-002",
        date: "Apr 24, 2026",
        dueDate: "Apr 24, 2026",
        plan: "Pro Plan (Monthly Subscription)",
        amount: 799,
        status: "PAID",
        paymentMethod: "Visa ending in 4242",
        transactionId: "TXN-50912384"
      },
      {
        id: "INV-2026-005",
        date: "Jun 24, 2026",
        dueDate: "Jun 24, 2026",
        plan: "Enterprise Plan (Monthly Subscription)",
        amount: 4999,
        status: "PAID",
        paymentMethod: "Mastercard ending in 9911",
        transactionId: "TXN-90214822"
      }
    ];
  }, []);

  // Theme Accent map
  const themeAccentHex = useMemo(() => {
    switch (accentTheme) {
      case "indigo": return "#6D5DFC";
      case "slate": return "#475569";
      case "emerald": return "#10B981";
      case "crimson": return "#EF4444";
    }
  }, [accentTheme]);

  const currencySymbol = useMemo(() => {
    switch (selectedCurrency) {
      case "INR": return "₹";
      case "USD": return "$";
      case "EUR": return "€";
    }
  }, [selectedCurrency]);

  const currencyRate = useMemo(() => {
    switch (selectedCurrency) {
      case "INR": return 1;
      case "USD": return 1/80;
      case "EUR": return 1/88;
    }
  }, [selectedCurrency]);

  // Compile active document data models
  const invoiceData = useMemo<InvoiceData | null>(() => {
    const inv = invoices.find(i => i.id === selectedInvoiceId) || invoices[0];
    if (!inv) return null;
    
    return {
      id: inv.id,
      date: inv.date,
      dueDate: inv.dueDate,
      status: docStatus as any,
      customer: {
        name: user?.fullName || "Rudransh Kumar",
        email: user?.primaryEmailAddress?.emailAddress || "client@fintrack.io",
        billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN",
        tier: currentPlan
      },
      items: [
        {
          description: inv.plan,
          category: "Subscription Billing",
          quantity: 1,
          unitPrice: Math.round(inv.amount * currencyRate),
          taxRate: 0.18,
          amount: Math.round(inv.amount * currencyRate)
        }
      ],
      currency: selectedCurrency,
      paymentMethod: inv.paymentMethod,
      transactionId: inv.transactionId,
      discount: 0,
      processingFee: 0
    };
  }, [selectedInvoiceId, invoices, user, currentPlan, selectedCurrency, currencyRate, docStatus]);

  const receiptData = useMemo<ReceiptData | null>(() => {
    const tx = allTransactions.find(t => t.id === selectedTxId) || allTransactions[0];
    if (!tx) return null;

    return {
      id: `RCP-2026-${tx.id.substring(0, 4).toUpperCase()}`,
      date: new Date(tx.date).toLocaleDateString("en-IN", { dateStyle: "medium" }),
      title: tx.title,
      amount: Math.round(tx.amount.amount * currencyRate),
      currency: selectedCurrency,
      category: tx.categoryId,
      paymentMethod: tx.paymentMethod,
      status: docStatus === "PAID" ? "Paid" : "Pending",
      notes: tx.description || "Standard ledger validation debit.",
      location: tx.location || "Local Sync Node, Mumbai, IN",
      customer: {
        name: user?.fullName || "Rudransh Kumar",
        email: user?.primaryEmailAddress?.emailAddress || "client@fintrack.io",
        billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN"
      },
      transactionId: `TXN-LEDG-${tx.id.substring(0, 8).toUpperCase()}`
    };
  }, [selectedTxId, allTransactions, user, selectedCurrency, currencyRate, docStatus]);

  const investmentData = useMemo<InvestmentData | null>(() => {
    const allocations = allGoals.map(g => ({
      goalTitle: g.title,
      target: Math.round(g.targetAmount.amount * currencyRate),
      saved: Math.round(g.currentAmount.amount * currencyRate),
      percent: Math.round((g.currentAmount.amount / g.targetAmount.amount) * 100)
    }));

    const totalInvested = allTransactions
      .filter(t => t.type === "INVESTMENT" || t.type === "SAVINGS")
      .reduce((sum, t) => sum + t.amount.amount, 0);

    return {
      id: "STM-2026-INV06",
      date: "Jun 24, 2026",
      period: "May 24, 2026 - Jun 24, 2026",
      customer: {
        name: user?.fullName || "Rudransh Kumar",
        email: user?.primaryEmailAddress?.emailAddress || "client@fintrack.io",
        billingAddress: "Mumbai Corporate Hub, Lower Parel, MH 400013, IN",
        tier: currentPlan
      },
      allocations: allocations.length > 0 ? allocations : [
        { goalTitle: "Emergency Fund", target: Math.round(50000 * currencyRate), saved: Math.round(2000 * currencyRate), percent: 4 },
        { goalTitle: "Buy Laptop M4", target: Math.round(60000 * currencyRate), saved: Math.round(5000 * currencyRate), percent: 8 }
      ],
      currency: selectedCurrency,
      totalInvested: Math.round(totalInvested * currencyRate),
      status: docStatus === "PAID" ? "Settled" : "Processing" as any,
      referenceId: "PORTFOLIO-REF-8910"
    };
  }, [allGoals, allTransactions, user, currentPlan, selectedCurrency, currencyRate, docStatus]);

  const accountData = useMemo<AccountData | null>(() => {
    // Summarize values
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;

    const targetMonth = selectedMonth.startsWith("May") ? 4 : 5; // index: May = 4, June = 5

    const monthTxs = allTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === targetMonth && d.getFullYear() === 2026;
    });

    monthTxs.forEach(t => {
      if (t.type === "INCOME") totalIncome += t.amount.amount;
      else if (t.type === "EXPENSE") totalExpenses += t.amount.amount;
      else if (t.type === "SAVINGS" || t.type === "INVESTMENT") totalSavings += t.amount.amount;
    });

    // Budgets
    const budgetsMap = allBudgets.map(b => {
      const spent = allTransactions
        .filter(t => t.categoryId === b.categoryId && t.type === "EXPENSE" && new Date(t.date).getMonth() === targetMonth)
        .reduce((sum, t) => sum + t.amount.amount, 0);
      return {
        category: b.categoryId,
        limit: Math.round(b.limitAmount.amount * currencyRate),
        spent: Math.round(spent * currencyRate),
        percentage: Math.round((spent / b.limitAmount.amount) * 100),
        status: spent > b.limitAmount.amount ? "Breached" : "On Track" as any
      };
    });

    // Top transactions
    const topSpends = [...monthTxs]
      .filter(t => t.type === "EXPENSE")
      .sort((a, b) => b.amount.amount - a.amount.amount)
      .slice(0, 3)
      .map(t => ({
        title: t.title,
        category: t.categoryId,
        amount: Math.round(t.amount.amount * currencyRate),
        date: new Date(t.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }),
        method: t.paymentMethod
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
        tier: currentPlan
      },
      summary: {
        totalIncome: Math.round(totalIncome * currencyRate),
        totalExpenses: Math.round(totalExpenses * currencyRate),
        netSavings: Math.round(totalSavings * currencyRate),
        savingsRate: savingsRate,
        activeBudgetsCount: budgetsMap.length
      },
      budgets: budgetsMap.length > 0 ? budgetsMap : [
        { category: "Food", limit: Math.round(4000 * currencyRate), spent: Math.round(1800 * currencyRate), percentage: 45, status: "On Track" },
        { category: "Rent", limit: Math.round(3000 * currencyRate), spent: Math.round(3000 * currencyRate), percentage: 100, status: "On Track" }
      ],
      topSpends: topSpends.length > 0 ? topSpends : [
        { title: "Hostel Shared Room Rent", category: "Rent", amount: Math.round(3000 * currencyRate), date: "02 May", method: "UPI" },
        { title: "College Mess Food bill", category: "Food", amount: Math.round(1500 * currencyRate), date: "05 May", method: "UPI" }
      ],
      currency: selectedCurrency,
      healthScore: healthScore
    };
  }, [selectedMonth, allTransactions, allBudgets, user, currentPlan, selectedCurrency, currencyRate]);

  // Handle PDF Generation trigger
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      if (selectedDocType === "INVOICE" && invoiceData) {
        await DocumentGeneratorService.generateInvoicePDF(invoiceData);
        showToast(`Downloaded Invoice ${invoiceData.id} successfully!`, "success");
      } else if (selectedDocType === "RECEIPT" && receiptData) {
        await DocumentGeneratorService.generateReceiptPDF(receiptData);
        showToast(`Downloaded Receipt ${receiptData.id} successfully!`, "success");
      } else if (selectedDocType === "INVESTMENT" && investmentData) {
        await DocumentGeneratorService.generateInvestmentStatementPDF(investmentData);
        showToast(`Downloaded Investment Statement ${investmentData.id} successfully!`, "success");
      } else if (selectedDocType === "ACCOUNT" && accountData) {
        await DocumentGeneratorService.generateAccountStatementPDF(accountData);
        showToast(`Downloaded Account Statement ${accountData.id} successfully!`, "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to compile and download PDF document.", "warning");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F7F8FC] p-4 md:p-8 space-y-8 font-sans text-slate-800 selection:bg-indigo-100 print:bg-white print:p-0 print:m-0">
      
      {/* Header Banner - hidden in print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9ECF5] pb-6 print:hidden">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0A0D14] tracking-tight">
              Billing & Documents
            </h1>
            <span className="bg-[#6D5DFC]/10 text-[#6D5DFC] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              V3 Enterprise Core
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Manage your subscription plan tiers, pricing matrices, and export Fortune 500-grade financial statements.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-200/50 p-1.5 rounded-2xl border border-[#E9ECF5] flex text-xs font-bold gap-1 self-start">
          <button
            onClick={() => setConsoleTab("plans")}
            className={`px-4 py-2 rounded-xl transition-all ${
              consoleTab === "plans" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Pricing & Subscriptions
          </button>
          <button
            onClick={() => setConsoleTab("documents")}
            className={`px-4 py-2 rounded-xl transition-all ${
              consoleTab === "documents" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Interactive Document Center
          </button>
        </div>
      </div>

      {/* TAB 1: PRICING & SUBSCRIPTIONS */}
      {consoleTab === "plans" && (
        <div className="space-y-8 print:hidden animate-fade-in">
          {/* Limit gauge consumption */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E9ECF5] flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#6D5DFC]">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-[#0A0D14]">Active Plan Consumption</h3>
                  </div>
                  <span className="text-slate-400 text-xs font-semibold">Resets next billing cycle</span>
                </div>
                <p className="text-slate-500 text-xs mb-6 max-w-lg leading-relaxed relative">
                  You are utilizing <strong className="text-slate-800">{txCount}</strong> out of the allowed <strong className="text-slate-800">{currentPlan === "free" ? "5" : "unlimited"}</strong> transaction entries under the <span className="font-extrabold text-[#6D5DFC] uppercase">{currentPlan}</span> tier.
                </p>
                
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-end text-xs font-bold text-slate-700">
                    <span>{currentPlan === "free" ? `${txCount} / 5` : `${txCount} / Unlimited`} Transactions logged</span>
                    <span className={txCount >= 5 && currentPlan === "free" ? "text-rose-500" : "text-[#6D5DFC]"}>
                      {currentPlan === "free" ? `${Math.min(100, Math.round((txCount / 5) * 100))}%` : "0.01%"}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-[#E9ECF5]">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        txCount >= 5 && currentPlan === "free" ? "bg-rose-500 shadow-md" : "bg-[#6D5DFC]"
                      }`}
                      style={{ width: `${currentPlan === "free" ? Math.min(100, (txCount / 5) * 100) : 10}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E9ECF5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#00C875]" /> SSL Encrypted Payments</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#00C875]" /> Cancel Anytime</div>
                </div>
                {currentPlan === "free" && (
                  <button 
                    onClick={() => handleSelectPlan("pro")}
                    className="flex items-center justify-center gap-1.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-[#6D5DFC]/10 cursor-pointer"
                  >
                    Instant Pro Upgrade <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E9ECF5] flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-sm text-[#0A0D14]">Wealth OS Advantages</h3>
                </div>
                <ul className="space-y-3 text-xs text-slate-500 font-semibold">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" /> Unlimited ledger transaction entries.</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" /> Gemini LLM financial diagnostics.</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" /> High-end statement downloads & exports.</li>
                </ul>
              </div>
              <div className="mt-6 p-3 bg-[#F7F8FC] rounded-xl border border-[#E9ECF5] text-[10px] text-slate-400 font-semibold leading-relaxed">
                <Info className="w-3.5 h-3.5 text-[#6D5DFC] inline mr-1" /> Need custom pricing licensing terms? Contact corporate support desks.
              </div>
            </div>
          </div>

          {/* Pricing cycle toggles */}
          <div className="flex flex-col items-center justify-center space-y-3 mt-4">
            <span className="text-[10px] font-black text-[#0A0D14] uppercase tracking-wider">Choose Billing Period</span>
            <div className="bg-slate-200/60 p-1 rounded-2xl border border-[#E9ECF5] flex text-xs relative max-w-xs w-full">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-white text-[#0A0D14] shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly Rate
              </button>
              <button 
                onClick={() => setBillingCycle("yearly")}
                className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                  billingCycle === "yearly" ? "bg-white text-[#0A0D14] shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Yearly Save 20% <span className="text-[8px] bg-indigo-50 text-[#6D5DFC] font-black px-1 py-0.5 rounded uppercase">Sale</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter Free */}
            <div className={`p-6 rounded-2xl bg-white border flex flex-col justify-between shadow-sm transition-all ${
              currentPlan === "free" ? "border-slate-400 ring-4 ring-slate-100" : "border-[#E9ECF5] hover:border-slate-350"
            }`}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter Free</span>
                  {currentPlan === "free" && <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">Active</span>}
                </div>
                <h3 className="font-extrabold text-lg text-[#0A0D14]">Basic Ledger</h3>
                <p className="text-xs text-slate-400 mt-1">Standard logs for personal tracking.</p>
                <div className="mt-6 flex items-baseline gap-1 text-[#0A0D14] font-black text-3xl">₹0</div>
                <div className="border-t border-[#E9ECF5] my-6" />
                <ul className="space-y-3.5 text-xs text-slate-500 font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> Limit 5 transactions</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> Budget envelope configuration</li>
                  <li className="flex items-center gap-2 text-slate-300 line-through"><X className="w-4 h-4 text-slate-300 shrink-0" /> RAG AI Intelligence audits</li>
                </ul>
              </div>
              <button 
                disabled={currentPlan === "free"}
                onClick={() => handleSelectPlan("free")}
                className={`w-full mt-8 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentPlan === "free" ? "bg-slate-100 text-slate-400 cursor-default" : "bg-slate-900 text-white cursor-pointer"
                }`}
              >
                {currentPlan === "free" ? "Current Active Plan" : "Downgrade to Starter"}
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`p-6 rounded-2xl bg-white border-2 flex flex-col justify-between shadow-md relative transition-all ${
              currentPlan === "pro" ? "border-[#6D5DFC] ring-4 ring-[#6D5DFC]/10" : "border-indigo-100 hover:border-indigo-300"
            }`}>
              <span className="absolute -top-3 right-6 text-[9px] bg-gradient-to-r from-[#6D5DFC] to-[#8B7CFF] text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">Most Popular</span>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#6D5DFC] uppercase tracking-wider">FinTrack Pro</span>
                  {currentPlan === "pro" && <span className="text-[9px] bg-indigo-50 text-[#6D5DFC] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>}
                </div>
                <h3 className="font-extrabold text-lg text-[#0A0D14]">Wealth Builder</h3>
                <p className="text-xs text-slate-400 mt-1">For scaling personal capital and goals.</p>
                <div className="mt-6 flex items-baseline gap-1 text-[#0A0D14] font-black text-3xl">
                  {billingCycle === "monthly" ? "₹799" : "₹6,399"}
                  <span className="text-xs text-slate-400 font-semibold">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                <div className="border-t border-[#E9ECF5] my-6" />
                <ul className="space-y-3.5 text-xs text-slate-500 font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> Unlimited transaction entries</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> RAG AI Intelligence audits</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> Dynamic corporate statement exports</li>
                </ul>
              </div>
              <button 
                onClick={() => handleSelectPlan(currentPlan === "pro" ? "free" : "pro")}
                className={`w-full mt-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  currentPlan === "pro" ? "bg-slate-200 text-slate-700" : "bg-[#6D5DFC] text-white cursor-pointer"
                }`}
              >
                {currentPlan === "pro" ? "Downgrade Plan" : "Upgrade to Pro"}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className={`p-6 rounded-2xl bg-white border flex flex-col justify-between shadow-sm transition-all ${
              currentPlan === "enterprise" ? "border-emerald-500 ring-4 ring-emerald-50" : "border-[#E9ECF5] hover:border-slate-350"
            }`}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Enterprise Elite</span>
                  {currentPlan === "enterprise" && <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase">Active</span>}
                </div>
                <h3 className="font-extrabold text-lg text-[#0A0D14]">Wealth Command</h3>
                <p className="text-xs text-slate-400 mt-1">For HNIs and elite wealth management.</p>
                <div className="mt-6 flex items-baseline gap-1 text-[#0A0D14] font-black text-3xl">
                  {billingCycle === "monthly" ? "₹4,999" : "₹39,999"}
                  <span className="text-xs text-slate-400 font-semibold">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                <div className="border-t border-[#E9ECF5] my-6" />
                <ul className="space-y-3.5 text-xs text-slate-500 font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> API access & Custom webhooks</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00C875] shrink-0" /> Priority 1-on-1 advisor desk</li>
                </ul>
              </div>
              <button 
                onClick={() => handleSelectPlan(currentPlan === "enterprise" ? "free" : "enterprise")}
                className={`w-full mt-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  currentPlan === "enterprise" ? "bg-slate-200 text-slate-700" : "bg-slate-900 text-white cursor-pointer"
                }`}
              >
                {currentPlan === "enterprise" ? "Cancel Enterprise" : "Upgrade to Enterprise"}
              </button>
            </div>
          </div>

          {/* Billing Receipts archives list */}
          <div className="p-6 rounded-2xl bg-white border border-[#E9ECF5] shadow-sm max-w-5xl mx-auto text-left">
            <h3 className="font-extrabold text-sm text-[#0A0D14] mb-4">Subscription Billing History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-slate-600">
                <thead>
                  <tr className="border-b border-[#E9ECF5] text-slate-400 font-bold text-[9px] uppercase tracking-wider text-left">
                    <th className="py-2.5 px-3">Invoice No.</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3">Allocated Plan</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-[#0A0D14]">{inv.id}</td>
                      <td className="py-3 px-3 text-slate-500">{inv.date}</td>
                      <td className="py-3 px-3">{inv.plan}</td>
                      <td className="py-3 px-3 text-[#0A0D14] font-bold">₹{inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="bg-[#e2fbe8] text-[#00C875] text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Settled</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE DOCUMENT CENTER */}
      {consoleTab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left animate-fade-in print:grid-cols-1 print:gap-0">
          
          {/* Config Controls Column (Left - 1/3) - hidden in print */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <div className="p-6 rounded-3xl bg-white border border-[#E9ECF5] shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building className="w-5 h-5 text-[#6D5DFC]" />
                <h3 className="font-extrabold text-sm text-[#0A0D14]">Document Settings</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-600">
                {/* Select Document Type */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">Document Format</label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value as DocType)}
                    className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="INVOICE">Subscription Invoice</option>
                    <option value="RECEIPT">Ledger Payment Receipt</option>
                    <option value="INVESTMENT">Investment SIP Statement</option>
                    <option value="ACCOUNT">Account Audit Statement</option>
                  </select>
                </div>

                {/* Dynamic selectors based on format */}
                {selectedDocType === "INVOICE" && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">Select Invoice Record</label>
                    <select
                      value={selectedInvoiceId}
                      onChange={(e) => setSelectedInvoiceId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-slate-800 focus:outline-none"
                    >
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.id} ({inv.date}) - ₹{inv.amount}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedDocType === "RECEIPT" && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">Select Ledger Transaction</label>
                    {allTransactions.length > 0 ? (
                      <select
                        value={selectedTxId}
                        onChange={(e) => setSelectedTxId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-slate-800 focus:outline-none"
                      >
                        {allTransactions.map(tx => (
                          <option key={tx.id} value={tx.id}>{tx.title} - ₹{tx.amount.amount} ({tx.categoryId})</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[10px] text-rose-500 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                        No ledger transactions found. Log transactions in the Ledger tab first.
                      </div>
                    )}
                  </div>
                )}

                {selectedDocType === "ACCOUNT" && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">Select Statement Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-slate-800 focus:outline-none"
                    >
                      <option value="June 2026">June 2026</option>
                      <option value="May 2026">May 2026</option>
                    </select>
                  </div>
                )}

                <div className="border-t border-slate-100 my-4 pt-4 space-y-4">
                  {/* Currency Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">Format Currency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["INR", "USD", "EUR"] as const).map(curr => (
                        <button
                          key={curr}
                          onClick={() => setSelectedCurrency(curr)}
                          className={`py-1.5 rounded-xl border font-bold text-center ${
                            selectedCurrency === curr
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-[#E9ECF5] text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {curr === "INR" ? "INR (₹)" : curr === "USD" ? "USD ($)" : "EUR (€)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Theme Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">Accent Theme Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["indigo", "slate", "emerald", "crimson"] as const).map(color => (
                        <button
                          key={color}
                          onClick={() => setAccentTheme(color)}
                          className={`py-2 rounded-xl border text-[10px] font-extrabold capitalize text-center border-slate-200 transition-all ${
                            accentTheme === color ? "ring-2 ring-indigo-500 scale-102" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle ${
                            color === "indigo" ? "bg-[#6D5DFC]" :
                            color === "slate" ? "bg-slate-600" :
                            color === "emerald" ? "bg-[#10B981]" : "bg-red-500"
                          }`} />
                          {color === "indigo" ? "Brand" : color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document Status Badge Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">Force Document Status</label>
                    <div className="grid grid-cols-3 gap-2 text-[9px] font-bold">
                      {["PAID", "PENDING", "FAILED"].map(status => (
                        <button
                          key={status}
                          onClick={() => setDocStatus(status)}
                          className={`py-1.5 rounded-xl border font-extrabold text-center ${
                            docStatus === status
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-[#E9ECF5] text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Interactive Document Preview Column (Right - 2/3) */}
          <div className="lg:col-span-8 space-y-6 print:w-full print:p-0 print:border-none print:shadow-none">
            {/* Header bar controls - hidden in print */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E9ECF5] p-3 rounded-2xl shadow-sm print:hidden">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start">
                <button
                  onClick={() => setPreviewTab("document")}
                  className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    previewTab === "document" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Eye className="w-4 h-4" /> A4 Paper Preview
                </button>
                <button
                  onClick={() => setPreviewTab("email")}
                  className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    previewTab === "email" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email HTML View
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#E9ECF5] hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-sm transition-all"
                  title="Print Document"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" /> Print
                </button>
                <button
                  disabled={isDownloading}
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 bg-[#6D5DFC] hover:bg-[#5C4EED] text-white text-xs font-bold px-5.5 py-2.5 rounded-xl shadow-md shadow-[#6D5DFC]/10 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            {previewTab === "document" ? (
              /* A4 PAPER PREVIEW (Light Mode Premium) */
              <div 
                className="w-full bg-white border border-[#E9ECF5] shadow-2xl rounded-2xl mx-auto p-12 space-y-8 font-sans text-slate-700 text-xs relative max-w-[794px] min-h-[1000px] overflow-hidden leading-relaxed select-none print:shadow-none print:border-none print:p-4"
                style={{ contentVisibility: "auto" }}
              >
                {/* Top brand accent border line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-3" 
                  style={{ backgroundColor: themeAccentHex }}
                />

                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black text-[#0A0D14] tracking-tight">{DocumentGeneratorService["COMPANY_NAME"]}</h2>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-semibold tracking-wide uppercase">{DocumentGeneratorService["COMPANY_TAGLINE"]}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black tracking-tight" style={{ color: themeAccentHex }}>
                      {selectedDocType === "INVOICE" && "INVOICE STATEMENT"}
                      {selectedDocType === "RECEIPT" && "PAYMENT RECEIPT"}
                      {selectedDocType === "INVESTMENT" && "INVESTMENT STATEMENT"}
                      {selectedDocType === "ACCOUNT" && "ACCOUNT STATEMENT"}
                    </h3>
                    <div className="flex justify-end gap-1.5 items-center mt-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        docStatus === "PAID" ? "bg-emerald-50 text-[#00C875] border border-emerald-100" :
                        docStatus === "PENDING" ? "bg-amber-50 text-[#FFB020] border border-amber-100" :
                        "bg-rose-50 text-[#FF5A5F] border border-rose-100"
                      }`}>
                        {docStatus}
                      </span>
                    </div>
                    <span className="block text-[9px] text-slate-400 font-bold mt-1.5">
                      Ref ID: {selectedDocType === "INVOICE" && invoiceData?.id}
                      {selectedDocType === "RECEIPT" && receiptData?.id}
                      {selectedDocType === "INVESTMENT" && investmentData?.id}
                      {selectedDocType === "ACCOUNT" && accountData?.id}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E9ECF5]" />

                {/* Company details columns */}
                <div className="grid grid-cols-3 gap-6 text-[8px] leading-normal font-semibold text-slate-500">
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Contact</span>
                    <span className="block text-slate-800">{DocumentGeneratorService["COMPANY_WEBSITE"]}</span>
                    <span className="block text-slate-800">{DocumentGeneratorService["COMPANY_EMAIL"]}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Registrations</span>
                    <span className="block text-slate-800">{DocumentGeneratorService["COMPANY_GSTIN"]}</span>
                    <span className="block text-slate-800">{DocumentGeneratorService["COMPANY_BRN"]}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Office Address</span>
                    <span className="block text-slate-800">100 Pine Street, Suite 2400</span>
                    <span className="block text-slate-800">San Francisco, CA 94111, USA</span>
                  </div>
                </div>

                <div className="border-t border-[#E9ECF5]" />

                {/* Metadata Row (Col 1: Issue Date, Col 2: Due Date/Method, Col 3: Reference) */}
                <div className="grid grid-cols-3 gap-6 text-[9px] leading-normal font-bold">
                  <div>
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Date Issued</span>
                    <span className="text-slate-700 mt-1 block">
                      {selectedDocType === "INVOICE" && invoiceData?.date}
                      {selectedDocType === "RECEIPT" && receiptData?.date}
                      {selectedDocType === "INVESTMENT" && investmentData?.date}
                      {selectedDocType === "ACCOUNT" && accountData?.date}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {selectedDocType === "INVOICE" ? "Payment Due" : "Payment Method"}
                    </span>
                    <span className="text-slate-700 mt-1 block">
                      {selectedDocType === "INVOICE" && invoiceData?.dueDate}
                      {selectedDocType === "RECEIPT" && receiptData?.paymentMethod}
                      {selectedDocType === "INVESTMENT" && "Auto-Debit SIP"}
                      {selectedDocType === "ACCOUNT" && "Local Ledger Audit"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Reference Code</span>
                    <span className="text-slate-700 mt-1 block font-mono">
                      {selectedDocType === "INVOICE" && invoiceData?.transactionId}
                      {selectedDocType === "RECEIPT" && receiptData?.transactionId}
                      {selectedDocType === "INVESTMENT" && investmentData?.referenceId}
                      {selectedDocType === "ACCOUNT" && "AUDIT-SYNC-OK"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E9ECF5]" />

                {/* Customer Section */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Bill To (Customer)</span>
                    <span className="block text-xs font-bold text-slate-800">
                      {selectedDocType === "INVOICE" && invoiceData?.customer.name}
                      {selectedDocType === "RECEIPT" && receiptData?.customer.name}
                      {selectedDocType === "INVESTMENT" && investmentData?.customer.name}
                      {selectedDocType === "ACCOUNT" && accountData?.customer.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
                      {selectedDocType === "INVOICE" && invoiceData?.customer.email}
                      {selectedDocType === "RECEIPT" && receiptData?.customer.email}
                      {selectedDocType === "INVESTMENT" && investmentData?.customer.email}
                      {selectedDocType === "ACCOUNT" && accountData?.customer.email}
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-1 leading-relaxed font-semibold">
                      {selectedDocType === "INVOICE" && invoiceData?.customer.billingAddress}
                      {selectedDocType === "RECEIPT" && receiptData?.customer.billingAddress}
                      {selectedDocType === "INVESTMENT" && investmentData?.customer.billingAddress}
                      {selectedDocType === "ACCOUNT" && accountData?.customer.billingAddress}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Customer Summary</span>
                    <span className="block text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                      Verification Status: <strong className="text-[#00C875] font-extrabold">SECURE CLIENT</strong><br />
                      {selectedDocType === "ACCOUNT" && accountData?.customer.accountNumber && (
                        <>Account Number: {accountData.customer.accountNumber}<br /></>
                      )}
                      Subscription Tier: <strong className="text-slate-800 font-bold uppercase">{currentPlan}</strong>
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E9ECF5]" />

                {/* TEMPLATE DETAIL VIEWS */}

                {/* 1. INVOICE LINE ITEMS */}
                {selectedDocType === "INVOICE" && invoiceData && (
                  <div className="space-y-6">
                    <table className="w-full text-left font-semibold">
                      <thead>
                        <tr className="bg-slate-50 text-[#0A0D14] border-y border-[#E9ECF5] text-[9px] font-extrabold uppercase">
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3 text-right">Qty</th>
                          <th className="py-2 px-3 text-right">Unit Price</th>
                          <th className="py-2 px-3 text-right">Tax</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10px] text-slate-700">
                        {invoiceData.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-3 font-bold text-[#0A0D14]">{item.description}</td>
                            <td className="py-3 px-3">{item.category}</td>
                            <td className="py-3 px-3 text-right">{item.quantity}</td>
                            <td className="py-3 px-3 text-right">{currencySymbol}{item.unitPrice.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right">{Math.round(item.taxRate*100)}%</td>
                            <td className="py-3 px-3 text-right font-bold text-[#0A0D14]">{currencySymbol}{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end pt-4">
                      <div className="w-64 space-y-1.5 text-right font-semibold text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subtotal:</span>
                          <span className="text-slate-700">{currencySymbol}{invoiceData.items.reduce((s,i)=>s+i.amount,0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                        <div className="flex justify-between text-emerald-500 font-extrabold">
                          <span>Discount:</span>
                          <span>-{currencySymbol}0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">GST (18% inclusive):</span>
                          <span className="text-slate-700">{currencySymbol}{Math.round(invoiceData.items.reduce((s,i)=>s+i.amount,0) * 0.18 / 1.18).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                        <div className="border-t border-[#E9ECF5] pt-1.5 flex justify-between text-xs font-black">
                          <span className="text-[#0A0D14]">Total Paid:</span>
                          <span style={{ color: themeAccentHex }}>{currencySymbol}{invoiceData.items.reduce((s,i)=>s+i.amount,0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RECEIPT DETAIL VIEW */}
                {selectedDocType === "RECEIPT" && receiptData && (
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-50 border border-[#E9ECF5] rounded-2xl grid grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Receipt Item Title</span>
                        <span className="block text-xs font-bold text-slate-800 mt-1">{receiptData.title}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Category Group</span>
                        <span className="block text-xs font-bold text-slate-800 mt-1">{receiptData.category}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Transaction Location</span>
                        <span className="block text-[11px] text-slate-600 mt-1 font-semibold">{receiptData.location}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Transaction Notes</span>
                        <span className="block text-[11px] text-slate-600 mt-1 font-semibold">{receiptData.notes}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <div className="w-64 space-y-1.5 text-right font-semibold text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subtotal amount transacted:</span>
                          <span className="text-slate-700">{currencySymbol}{receiptData.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">GST (18% inclusive):</span>
                          <span className="text-slate-700">
                            {currencySymbol}{Math.round(receiptData.amount * 0.18 / 1.18).toLocaleString(undefined, {minimumFractionDigits:2})}
                          </span>
                        </div>
                        <div className="border-t border-[#E9ECF5] pt-1.5 flex justify-between text-xs font-black">
                          <span className="text-[#0A0D14]">Total Settled:</span>
                          <span style={{ color: themeAccentHex }}>{currencySymbol}{receiptData.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. INVESTMENT SIP STATEMENTS */}
                {selectedDocType === "INVESTMENT" && investmentData && (
                  <div className="space-y-6">
                    <table className="w-full text-left font-semibold">
                      <thead>
                        <tr className="bg-slate-50 text-[#0A0D14] border-y border-[#E9ECF5] text-[9px] font-extrabold uppercase">
                          <th className="py-2 px-3">Linked Goal (SIP)</th>
                          <th className="py-2 px-3">Target Date</th>
                          <th className="py-2 px-3 text-right">Target Amount</th>
                          <th className="py-2 px-3 text-right">Current Saved</th>
                          <th className="py-2 px-3 text-right">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10px] text-slate-700">
                        {investmentData.allocations.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-3 font-bold text-[#0A0D14]">{item.goalTitle}</td>
                            <td className="py-3 px-3">{item.targetDate || "Dec 2026"}</td>
                            <td className="py-3 px-3 text-right">{currencySymbol}{item.target.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-600">{currencySymbol}{item.saved.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-bold">{item.percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="p-4 bg-slate-50 border border-[#E9ECF5] rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Investment Summary</span>
                      <span className="text-xs font-black text-slate-800">
                        Total SIP Contributions: <span style={{ color: themeAccentHex }}>{currencySymbol}{investmentData.totalInvested.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. ACCOUNT STATEMENTS */}
                {selectedDocType === "ACCOUNT" && accountData && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Summary metrics row */}
                    <div className="p-4 bg-slate-50 border border-[#E9ECF5] rounded-2xl grid grid-cols-3 text-center divide-x divide-slate-200">
                      <div>
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Total Credited</span>
                        <span className="block text-sm font-black text-[#00C875] mt-1">{currencySymbol}{accountData.summary.totalIncome.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Total Expenses</span>
                        <span className="block text-sm font-black text-[#FF5A5F] mt-1">{currencySymbol}{accountData.summary.totalExpenses.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Net Accumulation</span>
                        <span className="block text-sm font-black mt-1" style={{ color: themeAccentHex }}>{currencySymbol}{accountData.summary.netSavings.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Budgets table */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-[#0A0D14] uppercase tracking-wide">Monthly Envelope Budgets</h4>
                      <table className="w-full text-left font-semibold">
                        <thead>
                          <tr className="bg-slate-50 text-[#0A0D14] border-y border-[#E9ECF5] text-[8.5px] font-bold uppercase">
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3 text-right">Ceiling Limit</th>
                            <th className="py-2 px-3 text-right">Spent to Date</th>
                            <th className="py-2 px-3 text-right">Utilization</th>
                            <th className="py-2 px-3 text-right">Status Alert</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[9.5px] text-slate-700">
                          {accountData.budgets.map((b, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 font-bold text-[#0A0D14]">{b.category}</td>
                              <td className="py-2.5 px-3 text-right">{currencySymbol}{b.limit.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-right">{currencySymbol}{b.spent.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-right">{b.percentage}%</td>
                              <td className="py-2.5 px-3 text-right font-black">
                                <span className={b.status === "Breached" ? "text-rose-500" : "text-emerald-500"}>{b.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Spendings list */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-[#0A0D14] uppercase tracking-wide">Top Discretionary Transactions</h4>
                      <table className="w-full text-left font-semibold">
                        <thead>
                          <tr className="bg-slate-50 text-[#0A0D14] border-y border-[#E9ECF5] text-[8.5px] font-bold uppercase">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Title Description</th>
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3">Method</th>
                            <th className="py-2 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[9.5px] text-slate-700">
                          {accountData.topSpends.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3">{item.date}</td>
                              <td className="py-2.5 px-3 font-bold text-[#0A0D14]">{item.title}</td>
                              <td className="py-2.5 px-3">{item.category}</td>
                              <td className="py-2.5 px-3">{item.method}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#0A0D14]">{currencySymbol}{item.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Section */}
                <div className="space-y-5 pt-8 border-t border-[#E9ECF5]">
                  {/* Digital verification seal info */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h5 className="text-[9px] font-extrabold uppercase tracking-wide" style={{ color: themeAccentHex }}>Digital Verification Seal</h5>
                      <p className="text-[8px] text-slate-400 font-semibold leading-relaxed">
                        Tamper-proof financial ledger hash. Scan QR code to verify validity.
                      </p>
                      <span className="block text-[8px] font-mono text-slate-350 font-bold bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        SECURE HASH: SHA256-EF938C20A10F4D32...
                      </span>
                    </div>

                    {/* Scan to verify indicators */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-[9px] font-extrabold text-[#0A0D14]">SCAN TO VERIFY</span>
                        <span className="block text-[7.5px] text-slate-400 font-bold mt-0.5">FinTrack RAG Network</span>
                      </div>
                      
                      {/* Vector QR code representation */}
                      <div className="w-14 h-14 bg-white border border-[#E9ECF5] p-1.5 rounded-lg flex flex-col justify-between overflow-hidden shadow-sm relative">
                        <div className="grid grid-cols-3 gap-0.5 w-full">
                          <div className="w-3.5 h-3.5 border-2 border-slate-800 rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-slate-800 rounded-xs" /></div>
                          <div className="w-3.5 h-3.5 flex flex-wrap gap-px p-0.5"><div className="w-1 h-1 bg-slate-800" /><div className="w-1 h-1 bg-slate-800" /></div>
                          <div className="w-3.5 h-3.5 border-2 border-slate-800 rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-slate-800 rounded-xs" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-0.5 w-full">
                          <div className="w-3 h-3 flex flex-wrap gap-px p-0.5"><div className="w-1 h-1 bg-slate-800" /><div className="w-1 h-1 bg-slate-800" /></div>
                          <div className="w-3 h-3 bg-slate-800 rounded-xs" />
                          <div className="w-3 h-3 flex flex-wrap gap-px p-0.5"><div className="w-1 h-1 bg-slate-800" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-0.5 w-full">
                          <div className="w-3.5 h-3.5 border-2 border-slate-800 rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-slate-800 rounded-xs" /></div>
                          <div className="w-3.5 h-3.5 bg-slate-800 rounded-xs" />
                          <div className="w-3.5 h-3.5 flex flex-wrap gap-px p-0.5"><div className="w-1 h-1 bg-slate-800" /><div className="w-1 h-1 bg-slate-800" /></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legal disclaimer */}
                  <div className="border-t border-[#E9ECF5] pt-4 text-[7.5px] text-slate-400 text-center leading-normal font-semibold">
                    FinTrack is a private local-first financial operating system. Digital records are fully encrypted.<br />
                    For billing support contact support@fintrack.io. Copyright 2026 FinTrack, Inc.
                  </div>
                </div>

              </div>
            ) : (
              /* EMAIL VIEW PREVIEW (Stripe/Notion style transactional HTML email) */
              <div className="w-full bg-[#F7F8FC] border border-[#E9ECF5] shadow-xl rounded-2xl mx-auto p-8 space-y-6 font-sans text-[#3C4257] text-xs max-w-[600px] leading-relaxed select-none">
                
                {/* Email Header */}
                <div className="bg-white border border-[#E9ECF5] rounded-xl p-6 space-y-6 text-left shadow-sm">
                  
                  {/* Brand Logo */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-[#6D5DFC] flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="font-extrabold text-sm text-[#0A0D14] tracking-tight">FinTrack System</span>
                  </div>

                  {/* Heading */}
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-[#0A0D14] tracking-tight">
                      Your {selectedDocType.toLowerCase()} statement from FinTrack
                    </h3>
                    <p className="text-slate-500 font-semibold text-[11px]">
                      Receipt Reference: <span className="font-bold text-[#0A0D14]">
                        {selectedDocType === "INVOICE" && invoiceData?.id}
                        {selectedDocType === "RECEIPT" && receiptData?.id}
                        {selectedDocType === "INVESTMENT" && investmentData?.id}
                        {selectedDocType === "ACCOUNT" && accountData?.id}
                      </span>
                    </p>
                  </div>

                  {/* Statement Box */}
                  <div className="p-4 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase">
                      <span>Statement Summary</span>
                      <span className="text-[#00C875]">SETTLED</span>
                    </div>

                    <div className="flex justify-between text-xs items-center font-bold text-slate-800">
                      <span>
                        {selectedDocType === "INVOICE" && "Subscription Pro Monthly"}
                        {selectedDocType === "RECEIPT" && receiptData?.title}
                        {selectedDocType === "INVESTMENT" && "Monthly SIP Allocations"}
                        {selectedDocType === "ACCOUNT" && `${accountData?.monthName} Summary`}
                      </span>
                      <span className="text-base font-black" style={{ color: themeAccentHex }}>
                        {selectedDocType === "INVOICE" && `${currencySymbol}${invoiceData?.items[0].amount.toLocaleString()}`}
                        {selectedDocType === "RECEIPT" && `${currencySymbol}${receiptData?.amount.toLocaleString()}`}
                        {selectedDocType === "INVESTMENT" && `${currencySymbol}${investmentData?.totalInvested.toLocaleString()}`}
                        {selectedDocType === "ACCOUNT" && `${currencySymbol}${accountData?.summary.netSavings.toLocaleString()}`}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                      This transaction is synchronized in your local ledger wallet. Download the PDF statement below to archive or submit for corporate business taxes.
                    </p>
                  </div>

                  {/* CTA button */}
                  <div className="text-center pt-2">
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-1.5 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md shadow-[#6D5DFC]/10 hover:scale-102 transition-all cursor-pointer"
                      style={{ backgroundColor: themeAccentHex }}
                    >
                      Download PDF Copy <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Email Footer */}
                <div className="text-center text-[9px] text-slate-400 space-y-1 font-semibold">
                  <p>Sent securely via FinTrack Mailers.</p>
                  <p>100 Pine Street, Suite 2400, San Francisco, CA 94111, USA</p>
                  <div className="space-x-2 pt-1">
                    <a href="#privacy" className="underline">Privacy Policy</a>
                    <span>·</span>
                    <a href="#terms" className="underline">Terms of Service</a>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 bg-slate-900 text-white text-xs font-semibold px-4 py-3.5 rounded-2xl shadow-xl border border-slate-800">
          {toastType === "success" && <span className="w-1.5 h-1.5 rounded-full bg-[#00C875]" />}
          {toastType === "info" && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
          {toastType === "warning" && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A5F]" />}
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
