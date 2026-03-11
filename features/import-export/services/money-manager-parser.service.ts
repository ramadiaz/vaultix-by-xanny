import * as XLSX from "xlsx";
import { Transaction, Category, DoType } from "@/features/transactions/types/transaction";
import { Asset } from "@/features/wallets/types/wallet";
import { ALL_DEFAULT_CATEGORIES } from "@/features/transactions/config/transaction-config";
import { ImportResult, MoneyManagerRow } from "../types/import-export";

const ASSET_COLORS: string[] = ["sky", "emerald", "violet", "rose", "amber", "slate"];

function normalizeCategory(raw: string): string {
  return raw.trim().toLowerCase();
}

function findMatchingCategory(rawCategory: string): Category | undefined {
  const normalized = normalizeCategory(rawCategory);
  return ALL_DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === normalized,
  );
}

function parseMoneyManagerDate(raw: string): number {
  const parts = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);

  if (!parts) {
    return Date.now();
  }

  const [, month, day, year, hour, minute, second] = parts;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).getTime();
}

function parseRows(sheetData: unknown[][]): MoneyManagerRow[] {
  const rows: MoneyManagerRow[] = [];

  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];

    if (!row || row.length < 7) continue;

    rows.push({
      date: String(row[0] ?? ""),
      account: String(row[1] ?? ""),
      category: String(row[2] ?? ""),
      subcategory: String(row[3] ?? ""),
      note: String(row[4] ?? ""),
      amountIDR: Number(row[5]) || 0,
      type: String(row[6]) as MoneyManagerRow["type"],
      description: String(row[7] ?? ""),
      amount: Number(row[8]) || 0,
      currency: String(row[9] ?? "IDR"),
    });
  }

  return rows;
}

