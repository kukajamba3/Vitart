import Link from "next/link";
import SearchBox from "./SearchBox";
import { getCurrentUser } from "@/lib/auth";

export default async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight text-white">
          Аниме<span className="text-violet-400">Хаб</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-zinc-400 sm:flex">
          <Link className="hover:text-white" href="/">
            Главная
          </Link>
          <Link className="hover:text-white" href="/catalog">
            Каталог
          </Link>
        </nav>
        <div className="flex-1">
          <SearchBox />
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm">
          {user ? (
            <Link
              href="/profile"
              className="max-w-[180px] truncate rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
              title={user.email}
            >
              {user.name ?? user.email}
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-zinc-300 hover:text-white">
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-violet-600 px-3 py-2 font-semibold text-white hover:bg-violet-500"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
