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
    { icon: <LayoutDashboard size={20} strokeWidth={2} />, label: "Dashboard" },
    { icon: <Database size={20} strokeWidth={2} />, label: "Inventory" },
    { icon: <BarChart3 size={20} strokeWidth={2} />, label: "Billing" },
    { icon: <ShieldCheck size={20} strokeWidth={2} />, label: "Security Audit" },
    { icon: <UserPlus size={20} strokeWidth={2} />, label: "Onboard" },
    { icon: <Cloud size={20} strokeWidth={2} />, label: "Cloud" },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={`h-full bg-background border-r border-foreground flex flex-col relative z-20 ${className}`}
    >
      {/* branding area */}
      <div className="px-6 h-20 flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center text-background font-black text-sm">
            SO
          </div>
          {isExpanded && (
            <span className="font-bold tracking-tight text-[15px] uppercase">SafeOps</span>
          )}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronRight size={18} />
          </motion.div>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item, idx) => (
          <motion.div 
            key={idx}
            onClick={() => onViewChange(item.label)}
            className={`flex items-center gap-4 px-4 py-3 cursor-pointer group transition-all rounded-md
              ${item.label === activeView ? 'bg-foreground text-background' : 'text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
          >
            <div className="shrink-0">
              {item.icon}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[12px] font-bold uppercase tracking-tight whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </nav>

      <div className="p-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 shrink-0 overflow-hidden border border-foreground/10" />
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-[11px] font-bold truncate">Admin User</span>
              <span className="text-[9px] text-zinc-500 truncate">SafeOps Control</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