function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseMoneyManagerExcel(fileBuffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
  const rows = parseRows(rawData);

  const accountSet = new Set<string>();
  const customCategoryMap = new Map<string, Category>();
  let skippedTransferIn = 0;

  for (const row of rows) {
    accountSet.add(row.account);
  }

  const assetMap = new Map<string, Asset>();
  let colorIndex = 0;
  let orderSeq = 1;

  for (const accountName of accountSet) {
    const uid = `import_${accountName.toLowerCase().replace(/\s+/g, "_")}`;
    assetMap.set(accountName, {
      uid,
      name: accountName,
      groupUid: "1",
      currencyUid: "IDR_IDR",
      orderSeq: orderSeq++,
      balance: 0,
      isArchived: false,
      color: ASSET_COLORS[colorIndex % ASSET_COLORS.length],
      cardDayFin: null,
      cardDayPay: null,
      isTransExpense: false,
      isCardAutoPay: false,
      utime: Date.now(),
    });
    colorIndex++;
  }

  const transactions: Transaction[] = [];
  const transferOutRows = rows.filter((r) => r.type === "Transfer-Out");

  for (const row of rows) {
    if (row.type === "Transfer-In") {
      skippedTransferIn++;
      continue;
    }

    const asset = assetMap.get(row.account);
    if (!asset) continue;

    const dateMs = parseMoneyManagerDate(row.date);
    const now = Date.now();

    if (row.type === "Transfer-Out") {
      const targetAsset = assetMap.get(row.category);
      const toAssetUid = targetAsset?.uid ?? null;

      let fee = 0;
      const feeRow = rows.find(
        (r) =>
          r.type === "Expense" &&
          r.date === row.date &&
          r.account === row.account &&
          r.note.toLowerCase().includes("fee"),
      );

      if (feeRow) {
        fee = feeRow.amountIDR;
      }

      const transLinkUid = generateUid();
      const txOutUid = generateUid();

      const txOut: Transaction = {
        uid: txOutUid,
        assetUid: asset.uid,
        ctgUid: null,
        toAssetUid: toAssetUid,
        content: row.note || `Transfer to ${row.category}`,
        date: dateMs,
        writeDate: null,
        doType: 3,
        money: row.amountIDR,
        inMoney: row.amountIDR,
        txUidTrans: transLinkUid,
        txUidFee: null,
        isDel: false,
        utime: now,
        currencyUid: "IDR_IDR",
        amountAccount: row.amountIDR,
        mark: 0,
        paid: null,
        lat: null,
        lng: null,
      };

      const txIn: Transaction = {
        uid: transLinkUid,
        assetUid: toAssetUid ?? asset.uid,
        ctgUid: null,
        toAssetUid: asset.uid,
        content: row.note || `Transfer from ${row.account}`,
        date: dateMs,
        writeDate: null,
        doType: 4,
        money: row.amountIDR,
        inMoney: row.amountIDR,
        txUidTrans: txOutUid,
        txUidFee: null,
        isDel: false,
        utime: now,
        currencyUid: "IDR_IDR",
        amountAccount: row.amountIDR,
        mark: 0,
        paid: null,
        lat: null,
        lng: null,
      };

      if (fee > 0) {
        const feeUid = generateUid();
        const txFee: Transaction = {
          uid: feeUid,
          assetUid: asset.uid,
          ctgUid: null,
          toAssetUid: null,
          content: "Transfer fee",
          date: dateMs,
          writeDate: null,
          doType: 1,
          money: fee,
          inMoney: fee,
          txUidTrans: null,
          txUidFee: null,
          isDel: false,
          utime: now,
          currencyUid: "IDR_IDR",
          amountAccount: fee,
          mark: 0,
          paid: null,
          lat: null,
          lng: null,
        };

        txOut.txUidFee = feeUid;
        txIn.txUidFee = feeUid;
        transactions.push(txFee);
        asset.balance -= fee;
      }

      asset.balance -= row.amountIDR;
      if (targetAsset) {
        targetAsset.balance += row.amountIDR;
      }

      transactions.push(txOut, txIn);
      continue;
    }

    const isFeeRow =
      row.type === "Expense" &&
      row.note.toLowerCase().includes("fee") &&
      transferOutRows.some(
        (t) => t.date === row.date && t.account === row.account,
      );

    if (isFeeRow) continue;

    const doType: DoType = row.type === "Income" ? 2 : 1;

    const matchedCategory = findMatchingCategory(row.category);
    let ctgUid: string | null = null;

    if (matchedCategory) {
      ctgUid = matchedCategory.uid;
    } else {
      const customId = `cat_import_${normalizeCategory(row.category).replace(/\s+/g, "_")}`;

      if (!customCategoryMap.has(customId)) {
        const iconMatch = row.category.match(
          /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u,
        );
        const icon = iconMatch ? iconMatch[0] : "📌";
        const name = row.category.trim() || "Other";

        customCategoryMap.set(customId, {
          uid: customId,
          name: `${icon} ${name.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim() || name}`,
          type: doType === 2 ? 0 : 1,
          status: 0,
          pUid: null,
          orderSeq: 99,
          isDel: false,
          utime: now,
        });
      }

      ctgUid = customId;
    }

    const txn: Transaction = {
      uid: generateUid(),
      assetUid: asset.uid,
      ctgUid,
      toAssetUid: null,
      content: row.note || row.category,
      date: dateMs,
      writeDate: null,
      doType,
      money: row.amountIDR,
      inMoney: row.amountIDR,
      txUidTrans: null,
      txUidFee: null,
      isDel: false,
      utime: now,
      currencyUid: "IDR_IDR",
      amountAccount: row.amountIDR,
      mark: 0,
      paid: null,
      lat: null,
      lng: null,
    };

    if (doType === 2) {
      asset.balance += row.amountIDR;
    } else {
      asset.balance -= row.amountIDR;
    }

    transactions.push(txn);
  }

  const assets = Array.from(assetMap.values());
  const allCategories = [...ALL_DEFAULT_CATEGORIES, ...Array.from(customCategoryMap.values())];

  return {
    assets,
    transactions,
    categories: allCategories,
    summary: {
      totalAssets: assets.length,
      totalTransactions: transactions.length,
      totalCategories: customCategoryMap.size,
      skippedTransferIn,
    },
  };
}
