import * as XLSX from "xlsx";
import { Transaction, TransactionCategory, TransactionKind, CustomCategory } from "@/features/transactions/types/transaction";
import { Wallet, WalletColor } from "@/features/wallets/types/wallet";
import { BUILTIN_CATEGORY_LABELS } from "@/features/transactions/config/transaction-config";
import { ImportResult, MoneyManagerRow } from "../types/import-export";

const CATEGORY_MAPPING: Record<string, TransactionCategory> = {
  "🍜 food": "food",
  "🚖 transport": "transport",
  "🧑‍🎤 entertainment": "entertainment",
  "💰 salary": "salary",
  "🧘🏼 health": "health",
  "📙 education": "education",
  "🧥 apparel": "shopping",
  "💄 beauty": "shopping",
  "☕ coffee": "food",
  "🌐 intermet": "subscription",
  "☁️ cloud": "subscription",
  "🧑‍🤝‍🧑 family": "gift_sent",
  "👬🏻 social life": "entertainment",
  "🎱 sports": "entertainment",
  "👷 productivity": "bills",
  "💵 petty cash": "other",
  "other": "other",
  "modified bal.": "other",
};

const WALLET_COLORS: WalletColor[] = ["sky", "emerald", "violet", "rose", "amber", "slate"];

function normalizeCategory(raw: string): string {
  return raw.trim().toLowerCase();
}

function mapCategory(
  rawCategory: string,
  kind: TransactionKind,
): TransactionCategory {
  const normalized = normalizeCategory(rawCategory);
  const mapped = CATEGORY_MAPPING[normalized];

  if (mapped) {
    return mapped;
  }

  if (kind === "transfer") {
    return "transfer";
  }

  return "other";
}

function shouldCreateCustomCategory(rawCategory: string): boolean {
  const normalized = normalizeCategory(rawCategory);

  if (CATEGORY_MAPPING[normalized]) {
    return false;
  }

  const builtinValues = Object.values(BUILTIN_CATEGORY_LABELS).map((v) =>
    v.toLowerCase(),
  );

  if (builtinValues.includes(normalized)) {
    return false;
  }

  return true;
}

function parseMoneyManagerDate(raw: string): string {
  const parts = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);

  if (!parts) {
    return new Date().toISOString();
  }

  const [, month, day, year, hour, minute, second] = parts;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).toISOString();
}

function parseRows(sheetData: unknown[][]): MoneyManagerRow[] {
  const rows: MoneyManagerRow[] = [];

  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];

    if (!row || row.length < 7) {
      continue;
    }

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

export function parseMoneyManagerExcel(fileBuffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
  const rows = parseRows(rawData);

  const accountSet = new Set<string>();
  const customCategoryMap = new Map<string, CustomCategory>();
  let skippedTransferIn = 0;

  for (const row of rows) {
    accountSet.add(row.account);
  }

  const walletMap = new Map<string, Wallet>();
  let colorIndex = 0;

  for (const accountName of accountSet) {
    const walletId = `wallet_import_${accountName.toLowerCase().replace(/\s+/g, "_")}`;
    walletMap.set(accountName, {
      id: walletId,
      name: accountName,
      type: "bank",
      currency: "IDR",
      color: WALLET_COLORS[colorIndex % WALLET_COLORS.length],
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
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

    const wallet = walletMap.get(row.account);

    if (!wallet) {
      continue;
    }

    const occurredAt = parseMoneyManagerDate(row.date);
    const now = new Date().toISOString();

    if (row.type === "Transfer-Out") {
      const targetWallet = walletMap.get(row.category);
      const targetWalletId = targetWallet?.id ?? null;

      let fee = 0;
      const feeRow = rows.find(
        (r) =>
          r.type === "Expense" &&
          r.date === row.date &&
          r.account === row.account &&
          (r.note.toLowerCase().includes("fee") ||
            r.category.toLowerCase() === "other") &&
          r.note.toLowerCase().includes("fee"),
      );

      if (feeRow) {
        fee = feeRow.amountIDR;
      }

      const txn: Transaction = {
        id: `txn_import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        walletId: wallet.id,
        targetWalletId: targetWalletId,
        kind: "transfer",
        category: "transfer",
        amount: row.amountIDR,
        fee,
        description: row.note || `Transfer to ${row.category}`,
        note: row.description || "",
        occurredAt,
        createdAt: now,
        updatedAt: now,
      };

      if (targetWallet) {
        wallet.balance -= row.amountIDR + fee;
        targetWallet.balance += row.amountIDR;
      }

      transactions.push(txn);
      continue;
    }

    const kind: TransactionKind = row.type === "Income" ? "income" : "expense";
    const category = mapCategory(row.category, kind);

    if (
      shouldCreateCustomCategory(row.category) &&
      kind !== "transfer"
    ) {
      const customId = `custom_import_${normalizeCategory(row.category).replace(/\s+/g, "_")}`;

      if (!customCategoryMap.has(customId)) {
        const iconMatch = row.category.match(
          /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u,
        );
        const icon = iconMatch ? iconMatch[0] : "📌";
        const name = row.category.replace(
          /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
          "",
        ).trim() || row.category;

        customCategoryMap.set(customId, {
          id: customId,
          name,
          icon,
          kind: kind === "income" ? "income" : "expense",
        });
      }
    }

    const isFeeRow =
      row.type === "Expense" &&
      row.note.toLowerCase().includes("fee") &&
      transferOutRows.some(
        (t) => t.date === row.date && t.account === row.account,
      );

    if (isFeeRow) {
      continue;
    }

    const resolvedCategory =
      shouldCreateCustomCategory(row.category) && kind !== "transfer"
        ? `custom_import_${normalizeCategory(row.category).replace(/\s+/g, "_")}`
        : category;

    const txn: Transaction = {
      id: `txn_import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      walletId: wallet.id,
      targetWalletId: null,
      kind,
      category: resolvedCategory,
      amount: row.amountIDR,
      fee: 0,
      description: row.note || row.category,
      note: row.description || "",
      occurredAt,
      createdAt: now,
      updatedAt: now,
    };

    if (kind === "income") {
      wallet.balance += row.amountIDR;
    } else {
      wallet.balance -= row.amountIDR;
    }

    transactions.push(txn);
  }

  const wallets = Array.from(walletMap.values());
  const customCategories = Array.from(customCategoryMap.values());

  return {
    wallets,
    transactions,
    customCategories,
    summary: {
      totalWallets: wallets.length,
      totalTransactions: transactions.length,
      totalCustomCategories: customCategories.length,
      skippedTransferIn,
    },
  };
}
