import type { Metadata } from "next";
import "./globals.css";
import { Jua, Gamja_Flower } from 'next/font/google'

const jua = Jua({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const gamjaFlower = Gamja_Flower({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-handwriting'
})

export const metadata: Metadata = {
  title: "메모톡 - 포스트잇 메모 SNS",
  description: "귀여운 포스트잇으로 소통하는 메모 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jua.className} ${gamjaFlower.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
