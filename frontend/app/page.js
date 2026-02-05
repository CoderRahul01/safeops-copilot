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

/**
 * SafeOps Co-pilot: Cinematic Real-time Dashboard
 * High-Impact B&W Aesthetic
 */

export default function SafeOpsDashboard() {
  const { user, login, logout } = useAuth();
  const [isLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");
  const [consoleLogs, setConsoleLogs] = useState([
    "INITIALIZING_MAINFRAME_U1...",
    "SYNCING_CLOUD_RESOURCES...",
    "READY_FOR_PROTOCOL_Z"
  ]);
  
  // Real-time Mock Data States
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

  // Real-time Simulation Engine
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      // Add a random console log occasionally
      if (Math.random() > 0.9) {
        setConsoleLogs(prev => [...prev.slice(-4), `INBOUND_SIGNAL // [OK] ${new Date().toISOString()}`]);
      }
      // Simulate slight spend fluctuations
      setBillingData(prev => ({
        ...prev,
        totalSpend: +(prev.totalSpend + (Math.random() * 0.5)).toFixed(2)
      }));

      // Simulate risk score drift
      setRiskMetrics(prev => ({
        ...prev,
        risk_score: Math.max(0.05, Math.min(0.95, prev.risk_score + (Math.random() * 0.02 - 0.01)))
      }));

      // Randomly change an audit status
      if (Math.random() > 0.8) {
        setAuditChecks(prev => {
          const next = [...prev];
          const idx = Math.floor(Math.random() * next.length);
          next[idx].status = Math.random() > 0.5 ? 'PASS' : 'WARN';
          return next;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Real-Time Remediation Handler
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
      
      const result = await response.json();
      console.log(`✅ [Mainframe] Step ${stepIndex + 1} remediated:`, result.action);

      // Update local state to reflect completion
      setWorkflowSteps(prev => {
        const next = [...prev];
        next[stepIndex] = { ...next[stepIndex], completed: true };
        return next;
      });

    } catch (err) {
      console.error("Remediation failure:", err);
      throw err;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background overflow-hidden relative">
      {/* Sidebar - Collapsible Monochrome */}
      <Sidebar 
        className="border-r-4 border-foreground" 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b-4 border-foreground flex items-center justify-between px-10 bg-background/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center text-background font-black text-xl italic">SO</div>
            <h1 className="font-black text-2xl tracking-tighter uppercase italic">
              SafeOps <span className="text-zinc-400">Mainframe</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                System Status: OPTIMAL // LIVE_FEED
              </div>
              <div className="text-[8px] font-mono text-foreground/40 uppercase">UTC: {mounted ? new Date().toISOString() : ''}</div>
            </div>

            {user ? (
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-zinc-200 pl-6 h-6 flex items-center">{user.email}</span>
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-background border-4 border-foreground text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                >
                  Terminate Session
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="px-6 py-2 bg-foreground text-background text-xs font-black uppercase tracking-widest hover:invert transition-all flex items-center gap-2"
              >
                Authenticate
              </button>
            )}
          </div>
        </header>

        {/* Cinematic Dashboard Layout */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px]">
          {activeView === "Dashboard" ? (
            <>
              {/* Row 1: Safety Card & Status Meter */}
              <section className="grid grid-cols-12 gap-12">
                <div className="col-span-12 lg:col-span-8">
                  <SafetyCard 
                    data={billingData} 
                    recommendation="Resource allocation within nominal parameters. Cloud Run instances showing 94% efficiency."
                    isLoading={isLoading} 
                  />
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <StatusMeter 
                    metrics={riskMetrics} 
                    isLoading={isLoading} 
                  />
                </div>
              </section>

              {/* Row 2: Security Audit & Troubleshooting */}
              <section className="grid grid-cols-12 gap-12">
                <div className="col-span-12 lg:col-span-7">
                  <SafetyAudit checks={auditChecks} score={88} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                  <TroubleshootingWorkflow 
                    steps={workflowSteps} 
                    issueId="INCIDENT-882-B" 
                    onSync={handleRemediate}
                  />
                </div>
              </section>

              {/* Row 3: Resource List & Deploy Guard */}
              <section className="grid grid-cols-12 gap-12 pb-24">
                <div className="col-span-12 lg:col-span-8">
                  <ResourceList isLoading={isLoading} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <DeployGuard />
                </div>
              </section>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] border-8 border-foreground border-dashed opacity-20">
              <h2 className="text-6xl font-black italic uppercase tracking-[0.2em]">{activeView}</h2>
              <p className="mt-4 font-mono text-sm tracking-widest uppercase italic">Subsystem_Pending_Authorization // protocol_x</p>
            </div>
          )}

          {/* Global Dashboard Console Log */}
          <section className="fixed bottom-0 right-0 left-0 h-10 bg-foreground text-background flex items-center px-10 gap-10 overflow-hidden z-20 pointer-events-none">
            <div className="text-[10px] font-black italic uppercase shrink-0">Mainframe_Stream //</div>
            <div className="flex items-center gap-12 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
              {consoleLogs.map((log, i) => (
                <span key={i} className="text-[8px] font-mono tracking-tighter opacity-70 italic">{`> ${log}`}</span>
              ))}
              {/* Repeat for seamless scroll */}
              {consoleLogs.map((log, i) => (
                <span key={`dup-${i}`} className="text-[8px] font-mono tracking-tighter opacity-70 italic">{`> ${log}`}</span>
              ))}
            </div>
          </section>
        </div>

        {/* High-Impact AI Chat Trigger */}
        <TamboChat />
      </main>
    </div>
  );
}