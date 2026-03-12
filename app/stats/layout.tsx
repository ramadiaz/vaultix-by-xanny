import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Stats",
    description:
        "Visualize your spending habits and income trends with interactive charts and category breakdowns.",
    openGraph: {
        title: "Stats | Vaultix",
        description:
            "Visualize your spending habits and income trends with interactive charts and category breakdowns.",
    },
};

export default function StatsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
