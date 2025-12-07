import type { Metadata } from "next";
import { DM_Sans } from 'next/font/google';
import "./globals.css";

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "BookFactory AI - Write Your Book with AI",
  description: "AI-powered platform for indie authors to write, publish, and market their books.",
  keywords: ["book writing", "ai writing assistant", "indie author", "self publishing", "ebook creator"],
  authors: [{ name: "BookFactory" }],
  openGraph: {
    title: "BookFactory AI - Write Your Book with AI",
    description: "The complete platform for indie authors. Write with AI assistance, export to any format, and track your sales.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 antialiased dark:bg-stone-950">
        {children}
      </body>
    </html>
  );
}
