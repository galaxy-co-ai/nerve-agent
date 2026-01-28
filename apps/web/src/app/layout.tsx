import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NERVE AGENT",
  description: "Project operating system for solo builders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
