"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function WalletsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[88px] w-full rounded-2xl" />
      <div className="flex gap-1">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-background/80 px-4 py-3"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
