"use client";

import React from "react";
import { LayoutDashboard, ShieldAlert, Zap, Settings, BarChart3, Database } from "lucide-react";

export function Sidebar({ className }: { className?: string }) {
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: true },
    { icon: <ShieldAlert size={18} />, label: "Safety Alerts", count: 2 },
    { icon: <Zap size={18} />, label: "Deploy Guard" },
    { icon: <Database size={18} />, label: "Resources" },
    { icon: <BarChart3 size={18} />, label: "Billing Analytics" },
    { icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <aside className={`w-64 h-full bg-background flex flex-col pt-8 ${className}`}>
      <div className="px-8 mb-12 flex items-center gap-3">
        <div className="w-6 h-6 bg-foreground rounded-sm" />
        <span className="font-black tracking-[0.2em] text-xs uppercase">SafeOps</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item, idx) => (
          <div 
            key={idx}
            className={`flex items-center justify-between px-4 py-3 rounded cursor-not-allowed group transition-all
              ${item.active ? 'bg-foreground text-background shadow-lg' : 'text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
          >
            <div className="flex items-center gap-4">
              <span className={item.active ? 'text-background' : 'text-zinc-400 group-hover:text-foreground'}>
                {item.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </div>
            {item.count && (
              <span className={`text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border
                ${item.active ? 'border-background bg-background text-foreground' : 'border-foreground bg-foreground text-background'}`}>
                {item.count}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="p-8 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase">Admin User</span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-tighter">Pro Plan // Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
