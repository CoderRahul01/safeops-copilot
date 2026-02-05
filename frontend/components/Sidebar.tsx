"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  ShieldCheck, 
  UserPlus, 
  Cloud,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar({ className, activeView, onViewChange }: { className?: string, activeView: string, onViewChange: (view: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { icon: <Database size={18} />, label: "Inventory" },
    { icon: <BarChart3 size={18} />, label: "Billing" },
    { icon: <ShieldCheck size={18} />, label: "Security Audit" },
    { icon: <UserPlus size={18} />, label: "Onboard" },
    { icon: <Cloud size={18} />, label: "Cloud" },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`h-full bg-background flex flex-col pt-8 relative z-20 ${className}`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-10 w-8 h-8 bg-foreground text-background flex items-center justify-center rounded-full border-4 border-background hover:scale-110 transition-transform z-30"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
        >
          <ChevronRight size={16} />
        </motion.div>
      </button>

      <div className={`px-6 mb-12 flex items-center gap-4 ${!isExpanded && 'justify-center'}`}>
        <div className="w-8 h-8 bg-foreground rounded-sm shrink-0 flex items-center justify-center text-background font-black text-lg">S</div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-black tracking-[0.2em] text-xs uppercase whitespace-nowrap"
            >
              SafeOps
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ x: 4 }}
            onClick={() => onViewChange(item.label)}
            className={`flex items-center gap-4 px-4 py-3 rounded cursor-pointer group transition-all relative
              ${item.label === activeView ? 'bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]' : 'text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 border-l-2 border-transparent hover:border-foreground'}`}
          >
            <div className={`shrink-0 ${item.label === activeView ? 'text-background' : 'text-zinc-400 group-hover:text-foreground group-hover:scale-110 transition-transform'}`}>
              {item.icon}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.label}
              </div>
            )}
          </motion.div>
        ))}
      </nav>

      <div className={`p-6 border-t border-zinc-100 dark:border-zinc-800 ${!isExpanded && 'flex flex-col items-center'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 border-2 border-foreground/10 overflow-hidden relative group">
            <div className="w-full h-full bg-gradient-to-br from-zinc-400 to-zinc-600" />
            <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-20 transition-opacity" />
          </div>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-[10px] font-black uppercase truncate">Rahul Pandey</span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-tighter truncate">Enterprise Protocol</span>
            </motion.div>
          )}
        </div>

        {/* Cloud Quest Progress (Gamification) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 border-2 border-foreground bg-zinc-50 dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest">Zero Waste Quest</span>
                <span className="text-[10px] font-black text-green-600">Day 7</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                />
              </div>
              <p className="text-[8px] font-bold text-zinc-500 mt-2 uppercase">Reward: 200 Security Points</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Stream Miniature Console */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-zinc-900 rounded p-3 font-mono text-[8px] space-y-1 border border-white/5 overflow-hidden"
            >
              <div className="flex justify-between text-zinc-600">
                <span>AUTH_STREAM</span>
                <span className="text-green-500/50 animate-pulse">●</span>
              </div>
              <div className="text-zinc-500 truncate">{`> FETCHING_METRICS...`}</div>
              <div className="text-zinc-400 truncate tracking-tighter">{`[OK] GCP_RUN_RESOURCES_SYNCED`}</div>
              <div className="text-zinc-600 italic">UPTIME: 14:32:01:44</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
