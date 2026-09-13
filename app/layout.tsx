import type { Metadata } from "next";
import { Literata, Karla, Red_Hat_Mono } from "next/font/google";
import "./globals.css";

const display = Literata({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Karla({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = Red_Hat_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MakeSense",
  description: "Give it dense technical stuff and get the version a human can actually understand.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
