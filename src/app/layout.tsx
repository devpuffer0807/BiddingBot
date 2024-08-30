import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "./context/GlobalContext";
import ToastProvider from "./context/ToastProvider";

export const metadata: Metadata = {
  title:
    "NFTTOOLS - Outbid Competitors, Flip Fast, and Find Profitable Collections for Maximum Profit",
  description:
    "Bidding bot for OpenSea, MagicEden, and Blur. Automate your bids on OpenSea, MagicEden, and Blur using NFTTOOLS.",
  icons: "/logo-256.png",
  openGraph: {
    title:
      "NFTTOOLS - Outbid Competitors, Flip Fast, and Find Profitable Collections for Maximum Profit",
    description:
      "Automate your bids on OpenSea, MagicEden, and Blur using NFTTOOLS.",
    type: "website",
    url: "https://www.nfttools.pro",
    siteName: "NFT Tools",
    images: [
      {
        url: "/logo-256.png",
      },
    ],
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      <body>
        <GlobalProvider>
          {children}
          <ToastProvider />
        </GlobalProvider>
      </body>
    </html>
  );
}
