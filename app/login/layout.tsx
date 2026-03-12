import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description:
        "Sign in to Vaultix to sync your wallets, transactions, and backups across devices.",
    openGraph: {
        title: "Sign In | Vaultix",
        description:
            "Sign in to Vaultix to sync your wallets, transactions, and backups across devices.",
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
