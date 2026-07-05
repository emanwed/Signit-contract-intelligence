import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ContractsProvider } from "@/context/ContractsContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { NotificationsProvider } from "@/context/NotificationsContext";

// Single clean sans across the whole UI — full Arabic + Latin coverage in
// every weight the interface uses (body text through the bold wordmark).
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signit — Post-signature contract intelligence",
  description:
    "Signit — an Arabic-first post-signature contract-intelligence experience: source-linked confidence, a dual Hijri/Gregorian obligation radar, persona lenses, and live AI Q&A.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Defaults hard-coded here (Arabic RTL + light) match AppProvider's initial
  // state, avoiding a hydration flash. suppressHydrationWarning covers the
  // attribute reconciliation the provider performs on mount.
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="light"
      suppressHydrationWarning
      className={plexArabic.variable}
    >
      <body>
        <AppProvider>
          <ContractsProvider>
            <SettingsProvider>
              <NotificationsProvider>{children}</NotificationsProvider>
            </SettingsProvider>
          </ContractsProvider>
        </AppProvider>
      </body>
    </html>
  );
}
