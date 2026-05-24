import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700", "900"]
});

export const metadata: Metadata = {
  title: "HIROKATSU SUZUKI PORTFOLIO WEB AND VISUAL COMMUNICATION",
  description: "HIROKATSU SUZUKI portfolio gallery"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
