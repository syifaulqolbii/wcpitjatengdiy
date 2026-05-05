import type { Metadata } from "next";
import { Manrope, Lexend } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "sonner";
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const lexend = Lexend({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "World Cup 2026 Predictor",
  description: "Private World Cup 2026 Prediction App for IT Jateng DIY",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${lexend.variable}`}>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <QueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
