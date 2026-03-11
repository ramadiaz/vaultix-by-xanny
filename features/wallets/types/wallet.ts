export type AssetGroupType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type AssetGroup = {
  uid: string;
  name: string;
  type: AssetGroupType;
  orderSeq: number;
  isDel: boolean;
};

export type Asset = {
  uid: string;
  name: string;
  groupUid: string;
  currencyUid: string;
  orderSeq: number;
  balance: number;
  isArchived: boolean;
  color: string;
  cardDayFin: string | null;
  cardDayPay: string | null;
  isTransExpense: boolean;
  isCardAutoPay: boolean;
  utime: number;
};

export type Currency = {
  uid: string;
  name: string;
  iso: string;
  mainIso: string;
  symbol: string;
  rate: number;
  symbolPosition: "P" | "S";
  isMainCurrency: boolean;
  isShow: boolean;
  decimalPoint: number;
  isDel: boolean;
  orderSeq: number;
};

export type BalanceAdjustment = {
  assetUid: string;
  amount: number;
  note: string;
  adjustedAt: number;
};
