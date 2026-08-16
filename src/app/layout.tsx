import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_KR } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-heading",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "나의 하루 | 일정·할일·일기",
  description: "일정 관리, 할일, 일기를 한 곳에서. 타자와 음성으로 기록하고 카카오톡으로 알림받기.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifKr.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
