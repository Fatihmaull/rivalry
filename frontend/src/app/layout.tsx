import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";
import Footer from "../components/Footer";
import ToastContainer from "../components/ToastContainer";

export const metadata: Metadata = {
  title: "Rivalry — Competitive Goal Achievement",
  description: "The competitive goal achievement platform. Get matched with rivals, follow AI-generated roadmaps, submit proof, and win prizes.",
  keywords: "goals, accountability, competition, rivalry, self-improvement, challenges, compete",
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
          <Footer />
          <ToastContainer />
        </ClientProviders>
      </body>
    </html>
  );
}
