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
      <head>
        {/* Apply the saved theme before first paint so there's no
         * flash of the wrong theme on load. Runs synchronously,
         * before React hydrates. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("finance-copilot-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
