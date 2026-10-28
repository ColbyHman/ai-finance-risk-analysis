import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Finance Risk Analysis — Portfolio Risk Dashboard (POC)",
  description:
    "Proof-of-concept dashboard for AI-driven portfolio risk analysis. Demo data only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
