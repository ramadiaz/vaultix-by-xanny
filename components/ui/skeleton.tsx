"use client";

import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "skeleton-shimmer rounded-xl bg-accent-soft/60",
        className,
      )}
    />
  );
}
