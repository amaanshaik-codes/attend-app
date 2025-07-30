import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Attend",
  description: "An elegant attendance system powered by Google Sheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-black font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
