"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Asset, AssetGroup, BalanceAdjustment, Currency } from "../types/wallet";
import {
  getStoredAssets,
  storeAssets,
  getStoredAssetGroups,
  getStoredCurrencies,
} from "../services/wallet-storage.service";
import { ASSET_GROUP_LABELS } from "../config/wallet-config";
import { AssetGroupType } from "../types/wallet";

type UseWalletsState = {
  assets: Asset[];
  assetGroups: AssetGroup[];
  currencies: Currency[];
  isLoading: boolean;
};

type UseWalletsValue = UseWalletsState & {
  activeAssets: Asset[];
  archivedAssets: Asset[];
  getAssetByUid: (uid: string) => Asset | undefined;
  getCurrencyByUid: (uid: string) => Currency | undefined;
  getGroupLabel: (groupUid: string) => string;
  getCurrencyIso: (currencyUid: string) => string;
  addAsset: (asset: Asset) => void;
  updateAsset: (assetUid: string, updates: Partial<Omit<Asset, "uid">>) => void;
  deleteAsset: (assetUid: string) => void;
  archiveAsset: (assetUid: string) => void;
  restoreAsset: (assetUid: string) => void;
  adjustBalance: (adjustment: BalanceAdjustment) => void;
  reorderAssets: (orderedUids: string[]) => void;
  updateAssetBalance: (assetUid: string, delta: number) => void;
};

export function useWallets(): UseWalletsValue {
  const [state, setState] = useState<UseWalletsState>({
    assets: [],
    assetGroups: [],
    currencies: [],
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [assets, groups, currencies] = await Promise.all([
        getStoredAssets(),
        getStoredAssetGroups(),
        getStoredCurrencies(),
      ]);

      if (!mounted) return;

      setState({
        assets,
        assetGroups: groups,
        currencies,
        isLoading: false,
      });
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const activeAssets = useMemo(
    () => state.assets.filter((a) => !a.isArchived).sort((a, b) => a.orderSeq - b.orderSeq),
    [state.assets],
  );

  const archivedAssets = useMemo(
    () => state.assets.filter((a) => a.isArchived),
    [state.assets],
  );

  const getAssetByUid = useCallback(
    (uid: string) => state.assets.find((a) => a.uid === uid),
    [state.assets],
  );

  const getCurrencyByUid = useCallback(
    (uid: string) => state.currencies.find((c) => c.uid === uid),
    [state.currencies],
  );

  const getGroupLabel = useCallback(
    (groupUid: string) => {
      const group = state.assetGroups.find((g) => g.uid === groupUid);
      if (group) return group.name;
      const numericType = Number(groupUid) as AssetGroupType;
      return ASSET_GROUP_LABELS[numericType] ?? "Other";
    },
    [state.assetGroups],
  );

  const getCurrencyIso = useCallback(
    (currencyUid: string) => {
      const currency = state.currencies.find((c) => c.uid === currencyUid);
      return currency?.iso ?? "IDR";
    },
    [state.currencies],
  );

  async function persist(nextAssets: Asset[]) {
    await storeAssets(nextAssets);
  }

  function addAsset(asset: Asset) {
    setState((prev) => {
      const next = [...prev.assets, asset];
      return { ...prev, assets: next };
    });
    persist([...state.assets, asset]);
  }

  function updateAsset(assetUid: string, updates: Partial<Omit<Asset, "uid">>) {
    setState((prev) => {
      const next = prev.assets.map((a) => {
        if (a.uid !== assetUid) return a;
        return { ...a, ...updates, utime: Date.now() };
      });
      return { ...prev, assets: next };
    });
    const next = state.assets.map((a) =>
      a.uid === assetUid ? { ...a, ...updates, utime: Date.now() } : a,
    );
    persist(next);
  }

  function deleteAsset(assetUid: string) {
    setState((prev) => {
      const next = prev.assets.filter((a) => a.uid !== assetUid);
      return { ...prev, assets: next };
    });
    const next = state.assets.filter((a) => a.uid !== assetUid);
    persist(next);
  }

  function archiveAsset(assetUid: string) {
    updateAsset(assetUid, { isArchived: true });
  }

  function restoreAsset(assetUid: string) {
    updateAsset(assetUid, { isArchived: false });
  }

  function adjustBalance(adjustment: BalanceAdjustment) {
    setState((prev) => {
      const next = prev.assets.map((a) => {
        if (a.uid !== adjustment.assetUid) return a;
        return { ...a, balance: a.balance + adjustment.amount, utime: adjustment.adjustedAt };
      });
      return { ...prev, assets: next };
    });
    const next = state.assets.map((a) =>
      a.uid === adjustment.assetUid
        ? { ...a, balance: a.balance + adjustment.amount, utime: adjustment.adjustedAt }
        : a,
    );
    persist(next);
  }

  function updateAssetBalance(assetUid: string, delta: number) {
    setState((prev) => {
      const next = prev.assets.map((a) => {
        if (a.uid !== assetUid) return a;
        return { ...a, balance: a.balance + delta, utime: Date.now() };
      });
      return { ...prev, assets: next };
    });
    const next = state.assets.map((a) =>
      a.uid === assetUid ? { ...a, balance: a.balance + delta, utime: Date.now() } : a,
    );
    persist(next);
  }

  function reorderAssets(orderedUids: string[]) {
    setState((prev) => {
      const assetMap = new Map(prev.assets.map((a) => [a.uid, a]));
      const reordered = orderedUids
        .map((uid, i) => {
          const asset = assetMap.get(uid);
          return asset ? { ...asset, orderSeq: i + 1 } : undefined;
        })
        .filter((a): a is Asset => a !== undefined);

      const remaining = prev.assets.filter((a) => !orderedUids.includes(a.uid));
      const next = [...reordered, ...remaining];
      return { ...prev, assets: next };
    });
    const assetMap = new Map(state.assets.map((a) => [a.uid, a]));
    const reordered = orderedUids
      .map((uid, i) => {
        const asset = assetMap.get(uid);
        return asset ? { ...asset, orderSeq: i + 1 } : undefined;
      })
      .filter((a): a is Asset => a !== undefined);
    const remaining = state.assets.filter((a) => !orderedUids.includes(a.uid));
    const next = [...reordered, ...remaining];
    persist(next);
  }

  return {
    assets: state.assets,
    assetGroups: state.assetGroups,
    currencies: state.currencies,
    isLoading: state.isLoading,
    activeAssets,
    archivedAssets,
    getAssetByUid,
    getCurrencyByUid,
    getGroupLabel,
    getCurrencyIso,
    addAsset,
    updateAsset,
    deleteAsset,
    archiveAsset,
    restoreAsset,
    adjustBalance,
    reorderAssets,
    updateAssetBalance,
  };
}
