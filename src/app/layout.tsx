import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "つかれみる | 5秒で疲労を数値化",
  description: "カメラに5秒向けるだけ。顔の生体信号からAIが疲労度を数値化します。学術論文ベースのアルゴリズムで、推定睡眠時間・寝るべき度をレシート形式で表示。",
  openGraph: {
    title: "つかれみる | 5秒で疲労を数値化",
    description: "顔は嘘をつかない。カメラで5秒スキャンするだけで疲労度がわかる。",
    type: "website",
    url: "https://joemekw-code.github.io/tsukaremiru/",
  },
  twitter: {
    card: "summary_large_image",
    title: "つかれみる | 5秒で疲労を数値化",
    description: "顔は嘘をつかない。カメラで5秒スキャンするだけで疲労度がわかる。",
  },
  other: {
    "theme-color": "#000000",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/tsukaremiru/manifest.json" />
        <link rel="apple-touch-icon" href="/tsukaremiru/icon-192.png" />
        <meta name="theme-color" content="#000000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "つかれみる",
              url: "https://joemekw-code.github.io/tsukaremiru/",
              description:
                "カメラに5秒向けるだけ。顔の生体信号からAIが疲労度を数値化します。",
              applicationCategory: "HealthApplication",
              operatingSystem: "All",
              offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}
