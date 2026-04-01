import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wahoo 4DP Card Builder",
  description: "Create your personalized Wahoo cycling trading card",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
