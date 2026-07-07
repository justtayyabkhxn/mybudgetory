import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mybudgetory.app',
  appName: 'MyBudgetory',
  webDir: 'public', // Required even when using server.url
  server: {
    url: 'https://mybudgetory.vercel.app',
    cleartext: false
  }
};

export default config;