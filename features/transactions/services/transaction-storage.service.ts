import { getDatabase, persistDatabase } from "@/lib/storage/sqlite-database";
import { DoType, Transaction, Tag, TxTag } from "../types/transaction";

function sanitizeTransaction(t: Record<string, unknown>): Transaction {
  return {
    ...(t as unknown as Transaction),
    date: Number(t.date) || 0,
    doType: (Number(t.doType) || 1) as DoType,
    money: Number(t.money) || 0,
    inMoney: Number(t.inMoney) || 0,
    amountAccount: Number(t.amountAccount) || 0,
    mark: Number(t.mark) || 0,
    utime: Number(t.utime) || 0,
    isDel: t.isDel === true || Number(t.isDel) === 1,
  };
}

export async function getStoredTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const result = db.exec(
    `SELECT uid, assetUid, ctgUid, toAssetUid, ZCONTENT as content, ZDATE as date, WDATE as writeDate, 
            DO_TYPE as doType, ZMONEY as money, IN_ZMONEY as inMoney, txUidTrans, txUidFee, IS_DEL as isDel, 
            UTIME as utime, currencyUid, AMOUNT_ACCOUNT as amountAccount, MARK as mark, paid, lat, lng 
     FROM INOUTCOME
     ORDER BY ZDATE DESC, UTIME DESC`,
  );

  if (result.length === 0) {
    return [];
  }

  const rows = result[0];
  return rows.values.map((row) => {
    const obj: Record<string, unknown> = {};
    rows.columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return sanitizeTransaction(obj);
  });
}

export async function storeTransactions(
  transactions: Transaction[],
  options?: { skipPersist?: boolean }
): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM INOUTCOME");

  const stmt = db.prepare(
    `INSERT INTO INOUTCOME (AID, uid, assetUid, ctgUid, toAssetUid, ZCONTENT, ZDATE, WDATE, DO_TYPE, ZMONEY, IN_ZMONEY, txUidTrans, txUidFee, IS_DEL, UTIME, currencyUid, AMOUNT_ACCOUNT, MARK, paid, lat, lng, ASSET_NIC, CATEGORY_NAME, isSynced, syncTime, syncVersion) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
  );

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    stmt.run([
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
      "",
      "",
    ]);
  }

  stmt.free();
  if (!options?.skipPersist) await persistDatabase(db);
}

export async function getStoredTags(): Promise<Tag[]> {
  const db = await getDatabase();
  const result = db.exec(
    "SELECT uid, name, orderSeq, isDel, utime FROM TAG",
  );

  if (result.length === 0) {
    return [];
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
      orderSeq: Number(obj.orderSeq) || 0,
      isDel: Number(obj.isDel) === 1,
      utime: Number(obj.utime) || 0,
    };
  });
}

export async function storeTags(
  tags: Tag[],
  options?: { skipPersist?: boolean }
): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM TAG");

  const stmt = db.prepare(
    `INSERT INTO TAG (uid, name, orderSeq, isDel, utime, isSynced, syncTime, syncVersion) 
     VALUES (?, ?, ?, ?, ?, 0, NULL, 0)`,
  );

  for (const tag of tags) {
    stmt.run([
      tag.uid,
      tag.name,
      tag.orderSeq,
      tag.isDel ? 1 : 0,
      tag.utime,
    ]);
  }

  stmt.free();
  if (!options?.skipPersist) await persistDatabase(db);
}

export async function getStoredTxTags(): Promise<TxTag[]> {
  const db = await getDatabase();
  const result = db.exec(
    "SELECT uid, txUid, tagUid, orderSeq, isDel, utime FROM TX_TAG",
  );

  if (result.length === 0) {
    return [];
  }

  const rows = result[0];
  return rows.values.map((row) => {
    const obj: Record<string, unknown> = {};
    rows.columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      uid: String(obj.uid),
      txUid: String(obj.txUid ?? ""),
      tagUid: String(obj.tagUid ?? ""),
      orderSeq: Number(obj.orderSeq) || 0,
      isDel: Number(obj.isDel) === 1,
      utime: Number(obj.utime) || 0,
    };
  });
}

export async function storeTxTags(
  txTags: TxTag[],
  options?: { skipPersist?: boolean }
): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM TX_TAG");

  const stmt = db.prepare(
    `INSERT INTO TX_TAG (uid, txUid, tagUid, objName, orderSeq, isDel, utime, isSynced, syncTime, syncVersion) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
  );

  for (const tt of txTags) {
    stmt.run([
      tt.uid,
      tt.txUid,
      tt.tagUid,
      null,
      tt.orderSeq,
      tt.isDel ? 1 : 0,
      tt.utime,
    ]);
  }

  stmt.free();
  if (!options?.skipPersist) await persistDatabase(db);
}
