"use client";

import { Asset } from "@/features/wallets/types/wallet";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type DeleteWalletDialogProps = {
  asset: Asset | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (assetUid: string) => void;
};

export function DeleteWalletDialog({
  asset,
  isOpen,
  onOpenChange,
  onConfirm,
}: DeleteWalletDialogProps) {
  if (!asset) return null;

  function handleConfirm() {
    if (!asset) return;
    onConfirm(asset.uid);
    onOpenChange(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">Delete wallet</h2>
            <p className="text-[12px] leading-relaxed text-muted">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{asset.name}</span>?
              This action cannot be undone and all associated data will be lost.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 h-9"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1 h-9 bg-danger text-white hover:bg-danger/90"
              onClick={handleConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
