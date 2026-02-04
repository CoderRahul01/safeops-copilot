"use client";

import React from "react";
import { AlertTriangle, ShieldCheck, List, Gauge, Zap } from "lucide-react";

// --- A. SafetyCard ---
export const SafetyCard = ({ 
  riskLevel, 
  message, 
  costDelta,
  onStop 
}: { 
  riskLevel: 'danger' | 'warning', 
  message: string, 
  costDelta?: string,
  onStop: () => void 
}) => (
  <div className={`p-6 rounded-3xl border-2 transition-all shadow-xl relative overflow-hidden group
    ${riskLevel === 'danger' 
      ? 'bg-red-50 dark:bg-red-900/10 border-red-500/50 text-red-900 dark:text-red-100 ring-4 ring-red-500/10' 
      : 'bg-amber-50 dark:bg-amber-900/10 border-amber-500/50 text-amber-900 dark:text-amber-100'
    }`}
  >
    {riskLevel === 'danger' && (
      <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
    )}
    <div className="flex items-start gap-4 relative z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
        ${riskLevel === 'danger' 
          ? 'bg-red-500 text-white animate-bounce-subtle' 
          : 'bg-amber-500 text-white'}`}
      >
        {riskLevel === 'danger' ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
            {riskLevel === 'danger' ? '🚨 Critical Safety Alert' : '⚠️ Warning'}
          </h3>
          {costDelta && (
            <span className="text-xs font-black bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
              {costDelta} OVER
            </span>
          )}
        </div>
        <p className="text-lg font-bold leading-tight mb-6">{message}</p>
        <button 
          onClick={onStop}
          className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all w-full sm:w-auto flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95
            ${riskLevel === 'danger' 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30' 
              : 'bg-black dark:bg-white text-white dark:text-black shadow-lg'}`}
        >
          {riskLevel === 'danger' ? 'Stop Massive Waste Now' : 'Stop Waste'}
          <Zap className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  </div>
);

// --- B. DeployGuard ---
import { ThumbsDown, CheckCircle2, Lock } from "lucide-react";

export const DeployGuard = ({ 
  safeToDeploy, 
  reason 
}: { 
  safeToDeploy: boolean, 
  reason?: string 
}) => (
  <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500
    ${safeToDeploy 
      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30' 
      : 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-90'
    }`}
  >
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform duration-500
          ${safeToDeploy 
            ? 'bg-emerald-500 text-white rotate-0' 
            : 'bg-zinc-800 text-zinc-400 rotate-12'}`}
        >
          {safeToDeploy ? <CheckCircle2 className="w-8 h-8" /> : <ThumbsDown className="w-8 h-8" />}
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Status</p>
          <span className={`text-xs font-bold px-3 py-1 rounded-full 
            ${safeToDeploy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {safeToDeploy ? 'READY' : 'BLOCKED'}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black tracking-tight mb-2">
          {safeToDeploy ? 'Deployment Permitted' : 'Deployment Guard Active'}
        </h3>
        <p className="text-sm font-medium text-zinc-500 leading-relaxed min-h-[40px]">
          {safeToDeploy 
            ? 'All safety checks passed. Your current spend is within the free tier limits.' 
            : reason || 'Deployment blocked due to high waste risk. Stop services to resume.'}
        </p>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800">
        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 relative
          ${safeToDeploy ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm
            ${safeToDeploy ? 'translate-x-4' : 'translate-x-0'}`} 
          />
        </div>
        <div>
          <p className="text-xs font-bold">Safe Deploy Mode</p>
          <p className="text-[10px] text-zinc-500 font-medium">Automatic block on overspend</p>
        </div>
        {!safeToDeploy && <Lock className="w-4 h-4 ml-auto text-zinc-400" />}
      </div>
    </div>
  </div>
);

// --- C. ResourceList ---
import { Trash2, TrendingDown, TrendingUp, Filter } from "lucide-react";

