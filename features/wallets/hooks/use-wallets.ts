"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, WalletBalanceAdjustment } from "../types/wallet";
import { getStoredWallets, storeWallets } from "../services/wallet-storage.service";

type UseWalletsState = {
  wallets: Wallet[];
  isLoading: boolean;
};

type UseWalletsValue = UseWalletsState & {
  activeWallets: Wallet[];
  archivedWallets: Wallet[];
  getWalletById: (id: string) => Wallet | undefined;
  addWallet: (wallet: Wallet) => void;
  updateWallet: (walletId: string, updates: Partial<Omit<Wallet, "id" | "createdAt">>) => void;
  deleteWallet: (walletId: string) => void;
  archiveWallet: (walletId: string) => void;
  restoreWallet: (walletId: string) => void;
  adjustBalance: (adjustment: WalletBalanceAdjustment) => void;
  reorderWallets: (orderedIds: string[]) => void;
  updateWalletBalance: (walletId: string, delta: number) => void;
};

export function useWallets(): UseWalletsValue {
  const [state, setState] = useState<UseWalletsState>({
    wallets: [],
    isLoading: true,
  });

  useEffect(() => {
    setState({
      wallets: getStoredWallets(),
      isLoading: false,
    });
  }, []);

  const activeWallets = useMemo(
    () => state.wallets.filter((wallet) => !wallet.isArchived),
    [state.wallets],
  );

  const archivedWallets = useMemo(
    () => state.wallets.filter((wallet) => wallet.isArchived),
    [state.wallets],
  );

  const getWalletById = useCallback(
    (id: string) => state.wallets.find((wallet) => wallet.id === id),
    [state.wallets],
  );

  function persist(nextWallets: Wallet[]) {
    storeWallets(nextWallets);
  }

  function addWallet(wallet: Wallet) {
    setState((previous) => {
      const nextWallets = [...previous.wallets, wallet];
      persist(nextWallets);
      return { ...previous, wallets: nextWallets };
    });
  }

  function updateWallet(
    walletId: string,
    updates: Partial<Omit<Wallet, "id" | "createdAt">>,
  ) {
    setState((previous) => {
      const nextWallets = previous.wallets.map((wallet) => {
        if (wallet.id !== walletId) {
          return wallet;
        }

        return {
          ...wallet,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      });

      persist(nextWallets);
      return { ...previous, wallets: nextWallets };
    });
  }

  function deleteWallet(walletId: string) {
    setState((previous) => {
      const nextWallets = previous.wallets.filter(
        (wallet) => wallet.id !== walletId,
      );
      persist(nextWallets);
      return { ...previous, wallets: nextWallets };
    });
  }

  function archiveWallet(walletId: string) {
    updateWallet(walletId, { isArchived: true });
  }

  function restoreWallet(walletId: string) {
    updateWallet(walletId, { isArchived: false });
  }

  function adjustBalance(adjustment: WalletBalanceAdjustment) {
    setState((previous) => {
      const nextWallets = previous.wallets.map((wallet) => {
        if (wallet.id !== adjustment.walletId) {
          return wallet;
        }

        return {
          ...wallet,
          balance: wallet.balance + adjustment.amount,
          updatedAt: adjustment.adjustedAt,
        };
      });

      persist(nextWallets);
      return { ...previous, wallets: nextWallets };
    });
  }

  function updateWalletBalance(walletId: string, delta: number) {
    setState((previous) => {
      const nextWallets = previous.wallets.map((wallet) => {
        if (wallet.id !== walletId) {
          return wallet;
        }

        return {
          ...wallet,
          balance: wallet.balance + delta,
          updatedAt: new Date().toISOString(),
        };
      });

      persist(nextWallets);
      return { ...previous, wallets: nextWallets };
    });
  }

  function reorderWallets(orderedIds: string[]) {
    setState((previous) => {
      const walletMap = new Map(
        previous.wallets.map((wallet) => [wallet.id, wallet]),
      );

      const reordered = orderedIds
        .map((id) => walletMap.get(id))
        .filter((wallet): wallet is Wallet => wallet !== undefined);

      const remaining = previous.wallets.filter(
        (wallet) => !orderedIds.includes(wallet.id),
      );

      const nextWallets = [...reordered, ...remaining];
      persist(nextWallets);
      return { ...previous, wallets: nextWallets };
    });
  }

  return {
    wallets: state.wallets,
    isLoading: state.isLoading,
    activeWallets,
    archivedWallets,
    getWalletById,
    addWallet,
    updateWallet,
    deleteWallet,
    archiveWallet,
    restoreWallet,
    adjustBalance,
    reorderWallets,
    updateWalletBalance,
  };
}
