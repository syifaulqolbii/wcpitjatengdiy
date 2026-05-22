import type { Metadata, Viewport } from "next";
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
  title: "WCP IT Jateng DIY",
  description: "World Cup 2026 Prediction App for IT Jateng DIY",
  manifest: "/manifest.webmanifest",
  applicationName: "WCP IT Jateng DIY",
  appleWebApp: {
    capable: true,
    title: "WCP",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#00E676",
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
