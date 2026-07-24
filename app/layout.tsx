import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    title: "猫咪星轨录",
    description: "上传猫咪照片，完成日常行为测试，生成六维性格报告与星轨分享图。",
    metadataBase,
    openGraph: {
      title: "猫咪星轨录",
      description: "一份有依据、有个性、值得保存的猫咪性格星图。",
      images: [new URL("/og.png", metadataBase).toString()],
    },
    twitter: {
      card: "summary_large_image",
      title: "猫咪星轨录",
      description: "生成猫咪的六维性格报告与星轨分享图。",
      images: [new URL("/og.png", metadataBase).toString()],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
