"use client";

import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-2xl ${className}`} 
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
