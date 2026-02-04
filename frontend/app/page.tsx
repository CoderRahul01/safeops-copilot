"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { TamboProvider, defineTool, useTamboThreadInput } from "@tambo-ai/react";
import { TamboChat } from "@/components/TamboChat";
import { z } from "zod";
import { Shield, Activity, ExternalLink, Globe, LayoutDashboard } from "lucide-react";
import { 
  SafetyCard, SafetyCardLoading,
  DeployGuard, DeployGuardLoading,
  ResourceList, ResourceListLoading,
  StatusMeter, StatusMeterLoading 
} from "@/components/TamboComponents";

// --- TYPES ---
interface CloudContext {
  billingStatus: {
    freeTierSafe: boolean;
    totalSpend: number;
    limit: number;
    percentageUsed: number;
  };
  recommendation: string;
  metrics: {
    active_resources: number;
    risk_count: number;
    saving_potential: string;
  };
}

interface SafetyCardProps {
  riskLevel: "danger" | "warning";
  message: string;
  costDelta?: string;
}

interface ResourceListProps {
  resources: Array<{
    id: string;
    name: string;
    cloud: string;
    cost: number;
    waste: number;
  }>;
}

// --- CHAT TRIGGER COMPONENT ---
// This handles the "Zero-Config Onboarding" by auto-starting a thread when risks exist.
const ChatTrigger = ({ context }: { context: CloudContext | null }) => {
  const { setValue, submit } = useTamboThreadInput();
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Only trigger once when context is loaded and unsafe
    if (context && !context.billingStatus.freeTierSafe && !hasTriggered.current) {
      console.log("SafeOps Agent: Proactive safety check triggered.");
      hasTriggered.current = true;
      
      const prompt = `System analysis detected a free-tier violation. 
Current Spend: $${context.billingStatus.totalSpend.toFixed(2)}
Potential Savings: $${context.metrics.saving_potential}
Recommendation: ${context.recommendation}

Please provide a SafetyCard and a detailed ResourceList for remediation.`;

      setValue(prompt);
      
      // Delay submission to ensure provider state is fully settled
      const timer = setTimeout(() => {
        submit().catch(err => console.error("SafeOps Agent: Auto-submission failed:", err));
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [context, setValue, submit]);

  return null;
};

// --- MAIN APPLICATION ---
export default function Home() {
  const [context, setContext] = useState<CloudContext | null>(null);

  // 1. Stable API Handlers
  const fetchContext = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/context");
      const data = await res.json();
      console.log("SafeOps: Dashboard context synchronized.", data);
      setContext(data);
    } catch (err) {
      console.error("SafeOps: Failed to connect to safety backend.", err);
    }
  }, []);

  const handleStopWaste = useCallback(async (serviceId: string = "all") => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/stop-waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId })
      });
      const data = await res.json();
      console.log("SafeOps: Remediation successful.", data);
      fetchContext(); // Refresh global state
      return data;
    } catch (err) {
      console.error("SafeOps: Remediation action failed.", err);
      throw err;
    }
  }, [fetchContext]);

  // 2. Load context on mount
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchContext();
    };
    load();
    return () => { isMounted = false; };
  }, [fetchContext]);

  // 3. Stable Tool Definitions (Memoized to prevent Provider refreshes)
  const tools = useMemo(() => [
    defineTool({
      name: "list_cloud_resources",
      description: "Lists all active cloud resources and their waste/efficiency scores.",
      inputSchema: z.object({}),
      outputSchema: z.array(z.object({
        id: z.string(),
        name: z.string(),
        cloud: z.string(),
        cost: z.number(),
        waste: z.number()
      })),
      tool: async () => {
        const res = await fetch("http://127.0.0.1:8080/api/resources");
        return res.json();
      }
    }),
    defineTool({
      name: "apply_safety_remediation",
      description: "Stops a wasteful service to save money. Use 'all' for bulk remediation.",
      inputSchema: z.object({
        serviceId: z.string().describe("The ID of the service to stop, or 'all'.")
      }),
      outputSchema: z.object({
        success: z.boolean(),
        message: z.string()
      }),
      tool: async ({ serviceId }) => {
        const data = await handleStopWaste(serviceId);
        return { success: data.success, message: data.message };
      }
    })
  ], [handleStopWaste]);

  // 4. Stable Component Definitions
  const components = useMemo(() => [
    {
      name: "SafetyCard",
      description: "Visual alert for critical spend thresholds.",
      component: (props: SafetyCardProps) => <SafetyCard {...props} onStop={() => handleStopWaste("all")} />,
      loadingComponent: SafetyCardLoading,
      propsSchema: z.object({
        riskLevel: z.enum(["danger", "warning"]),
        message: z.string(),
        costDelta: z.string().optional()
      })
    },
    {
      name: "ResourceList",
      description: "Detailed inventory of services with waste metrics.",
      component: (props: ResourceListProps) => <ResourceList {...props} onKill={(id) => handleStopWaste(id)} />,
      loadingComponent: ResourceListLoading,
      propsSchema: z.object({
        resources: z.array(z.object({
          id: z.string(),
          name: z.string(),
          cloud: z.string(),
          cost: z.number(),
          waste: z.number()
        }))
      })
    },
    {
      name: "StatusMeter",
      description: "Real-time consumption gauge.",
      component: StatusMeter,
      loadingComponent: StatusMeterLoading,
      propsSchema: z.object({
        freeTierUsed: z.number(),
        usedAmount: z.number().optional(),
        totalLimit: z.number().optional(),
        safe: z.boolean()
      })
    },
    {
      name: "DeployGuard",
      description: "Post-remediation deployment validator.",
      component: DeployGuard,
      loadingComponent: DeployGuardLoading,
      propsSchema: z.object({
        safeToDeploy: z.boolean(),
        reason: z.string().optional()
      })
    }
  ], [handleStopWaste]);

  // 5. Stable Initial Messages
  const initialMessages = useMemo(() => [
    {
      role: "system" as const,
      content: [{ 
        type: "text" as const, 
        text: `You are the SafeOps Cloud Security Agent. Your goal is to keep the cloud environment within free-tier limits ($0.00 spend). 
When user overspends:
1. Identify high-waste resources (> 70% waste) using list_cloud_resources.
2. Present a StatusMeter for overall context.
3. Present a SafetyCard with a critical warning.
4. Present a ResourceList so the user can see details.
5. Offer to stop waste using apply_safety_remediation.` 
      }]
    }
  ], []);

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY || "hackathon-key"}
      initialMessages={initialMessages}
      tools={tools}
      components={components}
    >
      <ChatTrigger context={context} />
      
      <div className="flex h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-red-500/10 overflow-hidden text-black dark:text-white">
        {/* Sidebar */}
        <aside className="hidden md:flex w-80 border-r border-zinc-200 dark:border-zinc-800 flex-col p-8 bg-white dark:bg-black shadow-2xl z-20">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-red-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter block uppercase">SafeOps</span>
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Guard Engine</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2">
            {[
              { label: "Overview", icon: LayoutDashboard, active: true },
              { label: "Cloud Pulse", icon: Activity, active: false },
              { label: "Gateways", icon: Globe, active: false },
            ].map((item) => (
              <a 
                key={item.label}
                href="#" 
                className={`flex items-center gap-4 px-4 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all
                  ${item.active 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white" 
                    : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${item.active ? "text-red-500" : ""}`} />
                {item.label}
              </a>
            ))}
          </nav>

          {/* Context Card */}
          <div className="mt-auto p-6 rounded-[2rem] bg-zinc-900 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Agent Context
            </p>
            {context ? (
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-2xl font-black leading-none">${context.billingStatus.totalSpend.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Current Month Spend</p>
                </div>
                <div className="h-px bg-white/5" />
                <p className="text-xs font-medium text-zinc-400 leading-relaxed italic overflow-hidden text-ellipsis line-clamp-2">
                   &quot;{context.recommendation}&quot;
                </p>
              </div>
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-24 bg-zinc-800 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-zinc-800 rounded" />
                  <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Interface */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="flex items-center justify-between p-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/5backdrop-blur-xl z-10">
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">Security Ops</h1>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Autonomous Free-Tier Protection</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={fetchContext}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-zinc-500"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black dark:bg-zinc-100 text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                <ExternalLink className="w-4 h-4" /> Cloud Console
              </button>
            </div>
          </header>

          {/* AI Chat Layer */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 p-8 pt-0">
               <TamboChat 
                welcomeMessage="I've analyzed your cloud infrastructure. Critical savings targets identified."
              />
            </div>
          </div>
        </main>
      </div>
    </TamboProvider>
  );
}
