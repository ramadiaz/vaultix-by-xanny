import { Currency } from "../types/wallet";

const ISO_LOCALE_MAP: Record<string, string> = {
  IDR: "id-ID",
  USD: "en-US",
  EUR: "de-DE",
  SGD: "en-SG",
};

export function formatCurrencyByIso(
  amount: number,
  iso: string,
): string {
  const locale = ISO_LOCALE_MAP[iso] ?? "en-US";

  if (!ISO_LOCALE_MAP[iso]) {
    return amount.toLocaleString(locale, { maximumFractionDigits: 0 });
  }

  return amount.toLocaleString(locale, {
    style: "currency",
    currency: iso,
    maximumFractionDigits: 0,
  });
}

export function formatCurrencyByEntity(
  amount: number,
  currency: Currency | undefined,
): string {
  if (!currency) {
    return formatCurrencyByIso(amount, "IDR");
  }

  return formatCurrencyByIso(amount, currency.iso);
}

export function formatSignedCurrency(
  amount: number,
  iso: string,
  direction: "income" | "expense" | "adjustment",
): string {
  const formatted = formatCurrencyByIso(Math.abs(amount), iso);

  if (direction === "income" || (direction === "adjustment" && amount > 0)) {
    return `+${formatted}`;
  }

  return `-${formatted}`;
}
