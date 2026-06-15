import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Analysis Dashboard — Fuel Subsidy Impact Study",
  description:
    "Automated Chapter 4 statistical analysis for the study: Perceived Effects of Fuel Subsidy Removal on Healthcare Delivery Among Health Workers in Prince Audu Abubakar University Teaching Hospital, Anyigba.",
  keywords: [
    "fuel subsidy removal",
    "healthcare workers",
    "statistical analysis",
    "research dashboard",
    "Nigeria",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy-900 antialiased">
        {children}
      </body>
    </html>
  );
}
