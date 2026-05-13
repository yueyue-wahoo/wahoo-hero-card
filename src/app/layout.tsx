import type { Metadata } from "next";
import "./globals.css";
import WahooLogo from "@/components/WahooLogo";

export const metadata: Metadata = {
  title: "Wahoo Athlete Profile",
  description: "Create your personalized Wahoo athlete profile card",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black antialiased font-sans">
        <header className="px-4 pt-4 pb-0">
          <WahooLogo className="h-9 w-auto text-white" />
        </header>
        {children}
      </body>
    </html>
  );
}
