import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./globals.css";
import { Providers } from "@/components/providers";

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
      <body className="font-sans antialiased bg-[var(--nerve-bg-base)] text-[var(--nerve-text-primary)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
