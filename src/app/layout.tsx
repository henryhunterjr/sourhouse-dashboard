import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Great Bread Showdown | Test Your Baking Knowledge",
  description: "A fun quiz game for bread bakers. Test your knowledge across three difficulty levels!",
  openGraph: {
    title: "The Great Bread Showdown",
    description: "Test your bread baking knowledge!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
