// app/layout.tsx
import './globals.css'; // if you have global styles
import { Bricolage_Grotesque } from "next/font/google";
import ToastContainer from "@/components/ToastContainer";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} antialiased dark:bg-gray-950`}>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
