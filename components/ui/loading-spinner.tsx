"use client";

import { cn } from "@/lib/utils/cn";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-4 border-[2px]",
  md: "size-6 border-[2px]",
  lg: "size-8 border-[3px]",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full border-primary/30 border-t-primary animate-[spinner-rotate_0.8s_linear_infinite]",
        sizeClasses[size],
        className,
      )}
    />
  );
}
