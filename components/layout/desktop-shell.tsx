"use client";

import { ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";

type DesktopTab = "wallets" | "transactions" | "stats" | "settings";

type DesktopShellProps = {
    title: string;
    activeTab: DesktopTab;
    children: ReactNode;
    /** Optional action button/element shown in the top-right of the content bar */
    action?: ReactNode;
};

export function DesktopShell({ title, activeTab, children, action }: DesktopShellProps) {
    return (
        <div className="flex min-h-dvh bg-background">
            <DesktopSidebar activeTab={activeTab} />

            {/* Content area pushed right of sidebar */}
            <div className="flex min-w-0 flex-1 flex-col pl-60">
                {/* Top bar */}
                <header className="relative flex items-center justify-between border-b border-glass-border bg-glass-bg/60 px-6 py-3 backdrop-blur-[var(--glass-blur)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:[background:linear-gradient(90deg,transparent_0%,var(--primary)_50%,transparent_100%)] after:opacity-30 after:content-['']">
                    <div className="flex flex-col gap-0">
                        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
                            Vaultix
                        </span>
                        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                    </div>
                    {action && <div>{action}</div>}
                </header>

                {/* Main scrollable content */}
                <main className="flex-1 overflow-y-auto bg-background-soft/50 px-6 py-5">
                    {children}
                </main>
            </div>
        </div>
    );
}
