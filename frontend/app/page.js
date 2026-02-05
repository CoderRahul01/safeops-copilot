"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { 
  SafetyCard, 
  ResourceList, 
  StatusMeter, 
  DeployGuard,
  TroubleshootingWorkflow,
  SafetyAudit
} from "../components/TamboComponents";
import TamboChat from "../components/TamboChat";
import { useAuth } from "../components/AuthProvider";

export default function SafeOpsDashboard() {
  const { user, login, logout } = useAuth();
  const [isLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");
  
  const [billingData, setBillingData] = useState({ totalSpend: 420.69, budget: 1000 });
  const [riskMetrics, setRiskMetrics] = useState({ risk_score: 0.15, active_resources: 12, saving_potential: 85.00 });
  const [auditChecks, setAuditChecks] = useState([
    { category: "IAM_POLICIES", status: 'PASS', message: "All root accounts MFA enabled." },
    { category: "NETWORK_GATE", status: 'WARN', message: "Port 22 open on 2 dev instances." },
    { category: "DATA_ENCRYPTION", status: 'PASS', message: "RDS volumes AES-256 active." }
  ]);
  const [workflowSteps] = useState([
    { completed: true, label: "Isolate Node", description: "Detecting anomalous outbound traffic..." },
    { completed: false, label: "Rotate Keys", description: "Generating new IAM credentials..." },
    { completed: false, label: "Patch Fleet", description: "Deploying security update SEC-042..." }
  ]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setBillingData(prev => ({
        ...prev,
        totalSpend: +(prev.totalSpend + (Math.random() * 0.5)).toFixed(2)
      }));
      setRiskMetrics(prev => ({
        ...prev,
        risk_score: Math.max(0.05, Math.min(0.95, prev.risk_score + (Math.random() * 0.02 - 0.01)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRemediate = async (stepIndex) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch("http://localhost:8080/api/security-audit/remediate", {
        method: 'POST',
        headers,
        body: JSON.stringify({ issueId: "INCIDENT-882-B", stepIndex })
      });
      if (!response.ok) throw new Error("Remediation protocol intercepted.");
    } catch (err) {
      console.error("Remediation failure:", err);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background overflow-hidden relative">
      <Sidebar 
        className="border-r border-foreground" 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="h-16 border-b border-foreground flex items-center justify-between px-12 bg-background z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase tracking-tighter italic">SafeOps Dashboard</h1>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System: Optimal</span>
              </div>
              <div className="text-[10px] opacity-20 uppercase font-mono" suppressHydrationWarning>{mounted ? new Date().toLocaleTimeString() : '--:--:--'}</div>
            </div>

            <div className="w-px h-6 bg-foreground/10" />

            {user ? (
              <div className="flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{user.displayName || 'Rahul Pandey'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground opacity-10" />
                </div>
                <button 
                  onClick={logout}
                  className="px-4 py-1.5 border border-foreground text-[9px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="px-6 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Authenticate
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          {activeView === "Dashboard" ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-8">
                  <SafetyCard 
                    data={billingData} 
                    recommendation="Global resource efficiency optimized."
                    isLoading={isLoading} 
                  />
                </div>
                <div className="md:col-span-4">
                  <StatusMeter 
                    metrics={riskMetrics}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-7">
                  <SafetyAudit 
                    checks={auditChecks} 
                    score={89} 
                  />
                </div>
                <div className="md:col-span-5">
                  <TroubleshootingWorkflow 
                    steps={workflowSteps} 
                    issueId="INCIDENT-882-B" 
                    onSync={handleRemediate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12">
                <div className="md:col-span-8">
                  <ResourceList isLoading={isLoading} />
                </div>
                <div className="md:col-span-4">
                  <DeployGuard />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] border border-foreground/10 border-dashed">
              <h2 className="text-6xl font-black uppercase tracking-tight italic opacity-20">{activeView}</h2>
              <p className="mt-4 font-mono text-[10px] opacity-40 uppercase tracking-widest">Module Standby</p>
            </div>
          )}
        </div>

        <TamboChat />
      </main>
    </div>
  );
}