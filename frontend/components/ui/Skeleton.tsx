"use client";

import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded ${className}`}
      style={{ animationDuration: '0.8s' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-48" />
      <div className="pt-8 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}
