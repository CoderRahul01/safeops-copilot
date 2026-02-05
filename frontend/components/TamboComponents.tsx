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
import { motion, AnimatePresence } from "framer-motion";

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
              <span className="text-[8px] font-mono opacity-40">TIMESTAMP: {new Date().toLocaleTimeString()}</span>
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

