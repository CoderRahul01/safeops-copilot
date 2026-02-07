"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Shield, Terminal, RefreshCw, Zap } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export function CloudView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'aws' | 'gcp' | 'logs'>('aws');
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toISOString(), level: 'info', message: "SOP-KERNEL-LINK: Initializing cloud gateway..." },
    { timestamp: new Date().toISOString(), level: 'success', message: "AUTH-PROTOCOL: Active session detected." },
    { timestamp: new Date().toISOString(), level: 'warn', message: "GCP-ADAPTER: No project ID configured." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/cloud/logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    setLogs(prev => [...prev.slice(-49), { timestamp: new Date().toISOString(), level, message }]);
  };

  const handleConnectAWS = async () => {
    const roleArn = prompt("Enter AWS Role ARN (CloudFormation/IAM Role):");
    if (!roleArn) return;
    
    setIsSyncing(true);
    addLog(`AWS-FEDERATION: Initiating OIDC handshake...`, 'info');
    
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("No auth token available");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/cloud/connect/aws`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roleArn })
      });
      const result = await res.json();
      if (result.success) {
        addLog(`AWS-LINK: ${result.message}`, 'success');
      } else {
        addLog(`AWS-ERROR: ${result.error}`, 'error');
      }
    } catch {
      addLog(`AWS-ERROR: Gateway unreachable.`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectGCP = async () => {
    setIsSyncing(true);
    addLog(`GCP-FEDERATION: Fetching OAuth link...`, 'info');
    
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("No auth token available");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/cloud/connect/gcp`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { url } = await res.json();
      
      if (url) {
        addLog(`GCP-REDIRECT: Opening secure consent window.`, 'info');
        window.location.href = url; // Redirect to Google
      } else {
        addLog(`GCP-ERROR: Failed to generate login link.`, 'error');
      }
    } catch {
      addLog(`GCP-ERROR: Gateway unreachable.`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Check for OAuth callback in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      addLog(`OAuth-CALLBACK: Exchanging code for tokens...`, 'info');
      const fetchCallback = async () => {
        try {
          const token = await user.getIdToken();
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
          const res = await fetch(`${apiUrl}/api/cloud/oauth/callback`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code, state })
          });
          const result = await res.json();
          if (result.success) {
            addLog(`GCP-LINK: Cloud connection established.`, 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            addLog(`GCP-ERROR: ${result.error}`, 'error');
          }
        } catch {
          addLog(`GCP-ERROR: Callback failed.`, 'error');
        }
      };
      
      fetchCallback();
    }
  }, [user]);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-foreground pb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-foreground text-background">
            <Cloud size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Cloud Connectivity</h2>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none mt-1">
              ORCHESTRATION LAYER // MULTI-CLOUD GATEWAY
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
            {['aws', 'gcp', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'aws' | 'gcp' | 'logs')}
              className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-foreground text-background' 
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'aws' && (
              <motion.div
                key="aws"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-foreground/10 p-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-foreground text-background flex items-center justify-center rounded-full">
                    <Shield size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black uppercase italic">Federated AWS Identity</h3>
                    <p className="text-[11px] font-mono opacity-60 max-w-sm">
                      SafeOps uses IAM Roles with OIDC federation. Connect your account to generate short-lived STS session tokens. No long-term keys stored.
                    </p>
                  </div>
                  <button 
                    onClick={handleConnectAWS}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-foreground text-background px-12 py-4 text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Establishing Secure Link..." : "Connect AWS Account"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'gcp' && (
              <motion.div
                key="gcp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-foreground/10 p-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center rounded-sm">
                    <Cloud size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black uppercase italic text-blue-600">Google Cloud Platform</h3>
                    <p className="text-[11px] font-mono opacity-60 max-w-sm">
                      Authorize SafeOps using Google OAuth2. We request read-only compute access and policy monitoring scopes.
                    </p>
                  </div>
                  <button 
                    onClick={handleConnectGCP}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-blue-600 text-white px-12 py-4 text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Initiating Protocol..." : "Connect GCP via OAuth"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div 
                  ref={scrollRef}
                  className="bg-zinc-950 text-zinc-400 p-6 h-[400px] overflow-y-auto font-mono text-[11px] border border-foreground/10 shadow-inner"
                >
                  {logs.map((log, i) => (
                    <div key={i} className="mb-1.5 flex gap-4 leading-relaxed">
                      <span className="opacity-30 shrink-0">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                      <span className={`uppercase font-bold shrink-0 w-16 ${
                        log.level === 'success' ? 'text-green-500' : 
                        log.level === 'error' ? 'text-red-500' : 
                        log.level === 'warn' ? 'text-yellow-500' : 'text-blue-500'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-zinc-200">{log.message}</span>
                    </div>
                  ))}
                  <div className="h-4 flex items-center gap-2 mt-4 opacity-50">
                    <div className="w-1.5 h-1.5 bg-foreground animate-pulse rounded-full" />
                    <span>KERNEL_LISTENING...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-4 space-y-8">
          <div className="p-8 border border-foreground bg-zinc-50 dark:bg-zinc-900/10">
            <h4 className="text-[12px] font-bold uppercase mb-4 flex items-center gap-2">
              <Shield size={14} /> Security Status
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                <span className="text-zinc-400">Encryption (At Rest)</span>
                <span className="font-bold">Active</span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                <span className="text-zinc-400">Credential Rotation</span>
                <span className="font-bold text-red-500">EXPIRED</span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                <span className="text-zinc-400">Vault Handshake</span>
                <span className="font-bold">Verified</span>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-foreground/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-foreground/5 flex items-center justify-center">
                  <Zap size={18} className="text-yellow-500" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 mb-0.5">Safety Priority</span>
                  <span className="text-sm font-black uppercase italic leading-none">High Intensity</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setShowDevTools(!showDevTools)}
            className="p-8 border border-foreground/10 bg-background flex flex-col items-center text-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors"
          >
             <Terminal size={32} strokeWidth={1} className="opacity-20 mb-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Information</span>
             <p className="text-[11px] mt-2 opacity-60 font-mono">
               {showDevTools ? "DEVELOPER_MODE_ACTIVE // RAW_KEY_ACCESS_ENABLED" : "SafeOps interacts directly with cloud control planes using short-lived tokens. No keys stored."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
