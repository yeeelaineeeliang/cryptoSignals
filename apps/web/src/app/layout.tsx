import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { DisclaimerFooter } from "@/components/layout/DisclaimerFooter";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Crypto Signals",
  description:
    "Live crypto trading signal dashboard — OLS predictions, VIF feature selection, paper-trading simulator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="relative flex-1 pb-16">{children}</main>
          <DisclaimerFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
