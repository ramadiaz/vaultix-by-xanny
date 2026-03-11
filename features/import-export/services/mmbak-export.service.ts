import initSqlJs from "sql.js";
import { getStoredAssets, getStoredAssetGroups, getStoredCurrencies } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions, getStoredTags, getStoredTxTags } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";

const SCHEMA = `
CREATE TABLE ASSETGROUP (
  DEVICE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  IS_DEL INTEGER,
  USETIME INTEGER,
  ACC_GROUP_NAME VARCHAR,
  TYPE INTEGER,
  ORDERSEQ INTEGER,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);
CREATE UNIQUE INDEX UNIQUE_IDX_ASSETGROUP_UID ON ASSETGROUP (uid);

CREATE TABLE ASSETS (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  CARD_DAY_FIN VARCHAR,
  CARD_DAY_PAY VARCHAR,
  NIC_NAME VARCHAR,
  ORDERSEQ INTEGER,
  ZDATA VARCHAR,
  ZDATA1 VARCHAR,
  ZDATA2 VARCHAR,
  IS_TRANS_EXPENSE INTEGER,
  IS_CARD_AUTO_PAY INTEGER,
  APP_PACKAGE VARCHAR,
  APP_NAME VARCHAR,
  SMS_TEL VARCHAR,
  SMS_STRING VARCHAR,
  A_UTIME INTEGER,
  CARD_USAGE_HURDLE_TYPE INTEGER,
  CARD_USAGE_HURDLE_START_DATE REAL,
  CARD_USAGE_HURDLE_AMOUNT REAL,
  uid TEXT,
  currencyUid TEXT,
  cardAssetUid TEXT,
  groupUid TEXT,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);
CREATE UNIQUE INDEX UNIQUE_IDX_ASSETS_UID ON ASSETS (uid);

CREATE TABLE CURRENCY (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  uid VARCHAR,
  NAME VARCHAR,
  ISO VARCHAR,
  MAIN_ISO VARCHAR,
  IS_DEL INTEGER,
  ORDER_SEQ INTEGER,
  RATE REAL,
  SYMBOL VARCHAR,
  INSERT_TYPE VARCHAR,
  SYMBOL_POSITION VARCHAR,
  IS_MAIN_CURRENCY INTEGER,
  IS_SHOW INTEGER,
  MODIFY_DATE INTEGER,
  DECIMAL_POINT INTEGER,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);
CREATE UNIQUE INDEX UNIQUE_IDX_CURRENCY_UID ON CURRENCY (uid);

CREATE TABLE ZCATEGORY (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  C_IS_DEL INTEGER,
  C_UTIME INTEGER,
  uid TEXT,
  NAME VARCHAR,
  ORDERSEQ INTEGER,
  TYPE INTEGER,
  STATUS INTEGER,
  pUid TEXT,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);
CREATE UNIQUE INDEX UNIQUE_IDX_CATEGORY_UID ON ZCATEGORY (uid);

CREATE TABLE INOUTCOME (
  AID INTEGER PRIMARY KEY,
  uid TEXT,
  assetUid TEXT,
  CARDDIVIDMONTH VARCHAR,
  ctgUid TEXT,
  toAssetUid TEXT,
  ZCONTENT VARCHAR,
  ZDATE VARCHAR,
  WDATE VARCHAR,
  wtime TEXT,
  paid TEXT,
  DO_TYPE VARCHAR,
  ZMONEY VARCHAR,
  txUidTrans TEXT,
  ZDATA VARCHAR,
  SMS_RDATE VARCHAR,
  IN_ZMONEY VARCHAR,
  ASSET_NIC VARCHAR,
  CATEGORY_NAME VARCHAR,
  cardDivideUid TEXT,
  CARD_DIVIDE_MONTH_STR VARCHAR,
  MARK INTEGER,
  txUidFee TEXT,
  SMS_ORIGIN VARCHAR,
  SMS_PARSE_CONTENT VARCHAR,
  IS_DEL INTEGER,
  UTIME INTEGER,
  currencyUid TEXT,
  AMOUNT_ACCOUNT REAL,
  lat TEXT,
  lng TEXT,
  gstd TEXT,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);
CREATE INDEX INOUTCOME_IDX2 ON INOUTCOME (DO_TYPE);
CREATE INDEX INOUTCOME_IDX3 ON INOUTCOME (ZDATE);
CREATE INDEX INOUTCOME_IDX6 ON INOUTCOME (UTIME);
CREATE INDEX INOUTCOME_IDX7 ON INOUTCOME (assetUid);
CREATE INDEX INOUTCOME_IDX8 ON INOUTCOME (ctgUid);
CREATE INDEX INOUTCOME_IDX9 ON INOUTCOME (currencyUid);
CREATE UNIQUE INDEX UNIQUE_IDX_INOUTCOME_UID ON INOUTCOME (uid);

CREATE TABLE TAG (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  name TEXT,
  orderSeq INTEGER,
  isDel INTEGER,
  utime REAL,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);
CREATE UNIQUE INDEX UNIQUE_IDX_TAG_UID ON TAG (uid);

CREATE TABLE TX_TAG (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  txUid TEXT,
  tagUid TEXT,
  objName TEXT,
  orderSeq INTEGER,
  isDel INTEGER,
  utime REAL,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);
CREATE UNIQUE INDEX UNIQUE_IDX_TX_TAG_UID ON TX_TAG (uid);
CREATE INDEX TX_TAG_IDX1 ON TX_TAG (txUid);

CREATE TABLE BUDGET (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  targetUid TEXT,
  DO_TYPE INTEGER,
  PERIOD_TYPE INTEGER,
  IS_TOTAL INTEGER,
  IS_DEL INTEGER,
  TRANSFER_TYPE INTEGER,
  ORDER_SEQ INTEGER,
  MODIFY_DATE INTEGER,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);

CREATE TABLE BUDGET_AMOUNT (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  budgetUid TEXT,
  IS_DEL INTEGER,
  AMOUNT REAL,
  BUDGET_PERIOD INTEGER,
  MODIFY_DATE INTEGER,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);

CREATE TABLE REPEATTRANSACTION (
  DEVICE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  IS_DEL INTEGER,
  USETIME INTEGER,
  MARK INTEGER,
  END_DATE INTEGER,
  NEXT_DATE INTEGER,
  DO_TYPE INTEGER,
  REPEAT_TYPE INTEGER,
  assetUid TEXT,
  toAssetUid TEXT,
  ctgUid TEXT,
  currencyUid TEXT,
  AMOUNT_SUB REAL,
  MEMO VARCHAR,
  PAYEE VARCHAR,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);

CREATE TABLE FAVTRANSACTION (
  DEVICE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  IS_DEL INTEGER,
  USETIME INTEGER,
  MARK INTEGER,
  DO_TYPE INTEGER,
  assetUid TEXT,
  toAssetUid TEXT,
  ctgUid TEXT,
  AMOUNT_SUB REAL,
  currencyUid INTEGER,
  MEMO VARCHAR,
  PAYEE VARCHAR,
  ORDERSEQ INTEGER,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);

CREATE TABLE MEMO (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  title TEXT,
  content TEXT,
  memoTime REAL,
  memoDate TEXT,
  pinned INTEGER,
  pinnedTime REAL,
  orderSeq INTEGER,
  color TEXT,
  isDel INTEGER,
  utime REAL,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);

CREATE TABLE ZETC (
  Z_PK INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  E_UTIME INTEGER,
  ZDATATYPE INTEGER,
  ZDATA VARCHAR,
  ZZDATA VARCHAR,
  ZZDATA1 VARCHAR,
  ZZDATA2 VARCHAR,
  dataTypeKey VARCHAR,
  isDel INTEGER,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);

CREATE TABLE PHOTO (
  DEVICE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT,
  IS_DEL INTEGER,
  USETIME INTEGER,
  txUid TEXT,
  FILE_SIZE INTEGER,
  FILE_PATH VARCHAR,
  FILE_NAME VARCHAR,
  ORG_FILE_NAME VARCHAR,
  ORG_FILE_PATH VARCHAR,
  isSynced INTEGER,
  syncTime REAL,
  syncVersion INTEGER
);

CREATE TABLE android_metadata (locale TEXT);
`;

