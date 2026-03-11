import initSqlJs, { Database } from "sql.js";
import { Asset, AssetGroup, Currency } from "@/features/wallets/types/wallet";
import { Transaction, Category, Tag, TxTag, DoType } from "@/features/transactions/types/transaction";
import { ImportResult } from "../types/import-export";

const ASSET_COLORS = ["sky", "emerald", "violet", "rose", "amber", "slate"];

type RawAsset = {
  uid: string;
  NIC_NAME: string;
  ORDERSEQ: number;
  currencyUid: string;
  groupUid: string;
  CARD_DAY_FIN: string | null;
  CARD_DAY_PAY: string | null;
  IS_TRANS_EXPENSE: number;
  IS_CARD_AUTO_PAY: number;
  A_UTIME: number;
  ZDATA: string | null;
};

type RawAssetGroup = {
  uid: string;
  ACC_GROUP_NAME: string;
  TYPE: number;
  ORDERSEQ: number;
  IS_DEL: number;
};

type RawCurrency = {
  uid: string;
  NAME: string;
  ISO: string;
  MAIN_ISO: string;
  SYMBOL: string;
  RATE: number;
  SYMBOL_POSITION: string;
  IS_MAIN_CURRENCY: number;
  IS_SHOW: number;
  DECIMAL_POINT: number;
  IS_DEL: number;
  ORDER_SEQ: number;
};

type RawCategory = {
  uid: string;
  NAME: string;
  TYPE: number;
  STATUS: number;
  pUid: string;
  ORDERSEQ: number;
  C_IS_DEL: number | null;
  C_UTIME: number;
};

type RawTransaction = {
  uid: string;
  assetUid: string;
  ctgUid: string | null;
  toAssetUid: string | null;
  ZCONTENT: string | null;
  ZDATE: number;
  WDATE: string | null;
  DO_TYPE: number;
  ZMONEY: number;
  IN_ZMONEY: number;
  txUidTrans: string | null;
  txUidFee: string | null;
  IS_DEL: number;
  UTIME: number;
  currencyUid: string;
  AMOUNT_ACCOUNT: number;
  MARK: number;
  paid: string | null;
  lat: string | null;
  lng: string | null;
};

type RawTag = {
  uid: string;
  name: string;
  orderSeq: number;
  isDel: number;
  utime: number;
};

type RawTxTag = {
  uid: string;
  txUid: string;
  tagUid: string;
  orderSeq: number;
  isDel: number;
  utime: number;
};

