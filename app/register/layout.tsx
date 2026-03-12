import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account",
    description:
        "Create a free Vaultix account to start tracking your income, expenses, and net worth.",
    openGraph: {
        title: "Create Account | Vaultix",
        description:
            "Create a free Vaultix account to start tracking your income, expenses, and net worth.",
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
