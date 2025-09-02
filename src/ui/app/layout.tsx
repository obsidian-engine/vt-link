import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VTube LINE Manager",
  description: "VTuber向けLINE公式アカウント管理ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}