function queryAll<T>(db: Database, sql: string): T[] {
  const stmt = db.prepare(sql);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

function tableExists(db: Database, tableName: string): boolean {
  const result = db.exec(
    `SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
  );
  return result.length > 0 && result[0].values[0][0] === 1;
}

function parseAssetGroups(db: Database): AssetGroup[] {
  if (!tableExists(db, "ASSETGROUP")) return [];

  const rows = queryAll<RawAssetGroup>(
    db,
    "SELECT uid, ACC_GROUP_NAME, TYPE, ORDERSEQ, IS_DEL FROM ASSETGROUP",
  );

  return rows.map((r) => ({
    uid: String(r.uid),
    name: r.ACC_GROUP_NAME,
    type: r.TYPE as AssetGroup["type"],
    orderSeq: r.ORDERSEQ ?? 0,
    isDel: r.IS_DEL === 1,
  }));
}

function parseCurrencies(db: Database): Currency[] {
  if (!tableExists(db, "CURRENCY")) return [];

  const rows = queryAll<RawCurrency>(
    db,
    "SELECT uid, NAME, ISO, MAIN_ISO, SYMBOL, RATE, SYMBOL_POSITION, IS_MAIN_CURRENCY, IS_SHOW, DECIMAL_POINT, IS_DEL, ORDER_SEQ FROM CURRENCY",
  );

  return rows.map((r) => ({
    uid: String(r.uid),
    name: r.NAME ?? "",
    iso: r.ISO ?? "",
    mainIso: r.MAIN_ISO ?? r.ISO ?? "",
    symbol: r.SYMBOL ?? "",
    rate: r.RATE ?? 1,
    symbolPosition: (r.SYMBOL_POSITION === "S" ? "S" : "P") as "P" | "S",
    isMainCurrency: r.IS_MAIN_CURRENCY === 1,
    isShow: r.IS_SHOW === 1,
    decimalPoint: r.DECIMAL_POINT ?? 2,
    isDel: r.IS_DEL === 1,
    orderSeq: r.ORDER_SEQ ?? 0,
  }));
}

function parseAssets(db: Database): Asset[] {
  if (!tableExists(db, "ASSETS")) return [];

  const rows = queryAll<RawAsset>(
    db,
    "SELECT uid, NIC_NAME, ORDERSEQ, currencyUid, groupUid, CARD_DAY_FIN, CARD_DAY_PAY, IS_TRANS_EXPENSE, IS_CARD_AUTO_PAY, A_UTIME, ZDATA FROM ASSETS",
  );

  return rows.map((r, i) => ({
    uid: String(r.uid),
    name: r.NIC_NAME ?? "",
    groupUid: String(r.groupUid ?? "7"),
    currencyUid: r.currencyUid ?? "IDR_IDR",
    orderSeq: r.ORDERSEQ ?? i + 1,
    balance: 0,
    isArchived: false,
    color: ASSET_COLORS[i % ASSET_COLORS.length],
    cardDayFin: r.CARD_DAY_FIN ?? null,
    cardDayPay: r.CARD_DAY_PAY ?? null,
    isTransExpense: r.IS_TRANS_EXPENSE === 1,
    isCardAutoPay: r.IS_CARD_AUTO_PAY === 1,
    utime: r.A_UTIME ?? Date.now(),
  }));
}

function parseCategories(db: Database): Category[] {
  if (!tableExists(db, "ZCATEGORY")) return [];

  const rows = queryAll<RawCategory>(
    db,
    "SELECT uid, NAME, TYPE, STATUS, pUid, ORDERSEQ, C_IS_DEL, C_UTIME FROM ZCATEGORY",
  );

  return rows.map((r) => ({
    uid: String(r.uid),
    name: r.NAME ?? "",
    type: (r.TYPE ?? 1) as 0 | 1,
    status: (r.STATUS ?? 0) as 0 | 2,
    pUid: r.pUid && r.pUid !== "0" ? String(r.pUid) : null,
    orderSeq: r.ORDERSEQ ?? 0,
    isDel: r.C_IS_DEL === 1,
    utime: r.C_UTIME ?? 0,
  }));
}

function parseTransactions(db: Database): Transaction[] {
  if (!tableExists(db, "INOUTCOME")) return [];

  const rows = queryAll<RawTransaction>(
    db,
    `SELECT uid, assetUid, ctgUid, toAssetUid, ZCONTENT, ZDATE, WDATE, 
            DO_TYPE, ZMONEY, IN_ZMONEY, txUidTrans, txUidFee, IS_DEL, 
            UTIME, currencyUid, AMOUNT_ACCOUNT, MARK, paid, lat, lng 
     FROM INOUTCOME`,
  );

  return rows.map((r) => ({
    uid: String(r.uid),
    assetUid: String(r.assetUid ?? ""),
    ctgUid: r.ctgUid ? String(r.ctgUid) : null,
    toAssetUid: r.toAssetUid ? String(r.toAssetUid) : null,
    content: r.ZCONTENT ?? "",
    date: r.ZDATE ?? Date.now(),
    writeDate: r.WDATE ?? null,
    doType: (r.DO_TYPE ?? 1) as DoType,
    money: r.ZMONEY ?? 0,
    inMoney: r.IN_ZMONEY ?? r.ZMONEY ?? 0,
    txUidTrans: r.txUidTrans ? String(r.txUidTrans) : null,
    txUidFee: r.txUidFee ? String(r.txUidFee) : null,
    isDel: r.IS_DEL === 1,
    utime: r.UTIME ?? 0,
    currencyUid: r.currencyUid ?? "IDR_IDR",
    amountAccount: r.AMOUNT_ACCOUNT ?? r.ZMONEY ?? 0,
    mark: r.MARK ?? 0,
    paid: r.paid ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
  }));
}

function parseTags(db: Database): Tag[] {
  if (!tableExists(db, "TAG")) return [];

  const rows = queryAll<RawTag>(
    db,
    "SELECT uid, name, orderSeq, isDel, utime FROM TAG",
  );

  return rows.map((r) => ({
    uid: String(r.uid),
    name: r.name ?? "",
    orderSeq: r.orderSeq ?? 0,
    isDel: r.isDel === 1,
    utime: r.utime ?? 0,
  }));
}

function parseTxTags(db: Database): TxTag[] {
  if (!tableExists(db, "TX_TAG")) return [];

  const rows = queryAll<RawTxTag>(
    db,
    "SELECT uid, txUid, tagUid, orderSeq, isDel, utime FROM TX_TAG",
  );

  return rows.map((r) => ({
    uid: String(r.uid),
    txUid: String(r.txUid ?? ""),
    tagUid: String(r.tagUid ?? ""),
    orderSeq: r.orderSeq ?? 0,
    isDel: r.isDel === 1,
    utime: r.utime ?? 0,
  }));
}

function computeBalances(assets: Asset[], transactions: Transaction[]): void {
  const balanceMap = new Map<string, number>();

  for (const a of assets) {
    balanceMap.set(a.uid, 0);
  }

  for (const txn of transactions) {
    if (txn.isDel) continue;

    const current = balanceMap.get(txn.assetUid) ?? 0;

    if (txn.doType === 0 || txn.doType === 2 || txn.doType === 4) {
      balanceMap.set(txn.assetUid, current + txn.money);
    } else if (txn.doType === 1 || txn.doType === 3) {
      balanceMap.set(txn.assetUid, current - txn.money);
    }
  }

  for (const asset of assets) {
    asset.balance = balanceMap.get(asset.uid) ?? 0;
  }
}

export type MmbakImportResult = ImportResult & {
  assetGroups: AssetGroup[];
  currencies: Currency[];
  tags: Tag[];
  txTags: TxTag[];
};

export async function parseMmbakFile(fileBuffer: ArrayBuffer): Promise<MmbakImportResult> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  const db = new SQL.Database(new Uint8Array(fileBuffer));

  try {
    const assetGroups = parseAssetGroups(db);
    const currencies = parseCurrencies(db);
    const assets = parseAssets(db);
    const categories = parseCategories(db);
    const transactions = parseTransactions(db);
    const tags = parseTags(db);
    const txTags = parseTxTags(db);

    computeBalances(assets, transactions);

    return {
      assets,
      transactions,
      categories,
      assetGroups,
      currencies,
      tags,
      txTags,
      summary: {
        totalAssets: assets.length,
        totalTransactions: transactions.filter((t) => !t.isDel).length,
        totalCategories: categories.filter((c) => !c.isDel).length,
        skippedTransferIn: 0,
      },
    };
  } finally {
    db.close();
  }
}
