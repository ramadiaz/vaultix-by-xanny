import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { DoType, Transaction, Tag, TxTag } from "../types/transaction";

const TRANSACTIONS_KEY = "vaultix.transactions";
const TAGS_KEY = "vaultix.tags";
const TX_TAGS_KEY = "vaultix.tx_tags";

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

export function getStoredTransactions(): Transaction[] {
  const raw = readLocalStorage<Record<string, unknown>[]>(TRANSACTIONS_KEY, []);
  return raw.map(sanitizeTransaction);
}

export function storeTransactions(transactions: Transaction[]) {
  writeLocalStorage(TRANSACTIONS_KEY, transactions);
}

export function getStoredTags(): Tag[] {
  return readLocalStorage<Tag[]>(TAGS_KEY, []);
}

export function storeTags(tags: Tag[]) {
  writeLocalStorage(TAGS_KEY, tags);
}

export function getStoredTxTags(): TxTag[] {
  return readLocalStorage<TxTag[]>(TX_TAGS_KEY, []);
}

export function storeTxTags(txTags: TxTag[]) {
  writeLocalStorage(TX_TAGS_KEY, txTags);
}
