"use client";

import React, { useState, useEffect } from "react";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const plan = localStorage.getItem("fintrack_plan") || "free";
      setCurrentPlan(plan as "free" | "pro");
    }
  }, []);

  const handleSelectPlan = (plan: "free" | "pro") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_plan", plan);
      setCurrentPlan(plan);
      // Dispatch a storage event to update layout sidebar and other states immediately
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("fintrack_plan_changed"));
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Billing & Subscription
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your subscription plans, billing cycle, and premium SaaS upgrades.
        </p>
      </header>

      {/* Plan Status Banner */}
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all ${
        currentPlan === "pro" 
          ? "bg-indigo-50/50 border-indigo-100" 
          : "bg-slate-50 border-slate-200"
      }`}>
        <div>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            currentPlan === "pro" 
              ? "bg-indigo-100 text-indigo-700" 
              : "bg-slate-200 text-slate-600"
          }`}>
            Current Active Plan: {currentPlan.toUpperCase()}
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            {currentPlan === "pro" 
              ? "FinTrack Pro Subscription Active" 
              : "You are currently on the Free Plan"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentPlan === "pro" 
              ? "Thank you for supporting FinTrack! You have full access to unlimited transactions, AI insights, and CSV data exports." 
              : "Upgrade to unlock unlimited ledger entries, dynamic AI wealth projections, and tabular Excel-compatible CSV downloads."}
          </p>
        </div>
        {currentPlan === "pro" && (
          <button 
            onClick={() => handleSelectPlan("free")}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex text-xs">
          <button 
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-md font-semibold transition-all ${
              billingCycle === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button 
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === "yearly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Yearly Billing
            <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Plan Card */}
        <div className={`glass-card p-6 rounded-xl border flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all ${
          currentPlan === "free" ? "ring-2 ring-indigo-500/20 border-slate-300" : ""
        }`}>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Basic Free Plan</h3>
            <p className="text-xs text-slate-400 mt-1">For basic tracking and expense logs.</p>
            <div className="mt-4 flex items-baseline gap-1 text-slate-900">
              <span className="text-3xl font-extrabold">₹0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>
            
            <ul className="mt-6 space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Track up to 5 transactions
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Category budgeting & target goals
              </li>
              <li className="flex items-center gap-2 text-slate-400 line-through">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                AI Insights & wealth analytics
              </li>
              <li className="flex items-center gap-2 text-slate-400 line-through">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                CSV Export & financial audit logs
              </li>
            </ul>
          </div>
          
          <button 
            disabled={currentPlan === "free"}
            onClick={() => handleSelectPlan("free")}
            className={`w-full mt-8 py-2.5 rounded-lg text-xs font-bold transition-all ${
              currentPlan === "free" 
                ? "bg-slate-100 text-slate-400 cursor-default" 
                : "bg-slate-800 hover:bg-slate-900 text-white shadow-sm"
            }`}
          >
            {currentPlan === "free" ? "Active Plan" : "Downgrade to Free"}
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className={`glass-card p-6 rounded-xl border-2 flex flex-col justify-between shadow-md relative hover:shadow-lg transition-all ${
          currentPlan === "pro" 
            ? "border-indigo-600 bg-white" 
            : "border-slate-200 hover:border-slate-300 bg-white"
        }`}>
          {/* Best Value Badge */}
          <span className="absolute -top-3 right-6 text-[9px] bg-indigo-600 text-white font-bold px-2 py-0.75 rounded-full uppercase tracking-wider">
            Most Popular
          </span>

          <div>
            <h3 className="font-bold text-lg text-slate-850 text-slate-900">FinTrack Pro Plan</h3>
            <p className="text-xs text-slate-400 mt-1">For serious wealth builders.</p>
            <div className="mt-4 flex items-baseline gap-1 text-slate-900">
              <span className="text-3xl font-extrabold">
                {billingCycle === "monthly" ? "₹799" : "₹6,399"}
              </span>
              <span className="text-xs text-slate-400">
                / {billingCycle === "monthly" ? "month" : "year"}
              </span>
            </div>
            
            <ul className="mt-6 space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited ledger entries
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited budgeting envelopes & savings goals
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                AI Insights & wealth projections
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                CSV Export & audit log downloads
              </li>
            </ul>
          </div>
          
          <button 
            onClick={() => handleSelectPlan(currentPlan === "pro" ? "free" : "pro")}
            className={`w-full mt-8 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              currentPlan === "pro" 
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
            }`}
          >
            {currentPlan === "pro" ? "Downgrade Plan" : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}
