import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/features/auth/hooks/use-auth";
import { HeroUIRootProvider } from "@/components/theme/heroui-provider";
import { SyncProvider } from "@/features/sync/context/sync-provider";
import { SyncManager } from "@/features/sync/components/sync-manager";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Vaultix";
const APP_DESCRIPTION =
  "Offline-first personal finance tracker. Manage wallets, track income & expenses, and get spending insights — all from your phone or browser.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://vaultix.xann.my.id",
  ),
  title: {
    default: `${APP_NAME} — Personal Finance Tracker`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "money tracker",
    "personal finance",
    "expense tracker",
    "budget app",
    "offline finance",
    "wallet manager",
  ],
  authors: [{ name: "Xanny" }],
  creator: "Xanny",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Personal Finance Tracker`,
    description: APP_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME} — Personal Finance Tracker`,
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/favicon_io/favicon.ico",
      },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0d12" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <HeroUIRootProvider>
            <AuthProvider>
              <SyncProvider>
                <SyncManager />
                {children}
              </SyncProvider>
            </AuthProvider>
          </HeroUIRootProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
