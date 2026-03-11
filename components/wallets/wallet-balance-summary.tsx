"use client";

import { useMemo } from "react";
import { Asset } from "@/features/wallets/types/wallet";
import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";

type WalletBalanceSummaryProps = {
  assets: Asset[];
  getCurrencyIso: (currencyUid: string) => string;
};

export function WalletBalanceSummary({ assets, getCurrencyIso }: WalletBalanceSummaryProps) {
  const summaryByCurrency = useMemo(() => {
    const groups = new Map<string, number>();

    for (const asset of assets) {
      const iso = getCurrencyIso(asset.currencyUid);
      const current = groups.get(iso) ?? 0;
      groups.set(iso, current + asset.balance);
    }

    return Array.from(groups.entries()).map(([iso, total]) => ({ iso, total }));
  }, [assets, getCurrencyIso]);

  const primarySummary = summaryByCurrency[0];

  if (!primarySummary) {
    return (
      <section className="gradient-border relative overflow-hidden rounded-2xl px-4 py-4 backdrop-blur-[var(--glass-blur)]">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
          Total Balance
        </span>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {formatCurrencyByIso(0, "IDR")}
        </p>
      </section>
    );
  }

  return (
    <section className="gradient-border relative overflow-hidden rounded-2xl px-4 py-4 backdrop-blur-[var(--glass-blur)]">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
          Total Balance
        </span>
        {summaryByCurrency.length === 1 && (
          <span className="text-[10px] font-medium text-muted">
            {primarySummary.iso}
          </span>
        )}
      </div>

      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        {formatCurrencyByIso(primarySummary.total, primarySummary.iso)}
      </p>

      {summaryByCurrency.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {summaryByCurrency.slice(1).map(({ iso, total }) => (
            <div key={iso} className="text-[11px]">
              <span className="text-muted-soft">{iso}: </span>
              <span className="font-medium text-foreground">
                {formatCurrencyByIso(total, iso)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
