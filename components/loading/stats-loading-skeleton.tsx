"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StatsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="min-h-[88px] w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[210px] w-full rounded-2xl" />
      <Skeleton className="h-[320px] w-full rounded-2xl" />
    </div>
  );
}
