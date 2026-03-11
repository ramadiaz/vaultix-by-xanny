import { DoType } from "@/features/transactions/types/transaction";

export type RepeatTransaction = {
  uid: string;
  isDel: boolean;
  mark: number;
  endDate: number | null;
  nextDate: number | null;
  doType: DoType;
  repeatType: number;
  assetUid: string;
  toAssetUid: string | null;
  ctgUid: string | null;
  currencyUid: string;
  amount: number;
  memo: string;
  payee: string;
  utime: number;
};

export type FavTransaction = {
  uid: string;
  isDel: boolean;
  mark: number;
  doType: DoType;
  assetUid: string;
  toAssetUid: string | null;
  ctgUid: string | null;
  amount: number;
  currencyUid: string;
  memo: string;
  payee: string;
  orderSeq: number;
  utime: number;
};
