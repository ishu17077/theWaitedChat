import type { Metadata } from "next";
import { Outfit, Space_Mono, Great_Vibes } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "WebManiac | Exclusively For College Students",
  description: "Turn ideas into live websites through creativity, coding, and rapid problem solving. A fast paced challenge where innovation, teamwork, and smart design take center stage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceMono.variable} ${greatVibes.variable} antialiased`}
    >
      <body className="bg-black text-white selection:bg-green-500/30 font-sans min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
