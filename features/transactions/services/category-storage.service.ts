import { getDatabase, persistDatabase } from "@/lib/storage/sqlite-database";
import { Category } from "../types/transaction";
import { ALL_DEFAULT_CATEGORIES } from "../config/transaction-config";

export async function getStoredCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const result = db.exec(
    "SELECT uid, NAME as name, TYPE as type, STATUS as status, pUid, ORDERSEQ as orderSeq, C_IS_DEL as isDel, C_UTIME as utime FROM ZCATEGORY",
  );

  if (result.length === 0) {
    const stmt = db.prepare(
      `INSERT INTO ZCATEGORY (C_IS_DEL, C_UTIME, uid, NAME, ORDERSEQ, TYPE, STATUS, pUid, isSynced, syncTime, syncVersion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
    );

    for (const c of ALL_DEFAULT_CATEGORIES) {
      stmt.run([
        c.isDel ? 1 : null,
        c.utime,
        c.uid,
        c.name,
        c.orderSeq,
        c.type,
        c.status,
        c.pUid ?? "0",
      ]);
    }

    stmt.free();
    await persistDatabase(db);
    return ALL_DEFAULT_CATEGORIES;
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
      type: Number(obj.type) as 0 | 1,
      status: Number(obj.status) as 0 | 2,
      pUid: obj.pUid && String(obj.pUid) !== "0" ? String(obj.pUid) : null,
      orderSeq: Number(obj.orderSeq) || 0,
      isDel: Number(obj.isDel) === 1,
      utime: Number(obj.utime) || 0,
    };
  });
}

export async function storeCategories(
  categories: Category[],
  options?: { skipPersist?: boolean }
): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM ZCATEGORY");

  const stmt = db.prepare(
    `INSERT INTO ZCATEGORY (C_IS_DEL, C_UTIME, uid, NAME, ORDERSEQ, TYPE, STATUS, pUid, isSynced, syncTime, syncVersion) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0)`,
  );

  for (const c of categories) {
    stmt.run([
      c.isDel ? 1 : null,
      c.utime,
      c.uid,
      c.name,
      c.orderSeq,
      c.type,
      c.status,
      c.pUid ?? "0",
    ]);
  }

  stmt.free();
  if (!options?.skipPersist) await persistDatabase(db);
}
