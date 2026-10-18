import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
export const metadata = { title: "Pesona Khayangan Juanda", description: "Prototype demo manajemen perumahan" };
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} font-sans`}>{children}</body>
    </html>
  );
}
