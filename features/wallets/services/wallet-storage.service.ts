import { getDatabase, persistDatabase } from "@/lib/storage/sqlite-database";
import { Asset, AssetGroup, Currency } from "../types/wallet";
import { DEFAULT_ASSET_GROUPS, DEFAULT_CURRENCIES } from "../config/wallet-config";

function sanitizeAsset(a: Record<string, unknown>): Asset {
  return {
    ...a,
    balance: Number(a.balance) || 0,
    orderSeq: Number(a.orderSeq) || 0,
    utime: Number(a.utime) || 0,
    isArchived: a.isArchived === true || Number(a.isArchived) === 1,
    isTransExpense: a.isTransExpense === true || Number(a.isTransExpense) === 1,
    isCardAutoPay: a.isCardAutoPay === true || Number(a.isCardAutoPay) === 1,
  } as Asset;
}

export async function getStoredAssets(): Promise<Asset[]> {
  const db = await getDatabase();
  const result = db.exec(
    "SELECT uid, NIC_NAME as name, groupUid, currencyUid, ORDERSEQ as orderSeq, 0 as balance, 0 as isArchived, CARD_DAY_FIN as cardDayFin, CARD_DAY_PAY as cardDayPay, IS_TRANS_EXPENSE as isTransExpense, IS_CARD_AUTO_PAY as isCardAutoPay, A_UTIME as utime FROM ASSETS",
  );

  if (result.length === 0) {
    return [];
  }

  const rows = result[0];
  const assets: Asset[] = rows.values.map((row, index) => {
    const obj: Record<string, unknown> = {};
    rows.columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    const asset = sanitizeAsset(obj);
    if (!asset.color) {
      const colors = ["sky", "emerald", "violet", "rose", "amber", "slate"];
      asset.color = colors[index % colors.length];
    }
    return asset;
  });

  const txResult = db.exec(
    "SELECT assetUid, DO_TYPE as doType, ZMONEY as money, IS_DEL as isDel FROM INOUTCOME",
  );

  if (txResult.length === 0) {
    return assets;
  }

  const txRows = txResult[0];
  const balanceMap = new Map<string, number>();

  for (const asset of assets) {
    balanceMap.set(asset.uid, 0);
  }

  for (const row of txRows.values) {
    const record: Record<string, unknown> = {};
    txRows.columns.forEach((col, idx) => {
      record[col] = row[idx];
    });

    const uid = String(record.assetUid ?? "");
    if (!uid) continue;

    const isDel = Number(record.isDel) === 1;
    if (isDel) continue;

    const doType = Number(record.doType) || 1;
    const money = Number(record.money) || 0;

    const current = balanceMap.get(uid) ?? 0;

    if (doType === 0 || doType === 2 || doType === 4) {
      balanceMap.set(uid, current + money);
    } else if (doType === 1 || doType === 3) {
      balanceMap.set(uid, current - money);
    }
  }

  for (const asset of assets) {
    asset.balance = balanceMap.get(asset.uid) ?? 0;
  }

  return assets;
}

export async function storeAssets(assets: Asset[]): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM ASSETS");

  const stmt = db.prepare(
    `INSERT INTO ASSETS (CARD_DAY_FIN, CARD_DAY_PAY, NIC_NAME, ORDERSEQ, ZDATA, ZDATA1, ZDATA2, IS_TRANS_EXPENSE, IS_CARD_AUTO_PAY, A_UTIME, CARD_USAGE_HURDLE_TYPE, CARD_USAGE_HURDLE_START_DATE, CARD_USAGE_HURDLE_AMOUNT, uid, currencyUid, cardAssetUid, groupUid, isSynced, syncTime, syncVersion) 
     VALUES (?, ?, ?, ?, '0', '', '0', ?, ?, ?, 1, NULL, 0.0, ?, ?, NULL, ?, 0, NULL, 0)`,
  );

  for (const a of assets) {
    stmt.run([
      a.cardDayFin ?? "1",
      a.cardDayPay ?? "1",
      a.name,
      a.orderSeq,
      a.isTransExpense ? 1 : 0,
      a.isCardAutoPay ? 1 : 0,
      a.utime,
      a.uid,
      a.currencyUid,
      a.groupUid,
    ]);
  }

  stmt.free();
  await persistDatabase(db);
}

