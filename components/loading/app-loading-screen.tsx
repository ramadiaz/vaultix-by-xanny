"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

type AppLoadingScreenProps = {
  message?: string;
};

export function AppLoadingScreen({ message = "Loading" }: AppLoadingScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background-soft">
      <LoadingSpinner size="lg" className="text-primary" />
      <p className="text-xs font-medium text-muted animate-pulse">{message}</p>
    </div>
  );
}
