 "use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { CreateWalletSheet } from "@/components/wallets/create-wallet-sheet";
import { WalletList } from "@/components/wallets/wallet-list";
import { useWallets } from "@/features/wallets/hooks/use-wallets";

export default function HomePage() {
  const { wallets, isLoading, addWallet } = useWallets();

  return (
    <AuthGate>
      <MobileShell title="Overview" activeTab="wallets">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted">
            Loading your wallets
          </div>
        ) : (
          <WalletList wallets={wallets} />
        )}
        <CreateWalletSheet onSubmit={addWallet} />
      </MobileShell>
    </AuthGate>
  );
}

