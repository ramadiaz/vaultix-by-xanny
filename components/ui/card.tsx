import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border-subtle bg-background px-5 py-6 shadow-sm shadow-black/30",
        className,
      )}
      {...props}
    />
  );
}

