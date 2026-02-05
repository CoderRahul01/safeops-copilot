"use client";

import React, { useEffect, useState } from "react";
import { useTamboComponentState } from "@tambo-ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * SafeOps Monochrome Components
 * Designed for high impact, ultra-premium B&W aesthetic.
 */

// 1. Safety Card: Ultra-Premium Spend Overview
export function SafetyCard({ data, recommendation, isLoading }: { data: { totalSpend: number, budget: number }, recommendation?: string, isLoading: boolean }) {
  if (isLoading) return <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse border-4 border-zinc-200" />;

  const isHealthy = data?.totalSpend < (data?.budget || 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-[6px] border-foreground p-10 relative overflow-hidden bg-background shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] dark:shadow-[15px_15px_0px_0px_rgba(255,255,255,0.05)]"
    >
      <div className="absolute top-0 right-0 p-6">
        <div className={`text-[12px] font-black uppercase tracking-[0.3em] px-4 py-2 ${isHealthy ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-red-600 text-white animate-pulse'}`}>
          {isHealthy ? 'SYSTEM_STABLE' : 'CRITICAL_WASTE'}
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Infrastructure Spend // 28D Window</span>
        <div className="flex items-baseline gap-4">
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-8xl font-black tracking-tighter"
          >
            ${data?.totalSpend || "0.00"}
          </motion.span>
          <span className="text-2xl font-black opacity-20 tracking-tighter">/ ${data?.budget || "100"}</span>
        </div>
      </div>

      <div className="mt-10 pt-10 border-t-4 border-foreground/5">
        <div className="flex items-start gap-4">
          <div className="w-1.5 h-12 bg-foreground shrink-0" />
          <p className="text-base font-bold leading-tight max-w-xl italic">
            &quot;{recommendation || "Analyzing resource efficiency. No immediate risks detected in your cloud fleet."}&quot;
          </p>
        </div>
      </div>

      {!isHealthy && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 flex gap-4"
        >
          <button className="flex-1 py-4 bg-foreground text-background text-xs font-black uppercase tracking-[0.2em] hover:invert transition-all">
            Initiate Remediation
          </button>
          <button className="flex-1 py-4 border-4 border-foreground text-xs font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all">
            Audit Logs
          </button>
        </motion.div>
      )}

      {/* Decorative Binary Stream (Visual Only) */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.03] text-[8px] font-mono leading-none rotate-12 select-none pointer-events-none">
        {Array(20).fill("01101001 01101110 01100110 01110010 01100001").join("\n")}
      </div>
    </motion.div>
  );
}

