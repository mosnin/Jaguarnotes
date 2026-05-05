import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jaguarnotes — AI-Native Notes",
  description: "The note-taking platform where AI is the co-author. Real-time, intelligent, alive.",
  applicationName: "Jaguarnotes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jaguarnotes",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.svg",
    shortcut: "/icons/icon-96x96.svg",
    apple: "/icons/icon-192x192.svg",
  },
  openGraph: {
    title: "Jaguarnotes — AI-Native Notes",
    description: "The note-taking platform where AI is the co-author.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#262626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        </head>
        <body className="min-h-screen w-full bg-jaguar-black text-jaguar-text antialiased">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
