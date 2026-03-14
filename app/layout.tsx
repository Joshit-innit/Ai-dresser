import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Dresser - Virtual Try-On Platform",
  description: "Professional AI-powered virtual try-on with 100% garment fidelity",
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
