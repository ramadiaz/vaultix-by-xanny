import { WalletColor, WalletCurrency, WalletType } from "../types/wallet";

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  cash: "Cash",
  bank: "Bank Account",
  card: "Credit Card",
  investment: "Investment",
  other: "Other",
};

export const WALLET_TYPE_OPTIONS: WalletType[] = [
  "cash",
  "bank",
  "card",
  "investment",
  "other",
];

export const WALLET_CURRENCY_SYMBOLS: Record<WalletCurrency, string> = {
  IDR: "Rp",
  USD: "$",
  EUR: "€",
  SGD: "S$",
  OTHER: "¤",
};

export const WALLET_CURRENCY_OPTIONS: WalletCurrency[] = [
  "IDR",
  "USD",
  "EUR",
  "SGD",
  "OTHER",
];

export const WALLET_COLOR_MAP: Record<WalletColor, { bg: string; text: string; ring: string }> = {
  sky: { bg: "bg-sky-500/15", text: "text-sky-400", ring: "ring-sky-500/30" },
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  violet: { bg: "bg-violet-500/15", text: "text-violet-400", ring: "ring-violet-500/30" },
  rose: { bg: "bg-rose-500/15", text: "text-rose-400", ring: "ring-rose-500/30" },
  amber: { bg: "bg-amber-500/15", text: "text-amber-400", ring: "ring-amber-500/30" },
  slate: { bg: "bg-slate-500/15", text: "text-slate-400", ring: "ring-slate-500/30" },
};

export const WALLET_COLOR_OPTIONS: WalletColor[] = [
  "sky",
  "emerald",
  "violet",
  "rose",
  "amber",
  "slate",
];
