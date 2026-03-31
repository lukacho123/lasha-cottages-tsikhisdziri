import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ციხისძირი კოტეჯები | დასვენება ზღვის პირას",
  description: "დაჯავშნე კოტეჯი ციხისძირში. კომფორტული დასვენება ზღვის პირას, მშვენიერ გარემოში.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${geist.className} bg-[#0a1628] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
