"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { 
  SafetyCard, 
  ResourceList, 
  StatusMeter, 
  DeployGuard 
} from "../components/TamboComponents";
import TamboChat from "../components/TamboChat";
import { useAuth } from "../components/AuthProvider";

/**
 * SafeOps Co-pilot MVP: Main Dashboard
 * Theme: Strict Black & White
 */

export default function SafeOpsDashboard() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const [context, setContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchContext = useCallback(async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8080/api/billing/context", { headers });
      if (!response.ok) throw new Error("Failed to reach infrastructure");
      const data = await response.json();
      setContext(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchContext();
      const interval = setInterval(fetchContext, 10000);
      return () => clearInterval(interval);
    }
  }, [user, authLoading, fetchContext]);

  const handleOnboard = async (provider, creds) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const resp = await fetch("http://localhost:8080/api/onboard/", {
        method: 'POST',
        headers,
        body: JSON.stringify({ provider, credentials: creds })
      });
      if (resp.ok) {
        setIsOnboarded(true);
        setShowOnboardModal(false);
        fetchContext();
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background overflow-hidden">
      {/* Sidebar - Monochrome */}
      <Sidebar className="border-r border-zinc-200 dark:border-zinc-800" />

      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-full" />
            <h1 className="font-black text-lg tracking-tighter">SafeOps <span className="text-zinc-400">Co-pilot</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.email}</span>
                <button 
                  onClick={logout}
                  className="px-3 py-1 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="px-4 py-1.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded"
              >
                Login with Google
              </button>
            )}
            
            {!isOnboarded && (
              <button 
                onClick={() => setShowOnboardModal(true)}
                className="px-4 py-1.5 border-2 border-foreground text-foreground text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all rounded"
              >
                Connect Cloud
              </button>
            )}
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Live Monitor // {context?.timestamp ? new Date(context.timestamp).toLocaleTimeString() : 'offline'}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          {error && (
            <div className="bg-red-500/10 border border-red-500 p-4 rounded text-red-500 text-xs font-bold uppercase tracking-widest">
              Error // {error}
            </div>
          )}
          {/* Top Row: Safety & Status */}
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-8">
              <SafetyCard 
                data={context?.billingStatus} 
                recommendation={context?.recommendation}
                isLoading={isLoading} 
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <StatusMeter 
                metrics={context?.metrics} 
                isLoading={isLoading} 
              />
            </div>
          </div>

          {/* Middle Row: Inventory & Deploy Guard */}
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-7">
              <ResourceList isLoading={isLoading} />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <DeployGuard />
            </div>
          </div>
        </div>

        {/* Tambo Interaction Layer */}
        <TamboChat />

        {/* Onboarding Modal Overlay */}
        {showOnboardModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border-2 border-foreground w-full max-w-md p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
              <div className="flex justify-between items-start mb-8">
                <h2 className="font-black text-2xl">Connect Infrastructure</h2>
                <button onClick={() => setShowOnboardModal(false)} className="text-zinc-400 hover:text-foreground">✕</button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Cloud Provider</label>
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 border border-foreground text-xs font-bold tracking-tighter hover:bg-zinc-100 transition-colors">AWS</button>
                    <button className="flex-1 py-3 border border-zinc-200 text-xs font-bold tracking-tighter opacity-50 cursor-not-allowed">GCP (Coming Soon)</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">IAM Access Key</label>
                  <input type="text" className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono outline-none focus:border-foreground" placeholder="AKIA..." />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Secret Access Key</label>
                  <input type="password" placeholder="••••••••••••••••" className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono outline-none focus:border-foreground" />
                </div>

                <button 
                  onClick={() => handleOnboard('aws', { key: 'mock' })}
                  className="w-full py-4 bg-foreground text-background font-black uppercase tracking-widest hover:bg-zinc-800 transition-all mt-4"
                >
                  Verify & Connect
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}