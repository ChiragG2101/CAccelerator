import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import { NavBar } from "@/components/NavBar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Roles Platform — Find better job matches faster",
  description:
    "Upload your profile once, get relevant role matches, and tailor your resume in one workflow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const content = (
    <>
      <NavBar authEnabled={authEnabled} />
      {children}
    </>
  );

  return (
    <html lang="en">
      <body
        className={`${inter.variable} min-h-screen bg-base-0 text-slate-100`}
      >
        {authEnabled ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  );
}
