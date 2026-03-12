import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
    description:
        "Manage your Vaultix account, sync data to the cloud, and import or export your financial backup files.",
    openGraph: {
        title: "Settings | Vaultix",
        description:
            "Manage your Vaultix account, sync data to the cloud, and import or export your financial backup files.",
    },
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
