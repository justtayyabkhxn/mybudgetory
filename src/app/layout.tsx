// app/layout.tsx
import './globals.css'; // if you have global styles
import { Bricolage_Grotesque } from "next/font/google";
import ToastContainer from "@/components/ToastContainer";
import OfflineSyncProvider from "@/components/OfflineSyncProvider";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata = {
  title: 'Budgetory',
  description: 'Your budget. Your story.',
};

// viewport-fit=cover is required for env(safe-area-inset-*) to report real
// values inside the edge-to-edge Capacitor shell.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: '#001f40',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} antialiased dark:bg-gray-950`}>
      <body>
        {children}
        <ToastContainer />
        <OfflineSyncProvider />
      </body>
    </html>
  );
}