// 2. Status Meter: Premium Risk Console
export function StatusMeter({ metrics, isLoading }: { metrics: { risk_score: number, active_resources: number, saving_potential: number }, isLoading: boolean }) {
  if (isLoading) return <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse border-4 border-zinc-200" />;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-4 border-zinc-200 dark:border-zinc-800 p-10 flex flex-col justify-between h-full bg-zinc-50 dark:bg-zinc-950/50 relative overflow-hidden"
    >
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-30">Risk Assessment Matrix</h3>
        <div className="flex items-center gap-10">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-zinc-200 dark:text-zinc-900" />
              <motion.circle 
                cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="12" 
                strokeDasharray={364} 
                initial={{ strokeDashoffset: 364 }}
                animate={{ strokeDashoffset: 364 * (1 - (metrics?.risk_score || 0.1)) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-foreground"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{Math.round((metrics?.risk_score || 0.1) * 100)}%</span>
              <span className="text-[8px] font-black uppercase opacity-40">Load</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Active Procs</span>
              <span className="text-4xl font-black tracking-tighter">{metrics?.active_resources || 0}</span>
            </div>
            <div className="w-12 h-1 bg-foreground/10">
              <motion.div 
                className="h-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Potent. Optimization</span>
            <span className="text-2xl font-black">${metrics?.saving_potential || "0.00"}</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 animate-pulse">RECALCULATING...</div>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
          <motion.div 
            className="h-full bg-foreground"
            initial={{ x: '-100%' }}
            animate={{ x: '-20%' }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>
      </div>

      {/* Crosshair decoration */}
      <div className="absolute top-4 right-4 text-[10px] font-mono opacity-10">
        [+] 52.42.0.1
      </div>
    </motion.div>
  );
}

// 3. Resource List: Premium "Console" Inventory
export function ResourceList({ isLoading }: { isLoading: boolean }) {
  const [resources, setResources] = React.useState<Array<{ name: string, status: string }>>([]);

  React.useEffect(() => {
    fetch("http://localhost:8080/api/inventory/resources")
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(err => console.error(err));
  }, []);

  if (isLoading) return <div className="h-96 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse border-4 border-zinc-200" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-4 border-foreground bg-background overflow-hidden"
    >
      <div className="bg-foreground text-background px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-[12px] font-black uppercase tracking-[0.4em]">Resource Mainframe</h3>
          <div className="px-2 py-0.5 bg-background text-foreground text-[8px] font-mono leading-none">V2.0.4</div>
        </div>
        <span className="text-[10px] font-mono font-black opacity-80">NODES_WATCH: {resources.length}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-4 border-foreground/10 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              <th className="px-8 py-6">ID // Resource</th>
              <th className="px-8 py-6 text-center">Protocol</th>
              <th className="px-8 py-6 text-right">Cost (24H)</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-foreground/5">
            {resources.slice(0, 6).map((r, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-crosshair"
              >
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tight group-hover:px-2 transition-all">{r.name}</span>
                    <span className="text-[9px] font-mono opacity-30 uppercase">Region: us-east-1</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 ${
                    r.status === 'RUNNING' ? 'border-green-600 text-green-600 animate-pulse' : 'border-zinc-300 text-zinc-400 dark:border-zinc-800'
                  }`}>
                    {r.status === 'RUNNING' ? 'DEPLOYED' : 'OFFLINE'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-black font-mono tracking-tighter">$2.15</span>
                    <span className="text-[8px] font-mono opacity-20 uppercase">Trend: +0.4%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t-4 border-foreground/5 text-center">
        <button className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
          Show All Dependencies ↓
        </button>
      </div>
    </motion.div>
  );
}

// 4. Deploy Guard: Ultra-Premium Security Intercept
export function DeployGuard() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-8 border-foreground p-10 bg-zinc-950 text-white flex flex-col justify-between h-full relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-red-600 rounded-full animate-ping" />
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em]">Deploy_Guard // active</h3>
        </div>
        <div className="text-[10px] font-mono opacity-20">ENCRYPTION: AES-256</div>
      </div>

      <div className="space-y-6">
        <p className="text-xl font-black leading-tight tracking-tight uppercase italic underline decoration-4 underline-offset-8 decoration-red-600">
          Shielding Production Fleet
        </p>
        <p className="text-xs font-bold text-zinc-400 leading-relaxed max-w-sm">
          Intercepting high-risk artifacts. Automated block protocol active for all unauthorized GCP/AWS service modifications.
        </p>
      </div>
      
      <div className="mt-12 group cursor-pointer border-4 border-white/10 p-8 hover:bg-white hover:text-black transition-all">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100">Awaiting Signal</span>
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="w-2 h-8 bg-current opacity-20 group-hover:animate-pulse" />)}
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest px-8 py-3 bg-white text-black invert group-hover:invert-0">
            Enable Full Lockdown
          </button>
        </div>
      </div>

      {/* Background Decorative ID */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] font-black opacity-[0.02] pointer-events-none select-none">
        DG.01
      </div>
    </motion.div>
  );
}

// 5. Troubleshooting Workflow: Cinematic Issue Resolution
export function TroubleshootingWorkflow({ steps, issueId, onSync }: { steps: Array<{ completed: boolean, label: string, description: string }>, issueId: string, onSync?: (stepIndex: number) => Promise<void> }) {
  // @ts-expect-error - Tambo SDK hook return type
  const { componentState, updateComponentState } = useTamboComponentState(`troubleshoot-${issueId}`);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!onSync) return;
    
    // Find the first incomplete step
    const nextStepIdx = steps.findIndex(s => !s.completed);
    if (nextStepIdx === -1) return;

    setIsSyncing(true);
    try {
      await onSync(nextStepIdx);
      updateComponentState({ syncedAt: Date.now(), lastCompletedIdx: nextStepIdx });
    } catch (error) {
      console.error("Remediation failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-[6px] border-foreground p-10 bg-background relative overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.05)]"
    >
      <div className="flex items-center justify-between mb-12 pb-6 border-b-4 border-foreground/10">
        <h3 className="font-black text-2xl uppercase tracking-tighter italic">Remediation // {issueId}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {isSyncing ? 'SYNCING_PROTOCOL' : (componentState?.status || 'CONNECTED')}
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {steps.map((step, idx: number) => (
          <motion.div 
            key={idx} 
            layout
            className={`flex items-start gap-6 p-6 border-4 transition-all duration-300
              ${step.completed ? 'opacity-20 border-transparent grayscale' : 'border-foreground bg-zinc-50 dark:bg-zinc-900/40'}
            `}
          >
            <div className={`w-10 h-10 border-4 border-foreground flex items-center justify-center text-lg font-black shrink-0
              ${step.completed ? 'bg-foreground text-background' : 'bg-transparent text-foreground'}
            `}>
              {step.completed ? '✓' : idx + 1}
            </div>
            <div className="flex-1">
              <span className={`text-lg font-black uppercase tracking-tight block ${step.completed ? 'line-through' : ''}`}>
                {step.label}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 block mt-1 uppercase tracking-wider">{step.description}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        disabled={steps.every((s) => s.completed) || isSyncing}
        onClick={handleSync}
        className="w-full mt-10 py-5 bg-foreground text-background text-sm font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 disabled:opacity-20 transition-all shadow-xl flex items-center justify-center gap-3"
      >
        {isSyncing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            SYNCHRONIZING...
          </>
        ) : 'Synchronize Repairs'}
      </button>

      {/* Decorative Serial ID */}
      <div className="absolute bottom-4 right-4 text-[8px] font-mono opacity-20">STATE_HASH: {issueId.substring(0,8)}</div>
    </motion.div>
  );
}

// 6. Workflow Stepper: Ultra-Premium multi-step guide
export function WorkflowStepper({ steps, title, id = "global-setup" }: { steps: Array<{ label: string, description: string }>, title: string, id?: string }) {
  // @ts-expect-error - Tambo SDK hook return type
  const { componentState, updateComponentState } = useTamboComponentState(`workflow-${id}`);
  
  if (!steps || steps.length === 0) {
    return (
      <div className="border-4 border-foreground p-12 bg-zinc-50 dark:bg-zinc-900/50 animate-pulse text-[12px] font-black uppercase tracking-[0.3em] text-center">
        Syncing with Security Mainframe...
      </div>
    );
  }

  const currentStep = componentState?.currentStep || 0;
  const isCompleted = currentStep >= steps.length;

  const nextStep = () => {
    if (currentStep < steps.length) {
      updateComponentState({ currentStep: currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      updateComponentState({ currentStep: currentStep - 1 });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-[6px] border-foreground p-10 bg-background relative overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.05)]"
    >
      <div className="absolute top-0 right-0 p-6">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <header>
          <motion.h2 
            key={title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black uppercase tracking-tighter leading-none mb-4"
          >
            {title}
          </motion.h2>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-foreground text-background text-[10px] font-black uppercase tracking-widest">
              Setup Protocol // Active
            </div>
            <span className="text-[10px] font-mono opacity-30">ID: {id}</span>
          </div>
        </header>

        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;
              
              if (!isActive && !isPast && idx > currentStep + 1) return null;

              return (
                <motion.div 
                  key={idx}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: isActive ? 1 : isPast ? 0.3 : 0.1, 
                    x: 0,
                    scale: isActive ? 1 : 0.98
                  }}
                  className={`flex gap-6 p-8 border-4 transition-all duration-300 relative
                    ${isActive ? 'border-foreground bg-zinc-50 dark:bg-zinc-900/50' : 'border-zinc-100 dark:border-zinc-800'}
                  `}
                >
                  <div className={`w-12 h-12 border-4 border-foreground flex items-center justify-center font-black text-xl shrink-0
                    ${isPast ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : isActive ? 'bg-foreground text-background' : 'bg-transparent text-foreground'}
                  `}>
                    {isPast ? '✓' : idx + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`text-lg font-black uppercase tracking-tight ${isPast ? 'text-zinc-400' : ''}`}>
                      {step.label}
                    </h4>
                    {isActive && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-bold text-zinc-500 leading-relaxed mt-2 max-w-xl"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>

                  {isActive && (
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <footer className="flex justify-between items-center pt-10 border-t-4 border-foreground/10">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="group flex items-center gap-2 px-6 py-3 border-2 border-foreground text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-20 transition-all font-mono"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK
          </button>

          {!isCompleted ? (
            <button 
              onClick={nextStep}
              className="px-12 py-4 bg-foreground text-background text-sm font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-95 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
            >
              Confirm Step
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">Workflow Verified</span>
              <span className="text-[8px] font-mono opacity-40 uppercase">System Sync Active</span>
            </div>
          )}
        </footer>
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
    </motion.div>
  );
}

// 7. Safety Audit: Real-time visual security scan
export function SafetyAudit({ checks, score }: { checks: Array<{ category: string, status: 'PASS' | 'FAIL' | 'WARN', message: string }>, score: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-8 border-foreground p-10 bg-zinc-950 text-white relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">Security Audit</h2>
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-[0.5em] mt-2">Live Cloud Environment Scan</p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black leading-none">{score}</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-40">System Score</div>
        </div>
      </div>

      <div className="grid gap-1 mb-12">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-6 p-4 hover:bg-white/5 transition-colors group">
            <div className={`w-3 h-3 rotate-45 shrink-0 ${
              check.status === 'PASS' ? 'bg-green-500' : check.status === 'FAIL' ? 'bg-red-600' : 'bg-yellow-500'
            }`} />
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] font-black uppercase tracking-wider">{check.category}</span>
                <span className={`text-[10px] font-bold ${
                  check.status === 'PASS' ? 'text-green-500' : check.status === 'FAIL' ? 'text-red-600' : 'text-yellow-500'
                }`}>
                  {check.status}
                </span>
              </div>
              <p className="text-[10px] opacity-40 font-medium group-hover:opacity-80 transition-opacity">{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button className="flex-1 py-4 bg-white text-black text-xs font-black uppercase tracking-widest hover:invert transition-all">
          Patch All Vulnerabilities
        </button>
        <button className="px-8 border-2 border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          JSON EXPORT
        </button>
      </div>

      {/* Decorative Radar Sweep */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-[radar_4s_linear_infinite]" />
      <style jsx>{`
        @keyframes radar {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
      `}</style>
    </motion.div>
  );
}

// 8. Free Tier Sentinel: Interactive Cloud Tier Guard
export function FreeTierSentinel({ data, isLoading }: { data: { score: number, leakage: number, traps: Array<{ resource: string, cost: number, trapType: string }> }, isLoading: boolean }) {
  if (isLoading) return <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse border-8 border-foreground/10" />;

  const isCritical = data.leakage > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-[8px] border-foreground p-12 bg-background relative overflow-hidden shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] dark:shadow-[30px_30px_0px_0px_rgba(255,255,255,0.05)]"
    >
      {/* Cinematic Pulse Header */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter leading-[0.8]">Sentinel</h2>
          <div className="flex items-center gap-3 mt-4">
            <div className={`w-3 h-3 ${isCritical ? 'bg-red-600 animate-ping' : 'bg-green-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Tier Boundary Watchdog</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black font-mono">CODE: {data.score}/100</div>
          <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">Health index</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Radar/Meter Visual */}
        <div className="relative aspect-square border-4 border-foreground/5 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900/30">
           <div className="absolute inset-4 border-2 border-dashed border-foreground/10 rounded-full animate-[spin_20s_linear_infinite]" />
           <div className="absolute inset-10 border-2 border-dashed border-foreground/20 rounded-full animate-[spin_15s_linear_reverse_infinite]" />
           <span className="text-7xl font-black tracking-tighter">${data.leakage}</span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Monthly Leakage</span>
        </div>

        <div className="space-y-8">
           <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-40">Identified Paid Traps</span>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900">
                <motion.div 
                   className={`h-full ${isCritical ? 'bg-red-600' : 'bg-foreground'}`}
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, (data.traps.length / 5) * 100)}%` }}
                />
              </div>
           </div>

           <div className="grid gap-4">
             {data.traps.map((trap, i) => (
               <div key={i} className="flex justify-between items-center p-4 border-b-2 border-foreground/5 group hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                 <div className="flex flex-col">
                   <span className="text-sm font-black uppercase tracking-tight">{trap.resource}</span>
                   <span className="text-[9px] font-mono opacity-40 italic">{trap.trapType}</span>
                 </div>
                 <div className="text-right">
                   <span className="text-base font-black text-red-600">+${trap.cost}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-4">
         <button className="w-full py-6 bg-foreground text-background text-sm font-black uppercase tracking-[0.5em] hover:invert transition-all transform hover:scale-[1.01] active:scale-95 shadow-2xl">
            Synchronize Tier Downgrade
         </button>
         <div className="flex justify-between text-[8px] font-mono opacity-20 uppercase">
           <span>Protocol: safeops_bndry_v1</span>
           <span>Last Scan: {new Date().toLocaleTimeString()}</span>
         </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
    </motion.div>
  );
}
