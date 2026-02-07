"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, ShieldAlert, Zap, Cloud } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTamboStreamStatus, TamboMessageProvider, useTamboCurrentComponent, type TamboThreadMessage } from "@tambo-ai/react";
import { useAuth } from "./AuthProvider";

// Types for components
interface SafetyCardProps {
  data?: { totalSpend: number; budget: number };
  recommendation?: string;
}

interface StatusMeterProps {
  metrics?: { risk_score: number; active_resources: number; saving_potential: number };
}

interface SafetyAuditProps {
  score?: number;
  checks?: Array<{ category: string, status: string, message: string }>;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

interface FreeTierSentinelProps {
  data?: {
    score: number;
    leakage: number;
    traps: Array<{ resource: string, cost: number, trapType: string }>;
  };
}

interface TroubleshootingWorkflowProps {
  steps?: Array<{ completed: boolean, label: string, description: string }>;
  issueId?: string;
  onSync?: (stepIndex: number) => Promise<void>;
}

interface WorkflowStepperProps {
  id?: string;
  title?: string;
  steps?: Array<{ label: string, description: string }>;
}

interface MainframeReportProps {
  title?: string;
  content?: string;
  status?: string;
}

interface CloudAchievementProps {
  title?: string;
  points?: number;
  description?: string;
  icon?: string;
}

const STATIC_MESSAGE_CONTEXT: TamboThreadMessage = {
  id: "static-context",
  threadId: "static-thread",
  role: "assistant",
  content: [],
  createdAt: new Date().toISOString(),
  componentState: {},
  component: {
    componentName: "Static",
    componentState: {},
    message: "Static Context",
    props: {}
  }
};

// HOC to ensure components are only rendered on the client to avoid SSR hook errors
function withClientOnly<T extends object>(Component: React.ComponentType<T>) {
  return function ClientOnlyWrapper(props: T) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Safety check: useTamboStreamStatus requires TamboMessageProvider context
    // useTamboCurrentComponent returns null if context is missing
    // Called at top level to satisfy hook laws
    const hasMessageContext = !!useTamboCurrentComponent();
    
    if (!mounted) return <div className="w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10 rounded-sm" style={{ height: '200px' }} />;
    
    if (hasMessageContext) {
      return <Component {...props} />;
    }
    
    // Provide a static context if missing (e.g. static dashboard usage)
    return (
      <TamboMessageProvider message={STATIC_MESSAGE_CONTEXT}>
        <Component {...props} />
      </TamboMessageProvider>
    );
  };
}

// 1. Safety Card: Minimalist Spend Overview
function SafetyCardInternal({ data, recommendation }: SafetyCardProps) {
  const { streamStatus } = useTamboStreamStatus<SafetyCardProps>();
  
  // Render if we have data OR if we aren't pending. If pending and no data, show skeleton.
  const shouldRender = (data && data.totalSpend !== undefined) || !streamStatus.isPending;

  if (!shouldRender) {
    return <div className="h-64 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  const isHealthy = (data?.totalSpend || 0) < (data?.budget || 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="border border-foreground p-8 bg-background relative"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Fleet Expenditure</span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-6xl font-black tracking-tighter text-foreground">${data?.totalSpend || "0.00"}</span>
            <span className="text-xl font-bold text-zinc-200">/ ${data?.budget || "100"}</span>
          </div>
        </div>
        <div className={`px-4 py-1 text-[10px] font-bold uppercase border ${isHealthy ? 'border-foreground text-foreground' : 'border-red-600 text-red-600'}`}>
          {isHealthy ? 'PROTECTED' : 'ALERT'}
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
        <p className="text-[13px] font-medium text-foreground/80 max-w-xl">
          {recommendation || "Infrastructure investment and global resource efficiency remains optimal."}
        </p>
      </div>
    </motion.div>
  );
}
export const SafetyCard = withClientOnly(SafetyCardInternal);

