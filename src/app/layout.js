import { Inter, JetBrains_Mono } from "next/font/google";
import ExportButtons from "@/components/ExportButtons";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pollen annotation review",
  description: "Browse and correct pollen species labels from the DINOv2 pipeline output.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ExportButtons />
        {children}
      </body>
    </html>
  );
}
