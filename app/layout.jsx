import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
export const metadata = {
  title: "MedPath - Healthcare Reimagined",
  description: "Get instant health assessments, connect with verified doctors, and book appointments seamlessly.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};
export default function RootLayout({ children, }) {
  return (<html lang="en" suppressHydrationWarning>
    <body className="font-sans antialiased" suppressHydrationWarning>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Analytics />
        <Toaster />
      </ThemeProvider>
    </body>
  </html>);
}
