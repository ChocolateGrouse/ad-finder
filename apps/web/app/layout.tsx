import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AD Finder - Find the Best Advertising Opportunities",
  description:
    "Discover the best advertising opportunities across the web. Maximize your reach and ROI with AI-powered ad placement recommendations.",
  keywords: [
    "advertising",
    "ad placement",
    "marketing",
    "digital advertising",
    "ROI",
    "CTR",
    "ad optimization",
  ],
  authors: [{ name: "AD Finder" }],
  openGraph: {
    title: "AD Finder - Find the Best Advertising Opportunities",
    description:
      "Discover the best advertising opportunities across the web. Maximize your reach and ROI with AI-powered ad placement recommendations.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AD Finder - Find the Best Advertising Opportunities",
    description:
      "Discover the best advertising opportunities across the web. Maximize your reach and ROI with AI-powered ad placement recommendations.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
