import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { StudySyncProvider } from "@/components/providers/StudySyncProvider";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "StudySync — AI-Powered Study Duration Recommendation",
  description:
    "Optimize your study sessions with AI-powered fuzzy logic recommendations. StudySync uses the Mamdani method to determine optimal study duration based on focus, fatigue, and complexity.",
  keywords: [
    "study",
    "AI",
    "fuzzy logic",
    "Mamdani",
    "education",
    "productivity",
    "study tips",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <StudySyncProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </StudySyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
