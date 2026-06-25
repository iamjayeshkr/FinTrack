"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  User,
  Settings,
  Shield,
  Key,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Globe,
  PlusCircle,
  Trash2,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
  ChevronRight,
  Database
} from "lucide-react";

type ActiveTab = "profile" | "preferences" | "security" | "api" | "billing";

interface ApiKey {
  id: string;
  name: string;
  token: string;
  created: string;
}

export default function SettingsPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  // State managers
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Profile settings
  const [professionalTitle, setProfessionalTitle] = useState("Wealth Architect / Founder");
  const [workspaceName, setWorkspaceName] = useState("Finance Core Hub");
  const [bio, setBio] = useState("Managing personal seed capital and growth investments.");

  // Preferences
  const [currency, setCurrency] = useState("INR");
  const [savingsTarget, setSavingsTarget] = useState(35);
  const [defaultMethod, setDefaultMethod] = useState("UPI");

  // Security settings
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  // Developer Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");

  // Billing states
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "enterprise">("free");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync preferences and subscription with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPlan = (localStorage.getItem("fintrack_plan") || "free") as "free" | "pro" | "enterprise";
      setCurrentPlan(storedPlan);

      const storedCurrency = localStorage.getItem("fintrack_currency") || "INR";
      setCurrency(storedCurrency);

      const storedTarget = localStorage.getItem("fintrack_savings_target");
      if (storedTarget) setSavingsTarget(parseInt(storedTarget));

      const storedKeys = localStorage.getItem("fintrack_api_keys");
      if (storedKeys) setApiKeys(JSON.parse(storedKeys));
    }
  }, []);

  const handleSavePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_currency", currency);
      localStorage.setItem("fintrack_savings_target", savingsTarget.toString());
      window.dispatchEvent(new Event("storage"));
      showToast("Financial preferences updated successfully!");
    }
  };

  const handleUpdateProfile = () => {
    showToast("Profile details updated successfully!");
  };

  // Subscription upgrade/downgrade
  const handleUpdatePlan = (plan: "free" | "pro" | "enterprise") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_plan", plan);
      setCurrentPlan(plan);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("fintrack_plan_changed"));
      showToast(`Subscription plan updated to ${plan.toUpperCase()}!`);
    }
  };

  // API Token management
  const handleGenerateKey = () => {
    if (!newKeyName.trim()) return;
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    const token = `ft_live_${rand}_${Math.random().toString(36).substring(2, 18)}`;
    const newKey: ApiKey = {
      id: Math.random().toString(),
      name: newKeyName,
      token,
      created: new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })
    };

    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    setNewKeyName("");
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_api_keys", JSON.stringify(updated));
    }
    showToast("New API Access Token generated successfully!");
  };

  const handleRevokeKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("fintrack_api_keys", JSON.stringify(updated));
    }
    showToast("API Access Token revoked.");
  };

  const toggleShowToken = (id: string) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
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
            Control Center
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A0D14] tracking-tight mt-3">
            System & Account Settings
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Configure default currency, modify cloud sync triggers, rotate keys, and upgrade plans.
          </p>
        </div>
      </section>

      {/* Sub-Layout: Side Tabs & Settings Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          {[
            { id: "profile", label: "Profile & Account", icon: User },
            { id: "preferences", label: "Financial Preferences", icon: Globe },
            { id: "security", label: "Security & Sessions", icon: Shield },
            { id: "api", label: "Developer Keys", icon: Key },
            { id: "billing", label: "Billing & Plans", icon: CreditCard }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                  active 
                    ? "bg-[#6D5DFC] text-white shadow-md shadow-[#6D5DFC]/10" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-[#F7F8FC]"
                }`}
              >
                <tab.icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Box */}
        <main className="md:col-span-3 bg-white border border-[#E9ECF5] rounded-2xl shadow-sm p-6 md:p-8 space-y-8">
          
          {/* TAB 1: PROFILE & ACCOUNT */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="border-b border-[#E9ECF5] pb-4">
                <h2 className="text-lg font-black text-[#0A0D14]">Profile & Workspace Details</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Control how your details appear inside the FinTrack ledger.</p>
              </div>

              {/* Avatar View */}
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.imageUrl || "/profile.png"}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[#E9ECF5] shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#0A0D14]">{user?.fullName || "Rudransh Kumar"}</h3>
                  <p className="text-xs text-slate-400 font-semibold">{user?.primaryEmailAddress?.emailAddress || "bituofficial44@gmail.com"}</p>
                  <span className="inline-block bg-[#00C875]/10 text-[#00C875] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#00C875]/20 mt-1.5">
                    Clerk Managed Authentication
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Title</label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    className="w-full bg-[#F8FAF9] border border-[#E9ECF5] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Namespace</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-[#F8FAF9] border border-[#E9ECF5] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 text-slate-700"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-[#F8FAF9] border border-[#E9ECF5] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 text-slate-700"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                className="px-5 py-2.5 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#6D5DFC]/10 hover:shadow-lg cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          )}

          {/* TAB 2: FINANCIAL PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="border-b border-[#E9ECF5] pb-4">
                <h2 className="text-lg font-black text-[#0A0D14]">Financial Preferences</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Define your core currency parameters and monthly savings targets.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Currency Format</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#F8FAF9] border border-[#E9ECF5] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 text-slate-700 cursor-pointer"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Default Ledger Payment Method</label>
                  <select
                    value={defaultMethod}
                    onChange={(e) => setDefaultMethod(e.target.value)}
                    className="w-full bg-[#F8FAF9] border border-[#E9ECF5] focus:bg-white px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 text-slate-700 cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Target Savings Rate Velocity</label>
                    <span className="text-xs font-black text-[#6D5DFC]">{savingsTarget}% of income</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={savingsTarget}
                    onChange={(e) => setSavingsTarget(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#E9ECF5] rounded-lg appearance-none cursor-pointer accent-[#6D5DFC]"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Higher savings rate indexes will dynamically increase your financial health metrics on dashboards and reports.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#6D5DFC]/10 hover:shadow-lg cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* TAB 3: SECURITY & SESSIONS */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-[#E9ECF5] pb-4">
                <h2 className="text-lg font-black text-[#0A0D14]">Security & Audits</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Toggle authentication options and verify active sessions.</p>
              </div>

              {/* 2FA Panel */}
              <div className="flex items-center justify-between p-4 bg-[#F8FAF9] border border-[#E9ECF5] rounded-2xl">
                <div className="flex gap-3">
                  <Smartphone className="w-8 h-8 text-[#6D5DFC] shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-[#0A0D14]">Two-Factor Token Authentication</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Require an OTP verification code during login cycles.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIs2FAEnabled(!is2FAEnabled);
                    showToast(is2FAEnabled ? "Two-Factor Authentication disabled." : "Two-Factor Authentication enabled.");
                  }}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    is2FAEnabled ? "bg-[#00C875]" : "bg-slate-300"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                    is2FAEnabled ? "translate-x-6" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Active Logins Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Workspace Sessions</h3>
                <div className="border border-[#E9ECF5] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAF9] text-[9px] text-slate-400 font-bold uppercase tracking-wider border-b border-[#E9ECF5]">
                        <th className="py-2.5 px-4">Location</th>
                        <th className="py-2.5 px-4">Device/Client</th>
                        <th className="py-2.5 px-4">IP Address</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECF5]">
                      <tr>
                        <td className="py-3 px-4 font-bold text-[#0A0D14]">Bengaluru, India</td>
                        <td className="py-3 px-4 text-slate-500 font-semibold">Safari on macOS</td>
                        <td className="py-3 px-4 text-slate-400 font-semibold">103.45.192.12</td>
                        <td className="py-3 px-4 text-right"><span className="text-[9px] font-black text-[#00C875] bg-[#00C875]/10 px-2 py-0.5 rounded-full">ACTIVE NOW</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-[#0A0D14]">Delhi, India</td>
                        <td className="py-3 px-4 text-slate-500 font-semibold">Chrome on Android</td>
                        <td className="py-3 px-4 text-slate-400 font-semibold">223.189.44.87</td>
                        <td className="py-3 px-4 text-right"><span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">2 HOURS AGO</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVELOPER KEYS */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="border-b border-[#E9ECF5] pb-4">
                <h2 className="text-lg font-black text-[#0A0D14]">Developer Personal Tokens</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Integrate and synchronize FinTrack ledger details with external code or APIs.</p>
              </div>

              {/* Generate New Key Form */}
              <div className="flex gap-3 bg-[#F8FAF9] p-4 border border-[#E9ECF5] rounded-2xl">
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Token Label (e.g. Server Sync Key)..."
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-white border border-[#E9ECF5] px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 text-slate-700"
                  />
                </div>
                <button
                  onClick={handleGenerateKey}
                  className="flex items-center gap-1.5 px-4 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#6D5DFC]/10 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </button>
              </div>

              {/* API Keys List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tokens ({apiKeys.length})</h3>
                {apiKeys.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-[#E9ECF5] rounded-xl text-slate-400 text-xs font-semibold">
                    No developer tokens generated yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map(key => (
                      <div key={key.id} className="flex items-center justify-between p-3.5 border border-[#E9ECF5] rounded-xl hover:border-slate-300">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-[#0A0D14]">{key.name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                            <span>Created {key.created}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500 bg-slate-50 px-1 rounded">
                              {showTokens[key.id] ? key.token : `${key.token.slice(0, 10)}••••••••••••`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleShowToken(key.id)}
                            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Toggle Visibility"
                          >
                            {showTokens[key.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(key.token)}
                            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Copy Key"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Revoke Token"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BILLING & PLANS */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="border-b border-[#E9ECF5] pb-4">
                <h2 className="text-lg font-black text-[#0A0D14]">Billing & Subscription tier</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Control your workspace limits and billing options.</p>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 shadow-sm relative ${
                  currentPlan === "free" ? "border-[#6D5DFC] bg-[#6D5DFC]/5" : "border-[#E9ECF5] bg-white"
                }`}>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Starter</span>
                    <h3 className="text-base font-black text-[#0A0D14] mt-1">Free Space</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-2 leading-relaxed">
                      100KB Local database, basic cashflow charts, and AI Advice checkups.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xl font-black text-[#0A0D14]">₹0</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Forever Free</span>
                  </div>
                  <button
                    onClick={() => handleUpdatePlan("free")}
                    disabled={currentPlan === "free"}
                    className={`w-full py-2 text-[10px] font-black uppercase rounded-lg tracking-wider text-center cursor-pointer transition-all ${
                      currentPlan === "free" 
                        ? "bg-[#6D5DFC]/10 text-[#6D5DFC] cursor-not-allowed" 
                        : "bg-white border border-[#E9ECF5] hover:border-slate-400 text-slate-700"
                    }`}
                  >
                    {currentPlan === "free" ? "Active Tier" : "Downgrade"}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 shadow-sm relative ${
                  currentPlan === "pro" ? "border-[#6D5DFC] bg-[#6D5DFC]/5" : "border-[#E9ECF5] bg-white"
                }`}>
                  <div className="absolute -top-3 right-4 bg-[#6D5DFC] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">POPULAR</div>
                  <div>
                    <span className="text-[9px] font-black text-[#6D5DFC] uppercase tracking-widest block">Compounding</span>
                    <h3 className="text-base font-black text-[#0A0D14] mt-1">Pro Workspace</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-2 leading-relaxed">
                      10MB Storage, unlimited transactions, advanced PDF statements, and full metrics.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xl font-black text-[#0A0D14]">₹799</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Per month</span>
                  </div>
                  <button
                    onClick={() => handleUpdatePlan("pro")}
                    disabled={currentPlan === "pro"}
                    className={`w-full py-2 text-[10px] font-black uppercase rounded-lg tracking-wider text-center cursor-pointer transition-all ${
                      currentPlan === "pro" 
                        ? "bg-[#6D5DFC]/10 text-[#6D5DFC] cursor-not-allowed" 
                        : "bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white shadow-md shadow-[#6D5DFC]/10"
                    }`}
                  >
                    {currentPlan === "pro" ? "Active Tier" : "Upgrade Pro"}
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 shadow-sm relative ${
                  currentPlan === "enterprise" ? "border-[#6D5DFC] bg-[#6D5DFC]/5" : "border-[#E9ECF5] bg-white"
                }`}>
                  <div>
                    <span className="text-[9px] font-black text-[#00C875] uppercase tracking-widest block">Corporation</span>
                    <h3 className="text-base font-black text-[#0A0D14] mt-1">Enterprise Treasury</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-2 leading-relaxed">
                      Cloud DB integration, Neon server synch, team controls, and dedicated support.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xl font-black text-[#0A0D14]">₹4,999</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Per month</span>
                  </div>
                  <button
                    onClick={() => handleUpdatePlan("enterprise")}
                    disabled={currentPlan === "enterprise"}
                    className={`w-full py-2 text-[10px] font-black uppercase rounded-lg tracking-wider text-center cursor-pointer transition-all ${
                      currentPlan === "enterprise" 
                        ? "bg-[#6D5DFC]/10 text-[#6D5DFC] cursor-not-allowed" 
                        : "bg-white border border-[#E9ECF5] hover:border-slate-400 text-slate-700"
                    }`}
                  >
                    {currentPlan === "enterprise" ? "Active Tier" : "Upgrade Treasury"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
