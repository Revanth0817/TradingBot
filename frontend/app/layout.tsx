import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algo Desk - SmartAPI",
  description: "Intraday scalping dashboard with Angel One SmartAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
