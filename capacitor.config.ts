import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vercel.mybudgetory',
  appName: 'Budgetory',
  webDir: 'www',
  server: {
    // The app is a thin native shell around the deployed Next.js site.
    // Launch straight into the dashboard instead of the marketing landing page.
    url: 'https://mybudgetory.vercel.app/dashboard',
    hostname: 'mybudgetory.vercel.app',
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#E8EBE6',
  },
  backgroundColor: '#E8EBE6',
  plugins: {
    SystemBars: {
      // Transparent bars over a full-bleed web view; the page gets the insets
      // back through env(safe-area-inset-*) thanks to viewport-fit=cover.
      style: 'LIGHT',
      insetsHandling: 'css',
    },
  },
};

export default config;
