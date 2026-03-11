 "use client";

import { ReactNode } from "react";

type MobileShellProps = {
  title: string;
  children: ReactNode;
};

export function MobileShell({ title, children }: MobileShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
            Vaultix
          </span>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background-soft px-4 py-4">
        {children}
      </main>

      <nav className="sticky bottom-0 z-10 border-t border-border-subtle bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-2.5 text-xs text-muted">
          <button className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium text-primary">
            <span>Wallets</span>
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium">
            <span>Transactions</span>
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium">
            <span>Stats</span>
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium">
            <span>Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