// 2. Status Meter: Minimalist Metric Bar
function StatusMeterInternal({ metrics }: StatusMeterProps) {
  const { streamStatus } = useTamboStreamStatus<StatusMeterProps>();

  // Use props as fallback for static rendering
  const shouldRender = (metrics && metrics.risk_score !== undefined) || !streamStatus.isPending;

  if (!shouldRender) {
    return <div className="h-64 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      layout
      className="border border-foreground p-8 flex flex-col justify-between h-full bg-background"
    >
      <div className="space-y-8">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Security Index</span>
          <div className="flex justify-between items-center">
            <span className="text-5xl font-black text-foreground">{((metrics?.risk_score || 0) * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(metrics?.risk_score || 0) * 100}%` }}
              className={`h-full ${(metrics?.risk_score || 0) > 0.7 ? 'bg-red-600' : 'bg-foreground'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Live Nodes</span>
            <div className="text-2xl font-bold">{metrics?.active_resources || 0}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-zinc-500">ROI Potential</span>
            <div className="text-2xl font-bold text-green-600">${metrics?.saving_potential || 0}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export const StatusMeter = withClientOnly(StatusMeterInternal);

// 3. Resource List: Clean Data Table
interface ResourceListProps {
  resources?: Array<{ id?: string, name: string, status: string, cloud?: string, region?: string }>;
  isLoading?: boolean;
}

// 3. Resource List: Clean Data Table
function ResourceListInternal({ resources: propsResources }: ResourceListProps) {
  const { user } = useAuth();
  const { streamStatus } = useTamboStreamStatus();
  // Update state to include id and cloud
  const [resources, setResources] = useState<Array<{ id?: string, name: string, status: string, cloud?: string, region?: string }>>(propsResources || []);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<{aws: boolean, gcp: boolean}>({ aws: false, gcp: false });

  useEffect(() => {
    if (propsResources && propsResources.length > 0) {
      setResources(propsResources);
      return;
    }
    if (!user) return;

    const fetchResources = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        
        // Fetch connection status and resources in parallel
        const [connRes, invRes] = await Promise.all([
          fetch(`${apiUrl}/api/cloud/status`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/inventory/resources`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const connData = await connRes.json();
        setConnectionInfo(connData);

        const data = await invRes.json();
        if (Array.isArray(data)) {
          setResources(data);
        } else {
          setResources([]);
        }
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        setResources([]);
      }
    };

    fetchResources();
  }, [user, propsResources]);

  const handleTerminate = async (r: { id?: string, name: string, cloud?: string, region?: string }) => {
    // ... (rest of the handleTerminate logic stays the same)
    const confirm = window.confirm(`CRITICAL: Initiate termination sequence for ${r.name}?`);
    if (!confirm) return;

    setTerminatingId(r.id || r.name);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("No auth token available");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/cloud/terminate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resourceId: r.id,
          resourceName: r.name,
          provider: r.cloud || 'gcp',
          region: r.region || 'us-central1'
        })
      });
      const result = await res.json();
      if (result.success) {
        setResources(prev => prev.map(item => (item.id === r.id || item.name === r.name) ? { ...item, status: 'STOPPING' } : item));
      }
    } catch (err) {
      console.error("Termination failed:", err);
    } finally {
      setTerminatingId(null);
    }
  };

  if (streamStatus.isPending && (!resources || resources.length === 0)) {
    return <div className="h-96 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  const isConnected = connectionInfo.aws || connectionInfo.gcp;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="border border-foreground bg-background overflow-hidden"
    >
      <div className="px-8 py-5 border-b border-foreground flex justify-between items-center">
        <h3 className="text-[14px] font-bold uppercase tracking-tight">Active Resources</h3>
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="flex gap-2">
              {connectionInfo.aws && <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 border border-amber-500/20">AWS_CONNECTED</span>}
              {connectionInfo.gcp && <span className="text-[9px] font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 border border-blue-500/20">GCP_CONNECTED</span>}
            </div>
          )}
          <span className="text-[10px] font-mono text-zinc-400">COUNT: {resources.length}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase tracking-wider text-zinc-500 border-b border-foreground/10">
            <tr>
              <th className="px-8 py-4 font-bold">Resource Name</th>
              <th className="px-8 py-4 font-bold">Status</th>
              <th className="px-8 py-4 font-bold">Provider</th>
              <th className="px-8 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {resources.map((item, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-8 py-4 font-medium text-foreground">{item.name}</td>
                <td className="px-8 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    item.status === 'RUNNING' || item.status === 'running' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                    item.status === 'STOPPED' || item.status === 'stopped' ? 'bg-zinc-100 text-zinc-500 border-zinc-200' :
                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}>
                    {(item.status === 'RUNNING' || item.status === 'running') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-xs text-zinc-500 uppercase">{item.cloud || 'GCP'}</td>
                <td className="px-8 py-4 text-right">
                  {(item.status === 'RUNNING' || item.status === 'running') && (
                     <button 
                       onClick={() => handleTerminate(item)}
                       disabled={terminatingId === (item.id || item.name)}
                       className="text-[10px] font-bold uppercase text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 focus:outline-none disabled:opacity-50"
                     >
                       {terminatingId === (item.id || item.name) ? 'Stopping...' : 'Stop'}
                     </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {resources.length === 0 && (
          <div className="p-8 text-center text-zinc-400 text-sm">
            {isConnected ? "No active resources detected on connected cloud providers." : "No accounts connected. Please authenticate in the Cloud tab."}
          </div>
        )}
      </div>
    </motion.div>
  );
}
export const ResourceList = withClientOnly(ResourceListInternal);

// 4. Deploy Guard: Simple Alert State
function DeployGuardInternal() {
  const { streamStatus } = useTamboStreamStatus();

  if (streamStatus.isPending) {
    return <div className="h-64 w-full bg-black animate-pulse border border-white/10" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      layout
      className="border border-foreground p-8 bg-black text-white h-full flex flex-col justify-between"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full" />
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Active Shield</h3>
        </div>
        <div className="space-y-2">
          <p className="text-4xl font-black italic uppercase tracking-tighter">Inbound Guard</p>
          <p className="text-sm text-zinc-500 uppercase tracking-tight leading-relaxed">
            Intercepting high-risk service modifications across the fleet.
          </p>
        </div>
      </div>
      
      <button className="w-full mt-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all">
        Initiate Lockdown
      </button>
    </motion.div>
  );
}
export const DeployGuard = withClientOnly(DeployGuardInternal);

// 5. Troubleshooting Workflow: Linear Guide
function TroubleshootingWorkflowInternal({ steps, issueId, onSync }: TroubleshootingWorkflowProps) {
  const { streamStatus } = useTamboStreamStatus<TroubleshootingWorkflowProps>();
  const [isSyncing, setIsSyncing] = useState(false);

  if (streamStatus.isPending && (!steps || steps.length === 0)) {
    return <div className="h-80 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  const handleSync = async () => {
    if (!onSync || !Array.isArray(steps)) return;
    const nextStepIdx = steps.findIndex(s => !s.completed);
    if (nextStepIdx === -1) return;
    setIsSyncing(true);
    try { await onSync(nextStepIdx); } catch { } finally { setIsSyncing(false); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      className="border border-foreground p-8 bg-background"
    >
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="font-bold text-xl uppercase tracking-tighter italic">Resolution Flow // {issueId}</h3>
        <div className="w-2 h-2 rounded-full bg-green-500" />
      </div>

      <div className="space-y-4">
        {steps?.map((step, idx) => (
          <div key={idx} className={`p-5 border ${step.completed ? 'opacity-30 border-dashed border-zinc-200' : 'border-foreground'} flex gap-5 items-center`}>
            <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm ${step.completed ? 'text-zinc-400' : 'bg-foreground text-background'}`}>
              {step.completed ? '✓' : idx + 1}
            </div>
            <div>
              <span className={`text-[13px] font-bold uppercase ${step.completed ? 'text-zinc-400' : ''}`}>{step.label}</span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-tight">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button 
        disabled={steps?.every(s => s.completed) || isSyncing}
        onClick={handleSync}
        className="w-full mt-8 py-4 bg-foreground text-background text-[11px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-10"
      >
        {isSyncing ? 'Synchronizing...' : 'Resolve Next Task'}
      </button>
    </motion.div>
  );
}
export const TroubleshootingWorkflow = withClientOnly(TroubleshootingWorkflowInternal);

// 7. Safety Audit: Clean Checklist
function SafetyAuditInternal({ checks, score }: SafetyAuditProps) {
  const { streamStatus } = useTamboStreamStatus<SafetyAuditProps>();

  if (streamStatus.isPending) {
    return <div className="h-96 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      className="border border-foreground p-8 bg-background h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Security Audit</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Full Infrastructure Scan</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black">{score || 0}</div>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Health Score</span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {checks?.map((check, idx) => (
          <div key={idx} className="flex items-center gap-6 p-4 border border-zinc-50 dark:border-zinc-950 transition-all">
            <div className={`w-2 h-2 rounded-full ${check.status === 'PASS' ? 'bg-foreground' : 'bg-red-600'}`} />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-[12px] font-bold uppercase tracking-tight">{check.category}</span>
                <span className={`text-[10px] font-bold ${check.status === 'PASS' ? 'text-zinc-400' : 'text-red-500'}`}>{check.status}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-tight">{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-10 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all">
        Generate Full Audit Report
      </button>
    </motion.div>
  );
}
export const SafetyAudit = withClientOnly(SafetyAuditInternal);

// 10. Mainframe Report: Mandatory Narrative Wrapper
function MainframeReportInternal({ title, content, status }: MainframeReportProps) {
  const { streamStatus } = useTamboStreamStatus<MainframeReportProps>();

  if (streamStatus.isPending && !content && !title) {
    return <div className="h-48 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      layout
      className="border border-foreground bg-background p-8 relative overflow-hidden group/mainframe"
    >
      <motion.div 
        animate={{ 
          opacity: [0.05, 0.15, 0.05],
          x: [-2, 2, -2]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 p-4"
      >
        <Terminal size={40} className="text-foreground" />
      </motion.div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="h-1 w-8 bg-foreground" />
        <span className="text-[11px] font-bold uppercase tracking-[0.3em]">{title || "TECHNICAL_BRIEFING"}</span>
        {status && (
          <span className="text-[9px] font-mono bg-foreground text-background px-2 py-0.5 ml-auto">
            {status}
          </span>
        )}
      </div>

      <div className="space-y-4 prose prose-invert max-w-none text-[14px] leading-relaxed text-foreground font-medium selection:bg-foreground selection:text-background">
        <ReactMarkdown>
          {content || ""}
        </ReactMarkdown>
      </div>

      <div className="mt-8 flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-foreground/20 rounded-full" />
        ))}
      </div>
    </motion.div>
  );
}
export const MainframeReport = withClientOnly(MainframeReportInternal);

// 11. Cloud Achievement: Gamified Reward
function CloudAchievementInternal({ title, points, description, icon }: CloudAchievementProps) {
  const { streamStatus } = useTamboStreamStatus<CloudAchievementProps>();

  if (streamStatus.isPending && !title) {
    return <div className="h-64 w-full bg-foreground animate-pulse border border-foreground" />;
  }

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      layout
      className="border-2 border-foreground bg-foreground text-background p-8 relative overflow-hidden group"
    >
      {/* Background Glow Effect */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-white/10 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 text-center flex flex-col items-center">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
          {icon || "🏆"}
        </div>
        
        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">
          {title || "ACHIEVEMENT_UNLOCKED"}
        </h3>
        
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-6">
          System Upgrade Detected // +{points || 0} XP
        </div>

        <p className="text-sm font-medium leading-relaxed opacity-90 max-w-[240px]">
          {description || "High-impact security protocol successfully established."}
        </p>
        
        <div className="mt-8 w-24 h-[1px] bg-background/30" />
      </div>
    </motion.div>
  );
}
export const CloudAchievement = withClientOnly(CloudAchievementInternal);

// 12. Workflow Stepper: Interactive Guide
function WorkflowStepperInternal({ id, title, steps }: WorkflowStepperProps) {
  const { streamStatus } = useTamboStreamStatus<WorkflowStepperProps>();
  const [activeStep, setActiveStep] = useState(0);

  if (streamStatus.isPending && (!steps || steps.length === 0)) {
    return <div className="h-96 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      layout
      className="border border-foreground bg-background p-8"
    >
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Session Protocol // {id || "LIVE"}</div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{title || "GUIDED_ONBOARDING"}</h3>
      </div>

      <div className="space-y-6">
        {steps?.map((step, idx) => (
          <div key={idx} className="flex gap-6 group cursor-pointer" onClick={() => setActiveStep(idx)}>
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all
                ${idx === activeStep ? 'bg-foreground text-background border-foreground' : 
                  idx < activeStep ? 'bg-zinc-200 border-zinc-200 text-zinc-500' : 'border-zinc-200 text-zinc-300'}`}>
                {idx < activeStep ? "✓" : idx + 1}
              </div>
              {idx !== steps.length - 1 && (
                <div className={`w-[2px] flex-1 my-2 transition-colors ${idx < activeStep ? 'bg-zinc-200' : 'bg-zinc-100'}`} />
              )}
            </div>
            
            <div className={`pb-6 ${idx === activeStep ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
              <span className="text-[12px] font-bold uppercase tracking-tight block mb-1">{step.label}</span>
              {idx === activeStep && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[11px] text-zinc-500 leading-relaxed uppercase"
                >
                  {step.description}
                </motion.p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-8 border-t border-zinc-100 flex justify-between items-center">
        <button 
          onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
          className="text-[10px] font-bold uppercase tracking-widest hover:underline disabled:opacity-20"
          disabled={activeStep === 0}
        >
          Previous
        </button>
        <button 
          onClick={() => setActiveStep(prev => Math.min((Array.isArray(steps) ? steps.length : 1) - 1, prev + 1))}
          className="px-6 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-20"
          disabled={activeStep === ((Array.isArray(steps) ? steps.length : 1) - 1)}
        >
          Next Step
        </button>
      </div>
    </motion.div>
  );
}
export const WorkflowStepper = withClientOnly(WorkflowStepperInternal);

// 13. Free Tier Sentinel: Cost Trap Hunter
function FreeTierSentinelInternal({ data }: FreeTierSentinelProps) {
  const { streamStatus } = useTamboStreamStatus<FreeTierSentinelProps>();

  if (streamStatus.isPending) {
    return <div className="h-96 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      className="border border-foreground bg-background overflow-hidden"
    >
      <div className="bg-red-600 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Leakage Alert</span>
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Tier Drift</h2>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-white/90">-{data?.score || 0}%</div>
            <span className="text-[9px] font-bold uppercase text-white/50">Efficiency Loss</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex justify-between items-end border-b border-zinc-100 pb-6 uppercase">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block mb-1">Monthly Exposure</span>
            <span className="text-3xl font-black">${data?.leakage || 0}</span>
          </div>
          <Zap size={24} className="text-red-600 mb-1" />
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Identified Cost Traps:</span>
          {data?.traps?.map((trap, i) => (
            <div key={i} className="flex justify-between items-center p-4 border border-zinc-50 hover:border-foreground transition-all">
              <div>
                <span className="text-[12px] font-bold uppercase">{trap.resource}</span>
                <p className="text-[10px] text-zinc-400 uppercase">{trap.trapType}</p>
              </div>
              <div className="text-right">
                <span className="text-[12px] font-bold text-red-600">${trap.cost}/mo</span>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-4 bg-foreground text-background text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:scale-[0.98]">
          Initiate Tier Downgrade
        </button>
      </div>
    </motion.div>
  );
}
export const FreeTierSentinel = withClientOnly(FreeTierSentinelInternal);
// 6. Cloud Connectivity: Visual Link Report
export function CloudConnectivityStatusInternal({ provider, status: propStatus, logs = [] }: { provider: string, status?: string, logs?: LogEntry[] }) {
  const { user } = useAuth();
  const [fetchedStatus, setFetchedStatus] = useState<string>('AWAITING');
  const { streamStatus } = useTamboStreamStatus();

  useEffect(() => {
    if (propStatus || !user) return;

    const fetchStatus = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/cloud/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const isProviderConnected = provider.toLowerCase() === 'aws' ? data.aws : data.gcp;
        setFetchedStatus(isProviderConnected ? 'ACTIVE' : 'INACTIVE');
      } catch (err) {
        console.error("Failed to fetch cloud status:", err);
      }
    };

    fetchStatus();
  }, [user, propStatus, provider]);

  const status = propStatus || fetchedStatus;
  const isHealthy = status === 'ACTIVE';
  
  if (streamStatus.isPending && !propStatus) {
    return <div className="h-96 w-full bg-zinc-50 dark:bg-zinc-950 animate-pulse border border-foreground/10" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="border border-foreground bg-background p-8 space-y-8 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5">
         <Cloud size={80} />
      </div>

      <div className="flex items-center justify-between border-b border-foreground/10 pb-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 ${isHealthy ? 'bg-foreground' : 'bg-red-600'} text-background`}>
            <Cloud size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">{provider} Gateway</h3>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-none mt-1">
              Secure Channel // End-to-End Encryption
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-950 border border-foreground/10">
          <div className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase text-zinc-400">Handshake Integrity</span>
          <p className="text-sm font-black uppercase">{isHealthy ? 'Verified (OIDC)' : 'Unauthenticated'}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase text-zinc-400">Response Latency</span>
          <p className="text-sm font-black uppercase">{isHealthy ? 'Optimal (< 50ms)' : 'N/A'}</p>
        </div>
      </div>

      <div className="bg-black/90 p-6 border border-foreground/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-zinc-500" />
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Live Telemetry Feed</span>
          </div>
          {isHealthy && <div className="text-[9px] font-mono text-green-500/50 uppercase">Syncing...</div>}
        </div>
        
        <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hide">
          {logs && logs.length > 0 ? (
            logs.slice(0, 5).map((log, i) => (
              <div key={i} className="text-[10px] font-mono flex gap-4 text-zinc-400 group/item">
                <span className="opacity-20 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                <span className={`uppercase font-bold w-12 shrink-0 ${
                   log.level === 'success' ? 'text-green-500/70' : 
                   log.level === 'error' ? 'text-red-500/70' : 'text-blue-500/70'
                }`}>{log.level}</span>
                <span className="text-zinc-300 truncate">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="text-[10px] font-mono text-zinc-600 italic py-4 flex flex-col items-center gap-2">
               <div className="w-1 h-1 bg-zinc-800 animate-ping rounded-full" />
               Awaiting infrastructure handshake...
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
         <button className="w-full py-4 border border-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all">
            Full Audit Stream
         </button>
      </div>
    </motion.div>
  );
}
export const CloudConnectivityStatus = withClientOnly(CloudConnectivityStatusInternal);
