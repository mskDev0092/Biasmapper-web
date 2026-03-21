import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BiasMapper - Fair and Balanced Analysis Across Perspectives",
  description:
    "Uncover and understand ideological, societal, and cognitive biases in text content using our advanced directional framework. Perfect for journalists, educators, researchers, and critical thinkers.",
  keywords: [
    "bias analysis",
    "media bias",
    "ideological analysis",
    "news analysis",
    "perspective mapping",
    "BiasMapper",
    "cognitive bias",
    "logical fallacy detection",
    "media literacy",
    "critical thinking",
  ],
  authors: [{ name: "BiasMapper Team" }],
  openGraph: {
    title: "BiasMapper - Fair and Balanced Analysis",
    description:
      "A Directional Framework for Fair and Balanced Analysis Across Perspectives",
    type: "website",
    locale: "en_US",
    siteName: "BiasMapper",
  },
  twitter: {
    card: "summary_large_image",
    title: "BiasMapper - Fair and Balanced Analysis",
    description:
      "A Directional Framework for Fair and Balanced Analysis Across Perspectives",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.className} bg-white text-slate-900 antialiased`}
      >
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