export async function getStoredAssetGroups(): Promise<AssetGroup[]> {
  const db = await getDatabase();
  const result = db.exec(
    "SELECT uid, ACC_GROUP_NAME as name, TYPE as type, ORDERSEQ as orderSeq, IS_DEL as isDel FROM ASSETGROUP",
  );

  if (result.length === 0) {
    const stmt = db.prepare(
      `INSERT INTO ASSETGROUP (uid, IS_DEL, USETIME, ACC_GROUP_NAME, TYPE, ORDERSEQ, isSynced, syncTime, syncVersion) 
       VALUES (?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
    );

    const now = Date.now();
    for (const g of DEFAULT_ASSET_GROUPS) {
      stmt.run([g.uid, g.isDel ? 1 : 0, now, g.name, g.type, g.orderSeq]);
    }
    stmt.free();
    await persistDatabase(db);
    return DEFAULT_ASSET_GROUPS;
  }

  const rows = result[0];
  return rows.values.map((row) => {
    const obj: Record<string, unknown> = {};
    rows.columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      uid: String(obj.uid),
      name: String(obj.name ?? ""),
      type: Number(obj.type) as AssetGroup["type"],
      orderSeq: Number(obj.orderSeq) || 0,
      isDel: Number(obj.isDel) === 1,
    };
  });
}

export async function storeAssetGroups(groups: AssetGroup[]): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM ASSETGROUP");

  const stmt = db.prepare(
    `INSERT INTO ASSETGROUP (uid, IS_DEL, USETIME, ACC_GROUP_NAME, TYPE, ORDERSEQ, isSynced, syncTime, syncVersion) 
     VALUES (?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
  );

  const now = Date.now();
  for (const g of groups) {
    stmt.run([g.uid, g.isDel ? 1 : 0, now, g.name, g.type, g.orderSeq]);
  }
  stmt.free();
  await persistDatabase(db);
}

export async function getStoredCurrencies(): Promise<Currency[]> {
  const db = await getDatabase();
  const result = db.exec(
    "SELECT uid, NAME as name, ISO as iso, MAIN_ISO as mainIso, SYMBOL as symbol, RATE as rate, SYMBOL_POSITION as symbolPosition, IS_MAIN_CURRENCY as isMainCurrency, IS_SHOW as isShow, DECIMAL_POINT as decimalPoint, IS_DEL as isDel, ORDER_SEQ as orderSeq FROM CURRENCY",
  );

  if (result.length === 0) {
    const stmt = db.prepare(
      `INSERT INTO CURRENCY (uid, NAME, ISO, MAIN_ISO, IS_DEL, ORDER_SEQ, RATE, SYMBOL, INSERT_TYPE, SYMBOL_POSITION, IS_MAIN_CURRENCY, IS_SHOW, MODIFY_DATE, DECIMAL_POINT, isSynced, syncTime, syncVersion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'I', ?, ?, ?, ?, ?, 0, NULL, 0)`,
    );

    const now = Date.now();
    for (const c of DEFAULT_CURRENCIES) {
      stmt.run([
        c.uid,
        c.name,
        c.iso,
        c.mainIso,
        c.isDel ? 1 : 0,
        c.orderSeq,
        c.rate,
        c.symbol,
        c.symbolPosition,
        c.isMainCurrency ? 1 : 0,
        c.isShow ? 1 : 0,
        now,
        c.decimalPoint,
      ]);
    }
    stmt.free();
    await persistDatabase(db);
    return DEFAULT_CURRENCIES;
  }

  const rows = result[0];
  return rows.values.map((row) => {
    const obj: Record<string, unknown> = {};
    rows.columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      uid: String(obj.uid),
      name: String(obj.name ?? ""),
      iso: String(obj.iso ?? ""),
      mainIso: String(obj.mainIso ?? obj.iso ?? ""),
      symbol: String(obj.symbol ?? ""),
      rate: Number(obj.rate) || 1,
      symbolPosition: (String(obj.symbolPosition) === "S" ? "S" : "P") as "P" | "S",
      isMainCurrency: Number(obj.isMainCurrency) === 1,
      isShow: Number(obj.isShow) === 1,
      decimalPoint: Number(obj.decimalPoint) || 2,
      isDel: Number(obj.isDel) === 1,
      orderSeq: Number(obj.orderSeq) || 0,
    };
  });
}

export async function storeCurrencies(currencies: Currency[]): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM CURRENCY");

  const stmt = db.prepare(
    `INSERT INTO CURRENCY (uid, NAME, ISO, MAIN_ISO, IS_DEL, ORDER_SEQ, RATE, SYMBOL, INSERT_TYPE, SYMBOL_POSITION, IS_MAIN_CURRENCY, IS_SHOW, MODIFY_DATE, DECIMAL_POINT, isSynced, syncTime, syncVersion) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'I', ?, ?, ?, ?, ?, 0, NULL, 0)`,
  );

  const now = Date.now();
  for (const c of currencies) {
    stmt.run([
      c.uid,
      c.name,
      c.iso,
      c.mainIso,
      c.isDel ? 1 : 0,
      c.orderSeq,
      c.rate,
      c.symbol,
      c.symbolPosition,
      c.isMainCurrency ? 1 : 0,
      c.isShow ? 1 : 0,
      now,
      c.decimalPoint,
    ]);
  }
  stmt.free();
  await persistDatabase(db);
}
