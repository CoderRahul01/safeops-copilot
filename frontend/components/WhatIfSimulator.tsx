"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatIfSimulator() {
  const [isOptimized, setIsOptimized] = useState(false);

  return (
    <div className="p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-700 dark:border-zinc-800 shadow-2xl relative overflow-hidden h-full flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">What-If Simulator</h2>
          <p className="text-sm text-zinc-500">Projected savings calculator</p>
        </div>
      </div>

      <div className="flex-1 space-y-8 relative z-10">
        <div className="flex items-center justify-between p-1 bg-zinc-800 rounded-2xl">
          <button 
            onClick={() => setIsOptimized(false)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all
              ${!isOptimized ? "bg-zinc-700 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Current Path
          </button>
          <button 
            onClick={() => setIsOptimized(true)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all
              ${isOptimized ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Optimized Path
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Monthly Run-rate</span>
            <AnimatePresence mode="wait">
              <motion.span 
                key={isOptimized ? "opt" : "cur"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`text-3xl font-bold ${isOptimized ? "text-red-500" : "text-white"}`}
              >
                {isOptimized ? "$98.40" : "$247.50"}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: isOptimized ? "40%" : "100%" }}
              className={`h-full transition-all duration-1000 ${isOptimized ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-zinc-600"}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Yearly Waste</p>
              <p className={`text-lg font-bold ${isOptimized ? "text-zinc-400 line-through" : "text-white"}`}>
                $1,789.00
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-emerald-500">Total Saved</p>
              <p className="text-lg font-bold text-emerald-500">
                {isOptimized ? "-$1,247.50" : "$0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <button 
          className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-[0.98] transition-all"
          onClick={() => setIsOptimized(true)}
        >
          {isOptimized ? "Implementation Active" : "Apply Optimization"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
