"use client";

import React from "react";
import { useTamboComponentState } from "@tambo-ai/react";

/**
 * SafeOps Monochrome Components
 * Designed for high impact, zero-fluff B&W aesthetic.
 */

// 1. Safety Card: High-level status
export function SafetyCard({ data, recommendation, isLoading }: { data: { totalSpend: number, budget: number }, recommendation?: string, isLoading: boolean }) {
  if (isLoading) return <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />;

  const isHealthy = data?.totalSpend < (data?.budget || 100);

  return (
    <div className="border-4 border-foreground p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 ${isHealthy ? 'bg-zinc-100 text-foreground' : 'bg-foreground text-background'}`}>
          {isHealthy ? 'System Stable' : 'Critical Waste'}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Infrastructure Spend // Monthly</span>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tighter">${data?.totalSpend || "0.00"}</span>
          <span className="text-xl font-bold text-zinc-400">/ ${data?.budget || "100"}</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-sm font-medium leading-relaxed max-w-lg">
          {recommendation || "Analyzing resource efficiency. No immediate risks detected in your cloud fleet."}
        </p>
      </div>

      {!isHealthy && (
        <div className="mt-4 flex gap-4">
          <button className="px-6 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest">Remediate Now</button>
          <button className="px-6 py-2 border border-foreground text-[10px] font-black uppercase tracking-widest">Detail Report</button>
        </div>
      )}
    </div>
  );
}

// 2. Status Meter: Real-time risk assessment
export function StatusMeter({ metrics, isLoading }: { metrics: { risk_score: number, active_resources: number, saving_potential: number }, isLoading: boolean }) {
  if (isLoading) return <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between h-full bg-zinc-50 dark:bg-zinc-950/50">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-40">Risk Assessment</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-zinc-200 dark:text-zinc-800" />
              <circle 
                cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" 
                strokeDasharray={226} 
                strokeDashoffset={226 * (1 - (metrics?.risk_score || 0.1))} 
                className="text-foreground transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xl">
              {Math.round((metrics?.risk_score || 0.1) * 100)}%
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-tight">Active Resources</span>
            <span className="text-2xl font-black">{metrics?.active_resources || 0}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
          <span>Saving Potential</span>
          <span className="text-zinc-500">${metrics?.saving_potential || "0.00"}</span>
        </div>
        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full bg-foreground" style={{ width: '40%' }}></div>
        </div>
      </div>
    </div>
  );
}

// 3. Resource List: Detailed table
export function ResourceList({ isLoading }: { isLoading: boolean }) {
  const [resources, setResources] = React.useState<Array<{ name: string, status: string }>>([]);

  React.useEffect(() => {
    fetch("http://localhost:8080/api/inventory/resources")
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(err => console.error(err));
  }, []);

  if (isLoading) return <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory // Cloud Run & AWS Lambda</h3>
        <span className="text-[10px] font-mono text-zinc-400">Total: {resources.length}</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
          <tr>
            <th className="px-6 py-4">Resource ID</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Cost (24h)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {resources.slice(0, 5).map((r, i) => (
            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
              <td className="px-6 py-4 font-mono font-medium group-hover:pl-8 transition-all">{r.name}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 border border-foreground text-[8px] font-black uppercase tracking-widest">
                  {r.status === 'RUNNING' ? 'Live' : 'Stopped'}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-black font-mono">
                ${(2.15).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 4. Deploy Guard: Safety check for CI/CD
export function DeployGuard() {
  return (
    <div className="border border-foreground p-8 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-foreground animate-ping rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Deploy Guard Live</h3>
        </div>
        <p className="text-xs font-medium leading-relaxed mb-6">
          Intercepting production deployments. High-risk artifacts will be automatically staged for review.
        </p>
      </div>
      
      <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center text-center gap-3">
        <span className="text-[10px] font-bold uppercase text-zinc-400">Awaiting Signature</span>
        <button className="px-8 py-3 bg-foreground text-background text-xs font-black uppercase tracking-widest">Enable Auto-Block</button>
      </div>
    </div>
  );
}

// 5. Troubleshooting Workflow: Dynamic Step Tracking
export function TroubleshootingWorkflow({ steps, issueId }: { steps: Array<{ completed: boolean, label: string, description: string }>, issueId: string }) {
  // @ts-expect-error - Tambo SDK hook return type
  const { componentState } = useTamboComponentState(`troubleshoot-${issueId}`);

  return (
    <div className="border-2 border-foreground p-6 bg-background space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-tighter">Remediation Path: {issueId}</h3>
        <span className="text-[10px] font-mono opacity-50">State: {componentState?.status || 'In-Progress'}</span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx: number) => (
          <div key={idx} className="flex items-start gap-4">
            <div className={`w-6 h-6 border-2 border-foreground flex items-center justify-center text-[10px] font-black ${step.completed ? 'bg-foreground text-background' : ''}`}>
              {step.completed ? '✓' : idx + 1}
            </div>
            <div className="flex-1">
              <span className={`text-[11px] font-bold block ${step.completed ? 'line-through opacity-50' : ''}`}>
                {step.label}
              </span>
              <span className="text-[9px] text-zinc-400 block tracking-tight">{step.description}</span>
            </div>
          </div>
        ))}
      </div>

      <button 
        disabled={steps.every((s) => s.completed)}
        className="w-full py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-30"
      >
        Sync Resolved Items
      </button>
    </div>
  );
}
