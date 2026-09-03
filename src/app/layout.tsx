// app/layout.tsx
import './globals.css'; // if you have global styles
import { Bricolage_Grotesque } from "next/font/google";
import ToastContainer from "@/components/ToastContainer";
import OfflineSyncProvider from "@/components/OfflineSyncProvider";
import MoneyBackdrop from "@/components/MoneyBackdrop";
import ThemeToggle from "@/components/ThemeToggle";

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8ebe6' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0f0c' },
  ],
};

// Resolves the theme and stamps `data-theme` on <html> before the first paint,
// so a dark-mode visitor never sees a flash of the light canvas. Stored
// preference wins; absent one, the OS setting decides. The `theme-ready` class
// is what enables the colour transition — it is not present during this run,
// so the initial paint does not animate.
const THEME_BOOT = `(function(){try{
  var p=localStorage.getItem('budgetory-theme');
  var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=d? 'dark': 'light';
}catch(e){document.documentElement.dataset.theme='light';}
requestAnimationFrame(function(){document.documentElement.classList.add('theme-ready');});})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="text-ink">
        <MoneyBackdrop />
        {children}
        <ThemeToggle />
        <ToastContainer />
        <OfflineSyncProvider />
      </body>
    </html>
  );
}
