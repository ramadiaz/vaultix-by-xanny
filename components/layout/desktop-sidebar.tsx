"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { RefreshCw, Wallet, ArrowLeftRight, BarChart2, Settings, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useSync } from "@/features/sync/context/sync-provider";
import { useHasPendingSync } from "@/features/sync/hooks/use-has-pending-sync";
import { cn } from "@/lib/utils/cn";

type NavTab = "wallets" | "transactions" | "stats" | "settings";

type DesktopSidebarProps = {
  activeTab: NavTab;
};

const NAV_ITEMS = [
  { tab: "wallets" as NavTab, label: "Wallets", href: "/", Icon: Wallet },
  { tab: "transactions" as NavTab, label: "Transactions", href: "/transactions", Icon: ArrowLeftRight },
  { tab: "stats" as NavTab, label: "Stats", href: "/stats", Icon: BarChart2 },
  { tab: "settings" as NavTab, label: "Settings", href: "/settings", Icon: Settings },
];

export function DesktopSidebar({ activeTab }: DesktopSidebarProps) {
  const { user } = useAuth();
  const { sync, state: syncState } = useSync();
  const hasPendingSync = useHasPendingSync();
  const isSyncing = syncState.status === "syncing";

  return (
    /* Hidden on mobile, shown as fixed sidebar on lg+ */
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-glass-border bg-glass-bg/80 backdrop-blur-[var(--glass-blur-strong)] lg:flex">
      {/* Gradient border right edge */}
      <div className="absolute inset-y-0 right-0 w-px [background:linear-gradient(180deg,transparent_0%,var(--primary)_30%,var(--success)_70%,transparent_100%)] opacity-30" />

      {/* Logo / branding */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-lg shadow-primary/30">
          <Vault className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-0">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-soft">
            Finance
          </span>
          <span className="text-base font-bold tracking-tight text-foreground">
            Vaultix
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ tab, label, href, Icon }) => {
          const isActive = activeTab === tab;
          return (
            <Link
              key={tab}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted hover:bg-glass-bg-strong hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-soft group-hover:text-foreground",
                )}
              />
              <span>{label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: sync + user */}
      {user && (
        <div className="flex flex-col gap-2 border-t border-glass-border px-3 py-4">
          <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
            <div className="relative shrink-0">
              {hasPendingSync && (
                <span
                  className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500"
                  aria-hidden
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0"
                onClick={() => sync()}
                disabled={isSyncing}
                aria-label="Sync"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isSyncing && "animate-[spinner-rotate_0.8s_linear_infinite]",
                  )}
                />
              </Button>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[10px] font-medium text-muted-soft">
                {syncState.status === "syncing"
                  ? "Syncing…"
                  : syncState.status === "synced"
                    ? "Synced"
                    : syncState.status === "error"
                      ? "Sync error"
                      : "Sync"}
              </span>
              <span className="truncate text-[10px] text-muted/70">{user.email}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
