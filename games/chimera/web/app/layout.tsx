import type { Metadata } from "next";
import { Press_Start_2P, Cinzel_Decorative } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const titleFont = Cinzel_Decorative({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "Chimera",
  description: "A time-traveling JRPG - Medieval facade, sci-fi reality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} ${titleFont.variable} antialiased bg-black`}>
        {children}
      </body>
    </html>
  );
}
