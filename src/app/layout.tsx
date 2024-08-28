import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { GlobalProvider } from "./context/GlobalContext";

export const metadata: Metadata = {
  title:
    "NFTTOOLS - Outbid Competitors, Flip Fast, and Find Profitable Collections for Maximum Profit",
  description: `
    Bidding bot for OpenSea, MagicEden, and Blur
    NFTTOOLS - Outbid Competitors, Flip Fast, and Find Profitable Collections for Maximum Profit
    Automate your bids on OpenSea, MagicEden, and Blur using NFTTOOLS.
  `,
  icons: "/logo-256.png",
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
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>
          NFTTOOLS - Outbid Competitors, Flip Fast, and Find Profitable
          Collections for Maximum Profit
        </title>
        <meta
          name="description"
          content="Bidding bot for OpenSea, MagicEden and Blur"
        />
        <meta
          property="og:title"
          content="NFTTOOLS - Outbid Competitors, Flip Fast, and Find Profitable Collections for Maximum Profit"
        />
        <meta
          property="og:description"
          content="Automate your bids on OpenSea, MagicEden, and Blur using NFTTOOLS."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo-256.png" />
        <meta property="og:url" content="https://www.nfttools.pro" />
        <meta property="og:site_name" content="NFT Tools" />
        <meta name="next-head-count" content="3" />
      </Head>
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
