import initSqlJs, { Database } from "sql.js";

const DB_KEY = "vaultix.sqlite";

const isBrowser = typeof window !== "undefined";

let dbPromise: Promise<Database> | null = null;

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

async function createDatabase(): Promise<Database> {
  const SQL = await initSqlJs({
    locateFile: () => `/sql-wasm.wasm`,
  });

  if (!isBrowser) {
    const db = new SQL.Database();
    return db;
  }

  const raw = window.localStorage.getItem(DB_KEY);

  if (raw) {
    try {
      const stored = JSON.parse(raw) as number[];
      const data = new Uint8Array(stored);
      const db = new SQL.Database(data);
      return db;
    } catch {
      const db = new SQL.Database();
      return db;
    }
  }

  const db = new SQL.Database();

  const statements = SCHEMA.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    db.run(stmt);
  }

  db.run("INSERT INTO android_metadata (locale) VALUES ('en_US')");

  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = createDatabase();
  }
  return dbPromise;
}

export async function persistDatabase(db?: Database): Promise<void> {
  if (!isBrowser) {
    return;
  }

  const instance = db ?? (await getDatabase());
  const data = instance.export();
  const arr = Array.from(data);
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(arr));
  } catch {
    return;
  }

  window.dispatchEvent(new CustomEvent("vaultix:data-changed"));
}

