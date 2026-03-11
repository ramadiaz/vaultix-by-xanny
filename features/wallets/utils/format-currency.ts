import { WalletCurrency } from "../types/wallet";

const LOCALE_MAP: Record<WalletCurrency, string> = {
  IDR: "id-ID",
  USD: "en-US",
  EUR: "de-DE",
  SGD: "en-SG",
  OTHER: "en-US",
};

export function formatCurrency(
  amount: number,
  currency: WalletCurrency,
): string {
  if (currency === "OTHER") {
    return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  return amount.toLocaleString(LOCALE_MAP[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function formatSignedCurrency(
  amount: number,
  currency: WalletCurrency,
  kind: "income" | "expense" | "adjustment",
): string {
  const formatted = formatCurrency(Math.abs(amount), currency);

  if (kind === "income" || (kind === "adjustment" && amount > 0)) {
    return `+${formatted}`;
  }

  return `-${formatted}`;
}
