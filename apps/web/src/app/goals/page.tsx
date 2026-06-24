"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LocalStorageGoalRepository,
} from "../../infrastructure/db/local-storage-repositories";
import { Goal } from "../../domain/entities/goal";
import { Money } from "../../domain/value-objects/money";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  // Form states
  const [glTitle, setGlTitle] = useState("");
  const [glTarget, setGlTarget] = useState("");

  const glRepo = useMemo(() => new LocalStorageGoalRepository(), []);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const gls = await glRepo.findByUserId("user1");
    setGoals(gls);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!glTitle || !glTarget) return;

    const goal = new Goal(
      Math.random().toString(),
      "user1",
      glTitle,
      new Money(parseFloat(glTarget)),
      new Money(0),
      null
    );

    await glRepo.save(goal);
    setGlTitle("");
    setGlTarget("");
    refreshData();
  };

  const handleDeleteGoal = async (id: string) => {
    await glRepo.delete(id);
    refreshData();
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Savings Goals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and project target saving milestones.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Forms */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Establish Target</h3>
            <form onSubmit={handleAddGoal} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Goal Target Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save for MacBook"
                  value={glTitle}
                  onChange={(e) => setGlTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="80000"
                  value={glTarget}
                  onChange={(e) => setGlTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all text-xs shadow-sm"
              >
                Create Target Goal
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Goals Grid */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-xl shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-800">Savings Targets Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(g => {
                const percentage = g.getProgressPercentage();
                return (
                  <div key={g.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between gap-4">
                    <div className="text-xs">
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-slate-800 text-sm">{g.title}</div>
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="text-rose-600 hover:text-rose-700 font-semibold text-[10px] hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-slate-500 mt-2">Target: ₹{g.targetAmount.amount.toLocaleString()}</div>
                      <div className="text-indigo-600 font-semibold mt-0.5">Saved: ₹{g.currentAmount.amount.toLocaleString()}</div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="bg-indigo-600 h-full rounded-full"
                        ></div>
                      </div>
                      <div className="text-[10px] text-right text-slate-500 font-medium">{percentage}% Completed</div>
                    </div>
                  </div>
                );
              })}
              {goals.length === 0 && (
                <div className="col-span-2 text-center text-slate-400 py-12 text-sm">
                  No saving goals established. Create one on the left to start tracking.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
