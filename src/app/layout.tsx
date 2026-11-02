import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "АнимеХаб — смотреть аниме онлайн",
  description: "Каталог аниме: поиск по названию, жанры, фильтры, просмотр серий онлайн.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-ink text-zinc-200 antialiased">
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
