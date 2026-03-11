export type CategoryType = 0 | 1;

export type CategoryStatus = 0 | 2;

export type Category = {
  uid: string;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
  pUid: string | null;
  orderSeq: number;
  isDel: boolean;
  utime: number;
};

export type DoType = 0 | 1 | 2 | 3 | 4;

export type Transaction = {
  uid: string;
  assetUid: string;
  ctgUid: string | null;
  toAssetUid: string | null;
  content: string;
  date: number;
  writeDate: string | null;
  doType: DoType;
  money: number;
  inMoney: number;
  txUidTrans: string | null;
  txUidFee: string | null;
  isDel: boolean;
  utime: number;
  currencyUid: string;
  amountAccount: number;
  mark: number;
  paid: string | null;
  lat: string | null;
  lng: string | null;
};

export type Tag = {
  uid: string;
  name: string;
  orderSeq: number;
  isDel: boolean;
  utime: number;
};

export type TxTag = {
  uid: string;
  txUid: string;
  tagUid: string;
  orderSeq: number;
  isDel: boolean;
  utime: number;
};
