import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { Wallet } from "../types/wallet";

const walletsStorageKey = "vaultix.wallets";

export function getStoredWallets(): Wallet[] {
  return readLocalStorage<Wallet[]>(walletsStorageKey, []);
}

export function storeWallets(wallets: Wallet[]) {
  writeLocalStorage(walletsStorageKey, wallets);
}

