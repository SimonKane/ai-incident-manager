import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Incident Manager",
  description:
    "Frontend-only showcase for an AI-assisted incident management dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
