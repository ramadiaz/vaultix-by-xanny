import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Transactions",
    description:
        "View, filter, and manage all your income and expense transactions in one place.",
    openGraph: {
        title: "Transactions | Vaultix",
        description:
            "View, filter, and manage all your income and expense transactions in one place.",
    },
};

export default function TransactionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
