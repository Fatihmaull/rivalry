import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";

export const metadata: Metadata = {
  title: "Rivalry — Turn Goals Into Competitions",
  description: "A rival-based goal accountability platform. Compete, stay accountable, and win prizes by completing your goals.",
  keywords: "goals, accountability, competition, rivalry, self-improvement, challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
