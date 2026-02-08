"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Shield, Terminal, RefreshCw, Zap } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { fetchWithAuth } from "../utils/api";

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export function CloudView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'aws' | 'gcp' | 'logs'>('aws');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ aws: boolean; gcp: boolean }>({ aws: false, gcp: false });

  const fetchOverview = React.useCallback(async () => {
    if (!user) return;
    try {
      const [statusRes, logsRes] = await Promise.all([
        fetchWithAuth('/api/cloud/status'),
        fetchWithAuth('/api/cloud/logs')
      ]);

      if (!statusRes.ok) {
        console.error('Status API failed:', statusRes.status);
        addLog(`⚠️ Connection status check failed (${statusRes.status}). Retrying...`, 'warn');
        return;
      }

      if (!logsRes.ok) {
        console.error('Logs API failed:', logsRes.status);
        // Don't fail the whole fetch if logs fail
      }

      const statusData = await statusRes.json();
      const logsData = logsRes.ok ? await logsRes.json() : { entries: [] };
      
      setConnectionStatus({
        aws: statusData.aws?.connected || false,
        gcp: statusData.gcp?.connected || false
      });

      if (logsData.type === 'LOG_REPORT' && Array.isArray(logsData.entries)) {
        setLogs(logsData.entries);
      }
      
      // Show warning if database timeout detected
      if (statusData.warning) {
        addLog(`⚠️ ${statusData.warning}`, 'warn');
      }
    } catch (err) {
      console.error("Failed to fetch cloud overview:", err);
      addLog(`❌ Cloud API connection failed. Check backend logs.`, 'error');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchOverview();

    // Setup periodic polling
    const interval = setInterval(fetchOverview, 5000);

    return () => clearInterval(interval);
  }, [user, fetchOverview]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    setLogs(prev => [...prev.slice(-49), { timestamp: new Date().toISOString(), level, message }]);
  };

  const handleConnectAWS = async () => {
    const accessKey = prompt("Enter AWS Access Key ID:");
    const secretKey = prompt("Enter AWS Secret Access Key:");
    if (!accessKey || !secretKey) return;
    
    setIsSyncing(true);
    addLog(`AWS-UPLINK: Establishing secure identity link...`, 'info');
    
    try {
      const res = await fetchWithAuth('/api/cloud/update-credentials', {
        method: 'POST',
        body: JSON.stringify({ 
          provider: 'aws', 
          credentials: { accessKey, secretKey } 
        })
      });
      const result = await res.json();
      if (result.type === 'REPORT') {
        addLog(`AWS-SUCCESS: ${result.summary}`, 'success');
        fetchOverview();
      } else {
        addLog(`AWS-ERROR: ${result.message || 'Uplink failed'}`, 'error');
      }
    } catch {
      addLog(`AWS-ERROR: Uplink failed.`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectGCP = async () => {
    const jsonStr = prompt("Paste your GCP Service Account JSON content:");
    if (!jsonStr) return;
    
    setIsSyncing(true);
    addLog(`GCP-UPLINK: Registering cloud identity...`, 'info');
    
    try {
      const credentials = JSON.parse(jsonStr);
      const res = await fetchWithAuth('/api/cloud/update-credentials', {
        method: 'POST',
        body: JSON.stringify({ 
          provider: 'gcp', 
          credentials
        })
      });
      const result = await res.json();
      if (result.type === 'REPORT') {
        addLog(`GCP-SUCCESS: ${result.summary}`, 'success');
        fetchOverview();
      } else {
        addLog(`GCP-ERROR: ${result.message || 'Uplink failed'}`, 'error');
      }
    } catch (e) {
      addLog(`GCP-ERROR: Invalid JSON or Uplink failure.`, 'error');
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Scraped OAuth callback logic - simplified and focused on direct feedback

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
                <div className={`border p-12 flex flex-col items-center justify-center text-center space-y-6 transition-all ${connectionStatus.aws ? 'bg-green-500/5 border-green-500/20' : 'bg-zinc-50 dark:bg-zinc-950 border-foreground/10'}`}>
                  <div className={`w-16 h-16 flex items-center justify-center rounded-full transition-all ${connectionStatus.aws ? 'bg-green-500 text-white' : 'bg-foreground text-background'}`}>
                    {connectionStatus.aws ? <Zap size={32} /> : <Shield size={32} />}
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-lg font-black uppercase italic ${connectionStatus.aws ? 'text-green-500' : ''}`}>
                      Amazon Web Services {connectionStatus.aws && "— ACTIVE"}
                    </h3>
                    <p className="text-[11px] font-mono opacity-60 max-w-sm">
                      {connectionStatus.aws 
                        ? "Your AWS infrastructure is securely linked. Real-time telemetry is being streamed to your dashboard."
                        : "Onboard your AWS infrastructure using IAM Access Keys. Ensure the user has the required cross-account resource read permissions."}
                    </p>
                  </div>
                  <button 
                    onClick={handleConnectAWS}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-12 py-4 text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 ${
                      connectionStatus.aws ? 'bg-green-500 text-white' : 'bg-foreground text-background'
                    }`}
                  >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Establishing Secure Link..." : (connectionStatus.aws ? "Update AWS Credentials" : "Onboard AWS Credentials")}
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
                <div className={`border p-12 flex flex-col items-center justify-center text-center space-y-6 transition-all ${connectionStatus.gcp ? 'bg-blue-500/5 border-blue-500/20' : 'bg-zinc-50 dark:bg-zinc-900/10 border-foreground/10'}`}>
                  <div className={`w-16 h-16 flex items-center justify-center rounded-sm transition-all ${connectionStatus.gcp ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}>
                    <Cloud size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-lg font-black uppercase italic ${connectionStatus.gcp ? 'text-blue-600' : 'text-blue-600'}`}>
                      Google Cloud Platform {connectionStatus.gcp && "— ACTIVE"}
                    </h3>
                    <p className="text-[11px] font-mono opacity-60 max-w-sm">
                      {connectionStatus.gcp
                        ? "Your GCP Service Account is linked. Guarding your cloud resources with real-time audit intelligence."
                        : "Onboard your GCP infrastructure by providing a Service Account JSON. We recommend a read-only role for security."}
                    </p>
                  </div>
                  <button 
                    onClick={handleConnectGCP}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-12 py-4 text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 ${
                      connectionStatus.gcp ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Initializing Uplink..." : (connectionStatus.gcp ? "Update GCP Credentials" : "Onboard GCP Credentials")}
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
                  className="bg-black/80 backdrop-blur-md text-zinc-400 p-8 h-[450px] overflow-y-auto font-mono text-[11px] border border-foreground/20 shadow-2xl relative"
                >
                  <div className="absolute top-4 right-8 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-green-500/50">Stream Active</span>
                  </div>

                  {logs.length > 0 ? (
                    logs.map((log, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="mb-2 flex gap-5 leading-relaxed group"
                      >
                        <span className="opacity-20 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className={`uppercase font-black shrink-0 w-20 tracking-tighter ${
                          log.level === 'success' ? 'text-green-500' : 
                          log.level === 'error' ? 'text-red-500/80' : 
                          log.level === 'warn' ? 'text-yellow-500/70' : 'text-blue-500/60'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-zinc-100/90 group-hover:text-white transition-colors">{log.message}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
                       <Terminal size={40} strokeWidth={1} />
                       <div className="text-center">
                         <p className="font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Uplink Telemetry</p>
                         <p className="text-[9px] mt-1 font-mono">Listening on global.cloud_logs_stream...</p>
                       </div>
                    </div>
                  )}
                  
                  {logs.length > 0 && (
                    <div className="h-4 flex items-center gap-2 mt-6 opacity-30">
                      <div className="w-1.5 h-1.5 bg-foreground animate-pulse rounded-full" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Awaiting next entry...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-4 space-y-8">
          <div className="p-8 border border-foreground bg-black/5 dark:bg-zinc-900/10">
            <h4 className="text-[12px] font-bold uppercase mb-4 flex items-center gap-2">
              <Shield size={14} /> Security Protocol
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                <span className="text-zinc-400">Auth Context</span>
                <span className={`font-black ${user ? 'text-green-500' : 'text-red-500'}`}>
                  {user ? 'AUTHENTICATED' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                <span className="text-zinc-400">Stream Integrity</span>
                <span className={`font-black ${(connectionStatus.aws || connectionStatus.gcp) ? 'text-green-500' : 'text-yellow-500/50'}`}>
                  {(connectionStatus.aws || connectionStatus.gcp) ? 'VERIFIED' : 'AWAITING'}
                </span>
              </div>
              <div className={`flex justify-between items-center text-[11px] uppercase tracking-wider ${!user ? 'opacity-30' : ''}`}>
                <span className="text-zinc-400">Credential Cache</span>
                <span className={`font-black ${(connectionStatus.aws || connectionStatus.gcp) ? 'text-green-500' : 'text-zinc-500'}`}>
                   {(connectionStatus.aws || connectionStatus.gcp) ? 'SECURED' : 'LOCKED'}
                </span>
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
