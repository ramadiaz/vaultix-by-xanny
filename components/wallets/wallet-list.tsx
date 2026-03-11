 "use client";

import { useMemo } from "react";
import { Wallet } from "@/features/wallets/types/wallet";

type WalletListProps = {
  wallets: Wallet[];
};

export function WalletList({ wallets }: WalletListProps) {
  const totalBalance = useMemo(() => {
    if (wallets.length === 0) {
      return 0;
    }

    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  }, [wallets]);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-accent-soft px-4 py-3 text-sm text-foreground">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-soft">
            Total Balance
          </span>
          <span className="text-[10px] font-medium text-muted">IDR</span>
        </div>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {totalBalance.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          })}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-soft">
          <span className="font-medium uppercase tracking-[0.16em]">Wallets</span>
          <span>{wallets.length} active</span>
        </div>

        {wallets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-background px-4 py-6 text-center text-xs text-muted">
            <p className="font-medium">No wallets yet</p>
            <p className="mt-1 text-[11px]">
              Create your first wallet to start tracking your money.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between rounded-2xl border border-border-subtle bg-background px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {wallet.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-muted-soft">
                    {wallet.type} • {wallet.currency}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {wallet.balance.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

