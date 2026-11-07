import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Copilot — AI Research Copilot (POC)",
  description:
    "Proof-of-concept triage inbox for AI-assisted portfolio research. Demo data only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#191c1f] text-[#f4f4f4]">
        {children}
      </body>
    </html>
  );
}
