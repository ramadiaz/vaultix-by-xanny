import { AssetGroup, AssetGroupType, Currency } from "../types/wallet";

export const ASSET_GROUP_LABELS: Record<AssetGroupType, string> = {
  1: "Accounts",
  2: "Card",
  3: "Debit Card",
  4: "Savings",
  5: "Loan",
  6: "Top-Up/Prepaid",
  7: "Others",
  8: "Investments",
  9: "Overdrafts",
  10: "Insurance",
  11: "Cash",
};

export const DEFAULT_ASSET_GROUPS: AssetGroup[] = [
  { uid: "11", name: "Cash", type: 11, orderSeq: 1, isDel: false },
  { uid: "1", name: "Accounts", type: 1, orderSeq: 2, isDel: false },
  { uid: "2", name: "Card", type: 2, orderSeq: 3, isDel: false },
  { uid: "3", name: "Debit Card", type: 3, orderSeq: 4, isDel: false },
  { uid: "4", name: "Savings", type: 4, orderSeq: 5, isDel: false },
  { uid: "5", name: "Loan", type: 5, orderSeq: 6, isDel: false },
  { uid: "6", name: "Top-Up/Prepaid", type: 6, orderSeq: 7, isDel: false },
  { uid: "7", name: "Others", type: 7, orderSeq: 8, isDel: false },
  { uid: "8", name: "Investments", type: 8, orderSeq: 9, isDel: false },
  { uid: "9", name: "Overdrafts", type: 9, orderSeq: 10, isDel: false },
  { uid: "10", name: "Insurance", type: 10, orderSeq: 11, isDel: false },
];

export const ASSET_GROUP_OPTIONS: AssetGroupType[] = [11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const DEFAULT_CURRENCY: Currency = {
  uid: "IDR_IDR",
  name: "IDR - Indonesia (Rp)",
  iso: "IDR",
  mainIso: "IDR",
  symbol: "Rp",
  rate: 1.0,
  symbolPosition: "P",
  isMainCurrency: true,
  isShow: true,
  decimalPoint: 2,
  isDel: false,
  orderSeq: 100,
};

export const DEFAULT_CURRENCIES: Currency[] = [
  DEFAULT_CURRENCY,
  { uid: "USD_USD", name: "USD - United States ($)", iso: "USD", mainIso: "USD", symbol: "$", rate: 0, symbolPosition: "P", isMainCurrency: false, isShow: true, decimalPoint: 2, isDel: false, orderSeq: 200 },
  { uid: "EUR_EUR", name: "EUR - Euro (€)", iso: "EUR", mainIso: "EUR", symbol: "€", rate: 0, symbolPosition: "P", isMainCurrency: false, isShow: true, decimalPoint: 2, isDel: false, orderSeq: 300 },
  { uid: "SGD_SGD", name: "SGD - Singapore (S$)", iso: "SGD", mainIso: "SGD", symbol: "S$", rate: 0, symbolPosition: "P", isMainCurrency: false, isShow: true, decimalPoint: 2, isDel: false, orderSeq: 400 },
];

export const ASSET_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  sky: { bg: "bg-sky-500/15", text: "text-sky-400", ring: "ring-sky-500/30" },
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  blue: { bg: "bg-blue-500/15", text: "text-blue-400", ring: "ring-blue-500/30" },
  slate: { bg: "bg-slate-500/15", text: "text-slate-400", ring: "ring-slate-500/30" },
  teal: { bg: "bg-teal-500/15", text: "text-teal-400", ring: "ring-teal-500/30" },
  indigo: { bg: "bg-indigo-500/15", text: "text-indigo-400", ring: "ring-indigo-500/30" },
  violet: { bg: "bg-violet-500/15", text: "text-violet-400", ring: "ring-violet-500/30" },
  rose: { bg: "bg-rose-500/15", text: "text-rose-400", ring: "ring-rose-500/30" },
  amber: { bg: "bg-amber-500/15", text: "text-amber-400", ring: "ring-amber-500/30" },
};

export const ASSET_COLOR_OPTIONS: string[] = [
  "sky",
  "emerald",
  "blue",
  "slate",
  "teal",
  "indigo",
  "violet",
  "rose",
  "amber",
];
