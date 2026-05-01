import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GemCouncil",
  description: "Voice-first English interview and meeting practice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
