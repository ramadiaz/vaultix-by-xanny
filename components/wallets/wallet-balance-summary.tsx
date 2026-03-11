"use client";

import { useMemo } from "react";
import { Wallet, WalletCurrency } from "@/features/wallets/types/wallet";
import { formatCurrency } from "@/features/wallets/utils/format-currency";

type WalletBalanceSummaryProps = {
  wallets: Wallet[];
};

export function WalletBalanceSummary({ wallets }: WalletBalanceSummaryProps) {
  const summaryByCurrency = useMemo(() => {
    const groups = new Map<WalletCurrency, number>();

    for (const wallet of wallets) {
      const current = groups.get(wallet.currency) ?? 0;
      groups.set(wallet.currency, current + wallet.balance);
    }

    return Array.from(groups.entries()).map(([currency, total]) => ({
      currency,
      total,
    }));
  }, [wallets]);

  const primarySummary = summaryByCurrency[0];

  if (!primarySummary) {
    return (
      <section className="rounded-2xl border border-border-subtle bg-accent-soft/60 px-4 py-4 backdrop-blur-md">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
          Total Balance
        </span>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {formatCurrency(0, "IDR")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-accent-soft/60 px-4 py-4 backdrop-blur-md">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
          Total Balance
        </span>
        {summaryByCurrency.length === 1 && (
          <span className="text-[10px] font-medium text-muted">
            {primarySummary.currency}
          </span>
        )}
      </div>

      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        {formatCurrency(primarySummary.total, primarySummary.currency)}
      </p>

      {summaryByCurrency.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {summaryByCurrency.slice(1).map(({ currency, total }) => (
            <div key={currency} className="text-[11px]">
              <span className="text-muted-soft">{currency}: </span>
              <span className="font-medium text-foreground">
                {formatCurrency(total, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
