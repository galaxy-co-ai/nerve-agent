import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#18181b",
          colorInputText: "#ffffff",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="antialiased bg-[#0a0a0a] text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
