import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "acspc",
  description: "Automation of Construction Site Photo Classification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
