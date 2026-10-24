import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/lib/store";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata = {
  title: "Pesona Khayangan Juanda",
  description: "Prototype aplikasi pengelolaan komplek Pesona Khayangan Juanda",
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#EDF4EE" };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans bg-canvas min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
