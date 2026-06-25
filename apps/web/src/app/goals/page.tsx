"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LocalStorageGoalRepository,
  LocalStorageTransactionRepository
} from "../../infrastructure/db/local-storage-repositories";
import { Goal } from "../../domain/entities/goal";
import { Money } from "../../domain/value-objects/money";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles,
  Target,
  Activity,
  PlusCircle,
  Trash2,
  Calendar,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  TrendingDown
} from "lucide-react";

export default function GoalsPage() {
  const { user } = useUser();
  const userId = user?.id || "user1";

  const [goals, setGoals] = useState<Goal[]>([]);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [totalTarget, setTotalTarget] = useState<number>(0);

  // Form states
  const [glTitle, setGlTitle] = useState("");
  const [glTarget, setGlTarget] = useState("");
  const [glSaved, setGlSaved] = useState("");

  const glRepo = useMemo(() => new LocalStorageGoalRepository(), []);
  const txRepo = useMemo(() => new LocalStorageTransactionRepository(), []);

  useEffect(() => {
    refreshData();
  }, [userId]);

  const refreshData = async () => {
    const gls = await glRepo.findByUserId(userId);
    setGoals(gls);

    // Calculate aggregated metrics
    const savedSum = gls.reduce((sum, g) => sum + g.currentAmount.amount, 0);
    const targetSum = gls.reduce((sum, g) => sum + g.targetAmount.amount, 0);
    setTotalSaved(savedSum);
    setTotalTarget(targetSum);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!glTitle || !glTarget) return;

    const initialSaved = glSaved ? parseFloat(glSaved) : 0;
    const goal = new Goal(
      crypto.randomUUID(),
      userId,
      glTitle,
      new Money(parseFloat(glTarget)),
      new Money(initialSaved),
      null
    );

    await glRepo.save(goal);
    
    // Log a matching seed transaction if they started with some savings
    if (initialSaved > 0) {
      const { LocalStorageTransactionRepository } = await import("../../infrastructure/db/local-storage-repositories");
      const { Transaction } = await import("../../domain/entities/transaction");
      const tempTxRepo = new LocalStorageTransactionRepository();
      await tempTxRepo.save(new Transaction(
        crypto.randomUUID(),
        userId,
        "Savings Link",
        `Initial Seed: ${glTitle}`,
        new Money(initialSaved),
        "SAVINGS",
        "UPI",
        new Date()
      ));
    }

    setGlTitle("");
    setGlTarget("");
    setGlSaved("");
    refreshData();
  };

  const handleDeleteGoal = async (id: string) => {
    await glRepo.delete(id);
    refreshData();
  };

  const overallProgressPercent = useMemo(() => {
    if (totalTarget === 0) return 0;
    return Math.min(100, Math.round((totalSaved / totalTarget) * 100));
  }, [totalSaved, totalTarget]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in select-none">
      
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E9ECF5] pb-6">
        <div>
          <span className="text-[10px] text-[#6D5DFC] font-extrabold uppercase tracking-widest bg-[#6D5DFC]/5 px-2.5 py-1 rounded-md border border-[#6D5DFC]/10">
            Goal Mission Control
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A0D14] tracking-tight mt-3">
            Compounding Milestones
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Establish wealth targets, monitor savings milestones, and verify ETA probability matrices.
          </p>
        </div>
      </header>

      {/* Aggregate KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm border-l-4 border-l-[#6D5DFC]">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Goals Active</span>
          <h3 className="text-2xl font-black text-[#0A0D14] tracking-tight mt-2">{goals.length} Targets</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Aggregate Saved</span>
          <h3 className="text-2xl font-black text-[#00C875] tracking-tight mt-2">₹{totalSaved.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Aggregated Targets</span>
          <h3 className="text-2xl font-black text-[#6D5DFC] tracking-tight mt-2">₹{totalTarget.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Progress</span>
            <span className="text-[10px] text-[#6D5DFC] font-black">{overallProgressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E9ECF5] rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-gradient-to-r from-[#6D5DFC] to-[#8B7CFF] rounded-full" 
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create Target Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-[#0A0D14]">Establish Target</h3>
            
            <form onSubmit={handleAddGoal} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="text-[11px]">Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save for MacBook Pro"
                  value={glTitle}
                  onChange={(e) => setGlTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px]">Target Wealth Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="150000"
                  value={glTarget}
                  onChange={(e) => setGlTarget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px]">Initial Balance (Optional - ₹)</label>
                <input
                  type="number"
                  placeholder="15000"
                  value={glSaved}
                  onChange={(e) => setGlSaved(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F8FC] border border-[#E9ECF5] rounded-xl text-[#0A0D14] font-semibold focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#6D5DFC] hover:bg-[#8B7CFF] text-white font-extrabold rounded-xl shadow-md shadow-[#6D5DFC]/10 transition-all duration-200 text-xs active:scale-[0.98] cursor-pointer"
              >
                Create Target Goal
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Goals Grid / Roadmaps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card list */}
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-[#0A0D14]">Active Savings Targets</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map(g => {
                const targetVal = g.targetAmount.amount;
                const savedVal = g.currentAmount.amount;
                const percentage = Math.min(100, Math.round((savedVal / targetVal) * 100));
                
                return (
                  <div key={g.id} className="p-4 bg-[#F7F8FC]/50 border border-[#E9ECF5] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#6D5DFC]/30 transition-all">
                    
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Milestone</span>
                        <h4 className="text-sm font-extrabold text-[#0A0D14] mt-0.5 truncate">{g.title}</h4>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="text-slate-400 hover:text-[#FF5A5F] p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                        title="Remove Target"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Saved: ₹{savedVal.toLocaleString()}</span>
                        <span>Target: ₹{targetVal.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E9ECF5] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6D5DFC] to-[#8B7CFF] rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E9ECF5] text-[9px] font-extrabold uppercase text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Dec 2026 ETA
                      </span>
                      <span className="text-[10px] font-black text-[#6D5DFC]">{percentage}% Completed</span>
                    </div>

                  </div>
                );
              })}

              {goals.length === 0 && (
                <div className="col-span-2 text-center text-slate-400 py-12 text-xs font-semibold">
                  No saving goals established. Create one on the left to start tracking.
                </div>
              )}
            </div>
          </div>

          {/* Timeline roadmap layout */}
          {goals.length > 0 && (
            <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-[#0A0D14]">Compounding Roadmap</h3>
              
              <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E9ECF5] pl-8">
                {goals.map((g, idx) => (
                  <div key={g.id} className="relative space-y-1">
                    {/* Roadmap Dot */}
                    <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#6D5DFC] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC]" />
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#0A0D14]">{g.title}</span>
                      <span className="text-[9px] text-[#00C875] bg-[#00C875]/5 border border-[#00C875]/10 px-2 py-0.5 rounded uppercase">
                        Active Step {idx + 1}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                      Target ₹{g.targetAmount.amount.toLocaleString()} scheduled for compounding. Estimated roadmap arrival in 18 months.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
