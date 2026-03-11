 "use client";

import { useEffect, useState } from "react";
import { Wallet } from "../types/wallet";
import { getStoredWallets, storeWallets } from "../services/wallet-storage.service";

type UseWalletsState = {
  wallets: Wallet[];
  isLoading: boolean;
};

type UseWalletsValue = UseWalletsState & {
  addWallet: (wallet: Wallet) => void;
};

export function useWallets(): UseWalletsValue {
  const [state, setState] = useState<UseWalletsState>({
    wallets: [],
    isLoading: true,
  });

  useEffect(() => {
    const storedWallets = getStoredWallets();

    setState({
      wallets: storedWallets,
      isLoading: false,
    });
  }, []);

  function addWallet(wallet: Wallet) {
    setState((previousState) => {
      const nextWallets = [...previousState.wallets, wallet];
      storeWallets(nextWallets);

      return {
        ...previousState,
        wallets: nextWallets,
      };
    });
  }

  return {
    wallets: state.wallets,
    isLoading: state.isLoading,
    addWallet,
  };
}