export const ResourceList = ({ 
  resources,
  onKill
}: { 
  resources: Array<{ id: string, name: string, cloud: string, cost: number, waste: number }>,
  onKill: (id: string) => void
}) => (
  <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
          <List className="w-5 h-5 text-zinc-500" />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-tight uppercase tracking-[0.1em]">Active Inventory</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{resources.length} Services Running</p>
        </div>
      </div>
      <button className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
        <Filter className="w-4 h-4 text-zinc-500" />
      </button>
    </div>

    <div className="space-y-3">
      {resources.map(res => (
        <div key={res.id} className="group flex items-center justify-between p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 hover:border-red-500/30 transition-all hover:translate-x-1">
          <div className="flex items-center gap-4">
            <div className={`w-2 h-10 rounded-full ${res.waste > 70 ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <div>
              <p className="text-sm font-black tracking-tight">{res.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{res.cloud}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[10px] text-zinc-500 font-bold">{res.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black">${res.cost.toFixed(2)}/mo</p>
              <div className="flex items-center justify-end gap-1">
                {res.waste > 70 ? <TrendingUp className="w-3 h-3 text-red-500" /> : <TrendingDown className="w-3 h-3 text-emerald-500" />}
                <p className={`text-[10px] font-black ${res.waste > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {res.waste}% Waste
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => onKill(res.id)}
              className="p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/5 transition-all shadow-sm"
              title="Stop Service"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- D. StatusMeter ---
export const StatusMeter = ({ 
  freeTierUsed, 
  usedAmount,
  totalLimit,
  safe 
}: { 
  freeTierUsed: number, 
  usedAmount?: number,
  totalLimit?: number,
  safe: boolean 
}) => {
  const percentage = Math.min(freeTierUsed, 100);
  const strokeDasharray = 314.16; // 2 * PI * r (r=50)
  const strokeDashoffsetValue = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="p-8 rounded-[2.5rem] bg-zinc-900 text-white shadow-2xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] transition-colors duration-1000
        ${safe ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} 
      />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
            <Gauge className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Free Tier Pulse</h3>
            <p className="text-xs font-bold">Real-time Safety Status</p>
          </div>
        </div>
        {!safe && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full animate-pulse shadow-lg shadow-red-500/50">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Unsafe</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8 relative z-10">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <circle
              cx="64" cy="64" r="50"
              className="stroke-zinc-800 fill-none"
              strokeWidth="12"
            />
            <circle
              cx="64" cy="64" r="50"
              className={`fill-none transition-all duration-1000 ease-out
                ${safe ? 'stroke-emerald-500' : 'stroke-red-500'}`}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffsetValue}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black leading-none">{percentage}%</span>
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Used</span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.1em] mb-1">Consumption</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black">${usedAmount?.toFixed(2) || (totalLimit ? (totalLimit * (percentage/100)).toFixed(2) : '0.00')}</span>
              <span className="text-xs text-zinc-500 font-bold">/ ${totalLimit?.toFixed(0) || '100'}</span>
            </div>
          </div>
          
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000
                ${safe ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LOADING STATES (Shadcn-lite) ---
import { Skeleton } from "./ui/Skeleton";

export const SafetyCardLoading = () => (
  <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4">
    <div className="flex gap-4">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
    <Skeleton className="h-10 w-32 rounded-xl" />
  </div>
);

export const DeployGuardLoading = () => (
  <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-4">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-2 w-16" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

export const ResourceListLoading = () => (
  <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 space-y-6">
    <div className="flex items-center gap-2">
      <Skeleton className="w-4 h-4 rounded-sm" />
      <Skeleton className="h-3 w-24" />
    </div>
    {[1, 2].map(i => (
      <div key={i} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-16" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-2 w-12 ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

export const StatusMeterLoading = () => (
  <div className="p-6 rounded-3xl bg-zinc-900 shadow-2xl space-y-4">
    <div className="flex justify-between">
      <Skeleton className="w-20 h-3 bg-zinc-800" />
      <Skeleton className="w-12 h-3 bg-zinc-800" />
    </div>
    <Skeleton className="w-full h-3 bg-zinc-800 rounded-full" />
    <div className="flex justify-between items-end">
      <Skeleton className="w-16 h-8 bg-zinc-800" />
      <Skeleton className="w-24 h-2 bg-zinc-800" />
    </div>
  </div>
);
