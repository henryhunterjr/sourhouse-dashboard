import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SourHouse Commission Tracker | HBK23",
  description: "Track your SourHouse affiliate commissions for Baking Great Bread at Home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
