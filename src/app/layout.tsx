import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wahoo Athlete Profile Card",
  description: "Create your personalized Wahoo athlete profile card",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black antialiased">{children}</body>
    </html>
  );
}
