import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-glass-border bg-glass-bg px-5 py-6 shadow-sm shadow-black/20 backdrop-blur-[var(--glass-blur)]",
        className,
      )}
      {...props}
    />
  );
}