export async function exportAsMmbak(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  const db = new SQL.Database();

  try {
    const statements = SCHEMA.split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      db.run(stmt);
    }

    db.run("INSERT INTO android_metadata (locale) VALUES ('en_US')");

    const assetGroups = getStoredAssetGroups();
    for (const g of assetGroups) {
      db.run(
        `INSERT INTO ASSETGROUP (uid, IS_DEL, USETIME, ACC_GROUP_NAME, TYPE, ORDERSEQ, isSynced, syncTime, syncVersion) 
         VALUES (?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
        [g.uid, g.isDel ? 1 : 0, Date.now(), g.name, g.type, g.orderSeq],
      );
    }

    const currencies = getStoredCurrencies();
    for (const c of currencies) {
      db.run(
        `INSERT INTO CURRENCY (uid, NAME, ISO, MAIN_ISO, IS_DEL, ORDER_SEQ, RATE, SYMBOL, INSERT_TYPE, SYMBOL_POSITION, IS_MAIN_CURRENCY, IS_SHOW, MODIFY_DATE, DECIMAL_POINT, isSynced, syncTime, syncVersion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'I', ?, ?, ?, ?, ?, 0, NULL, 0)`,
        [c.uid, c.name, c.iso, c.mainIso, c.isDel ? 1 : 0, c.orderSeq, c.rate, c.symbol, c.symbolPosition, c.isMainCurrency ? 1 : 0, c.isShow ? 1 : 0, Date.now(), c.decimalPoint],
      );
    }

    const assets = getStoredAssets();
    for (const a of assets) {
      db.run(
        `INSERT INTO ASSETS (CARD_DAY_FIN, CARD_DAY_PAY, NIC_NAME, ORDERSEQ, ZDATA, ZDATA1, ZDATA2, IS_TRANS_EXPENSE, IS_CARD_AUTO_PAY, A_UTIME, CARD_USAGE_HURDLE_TYPE, CARD_USAGE_HURDLE_START_DATE, CARD_USAGE_HURDLE_AMOUNT, uid, currencyUid, cardAssetUid, groupUid, isSynced, syncTime, syncVersion) 
         VALUES (?, ?, ?, ?, '0', '', '0', ?, ?, ?, 1, NULL, 0.0, ?, ?, NULL, ?, 0, NULL, 0)`,
        [a.cardDayFin ?? "1", a.cardDayPay ?? "1", a.name, a.orderSeq, a.isTransExpense ? 1 : 0, a.isCardAutoPay ? 1 : 0, a.utime, a.uid, a.currencyUid, a.groupUid],
      );
    }

    const categories = getStoredCategories();
    for (const c of categories) {
      db.run(
        `INSERT INTO ZCATEGORY (C_IS_DEL, C_UTIME, uid, NAME, ORDERSEQ, TYPE, STATUS, pUid, isSynced, syncTime, syncVersion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
        [c.isDel ? 1 : null, c.utime, c.uid, c.name, c.orderSeq, c.type, c.status, c.pUid ?? "0"],
      );
    }

    const assetNameMap = new Map(assets.map((a) => [a.uid, a.name]));
    const categoryNameMap = new Map(categories.map((c) => [c.uid, c.name]));

    const transactions = getStoredTransactions();
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      db.run(
        `INSERT INTO INOUTCOME (AID, uid, assetUid, ctgUid, toAssetUid, ZCONTENT, ZDATE, WDATE, DO_TYPE, ZMONEY, IN_ZMONEY, txUidTrans, txUidFee, IS_DEL, UTIME, currencyUid, AMOUNT_ACCOUNT, MARK, paid, lat, lng, ASSET_NIC, CATEGORY_NAME, isSynced, syncTime, syncVersion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
        [
          i + 1,
          t.uid,
          t.assetUid,
          t.ctgUid,
          t.toAssetUid,
          t.content,
          t.date,
          t.writeDate,
          t.doType,
          t.money,
          t.inMoney,
          t.txUidTrans,
          t.txUidFee,
          t.isDel ? 1 : 0,
          t.utime,
          t.currencyUid,
          t.amountAccount,
          t.mark,
          t.paid,
          t.lat,
          t.lng,
          assetNameMap.get(t.assetUid) ?? "",
          t.ctgUid ? (categoryNameMap.get(t.ctgUid) ?? "") : "",
        ],
      );
    }

    const tags = getStoredTags();
    for (const tag of tags) {
      db.run(
        `INSERT INTO TAG (uid, name, orderSeq, isDel, utime, isSynced, syncTime, syncVersion) 
         VALUES (?, ?, ?, ?, ?, 0, NULL, 0)`,
        [tag.uid, tag.name, tag.orderSeq, tag.isDel ? 1 : 0, tag.utime],
      );
    }

    const txTags = getStoredTxTags();
    for (const tt of txTags) {
      db.run(
        `INSERT INTO TX_TAG (uid, txUid, tagUid, orderSeq, isDel, utime, isSynced, syncTime, syncVersion) 
         VALUES (?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
        [tt.uid, tt.txUid, tt.tagUid, tt.orderSeq, tt.isDel ? 1 : 0, tt.utime],
      );
    }

    const data = db.export();
    const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);
    const filename = `MM(${dateStr}).mmbak`;

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  } finally {
    db.close();
  }
}
