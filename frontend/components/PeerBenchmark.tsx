"use client";

import React from "react";
import { Users, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function PeerBenchmark() {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Peer Benchmarking</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">How you compare to similar projects</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Your Efficiency</p>
              <p className="text-3xl font-bold">Top 33%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Target</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Top 10%</p>
            </div>
          </div>
          
          <div className="relative w-full h-4 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "67%" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            />
            <div className="absolute left-[90%] top-0 w-0.5 h-full bg-white dark:bg-black z-10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Avg. Peer Cost</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">$8.40 /req</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Your Cost</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">$5.20 /req</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
          <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
            Peers with similar traffic save <span className="font-bold underline decoration-2 underline-offset-4">43% more</span> by using preemptible instances.
          </p>
        </div>
      </div>
    </div>
  );
}
