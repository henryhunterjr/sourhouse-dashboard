import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BreadFindr | Find Artisan Bakeries Near You",
  description: "Discover artisan bread bakeries, farmers markets, and home bakers in your area. Find the best sourdough, whole grain, and specialty breads near you.",
  keywords: "artisan bread, bakery, sourdough, farmers market, home baker, bread near me",
  openGraph: {
    title: "BreadFindr | Find Artisan Bakeries Near You",
    description: "Discover artisan bread bakeries, farmers markets, and home bakers in your area.",
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
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
