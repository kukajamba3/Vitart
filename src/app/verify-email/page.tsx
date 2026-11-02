import Link from "next/link";
import { verifyEmailToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const token = String(searchParams.token ?? "");
  let state: "ok" | "bad" | "missing" = "missing";
  if (token) {
    try {
      state = (await verifyEmailToken(token)) ? "ok" : "bad";
    } catch {
      state = "bad";
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="rounded-2xl border border-white/10 bg-panel p-6 text-center">
        {state === "ok" && (
          <>
            <div className="text-4xl">✅</div>
            <h1 className="mt-3 text-xl font-extrabold text-white">Почта подтверждена!</h1>
            <p className="mt-2 text-sm text-zinc-400">Аккаунт активирован. Теперь можно войти.</p>
            <Link
              href="/login?ok=1"
              className="mt-5 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Войти
            </Link>
          </>
        )}
        {state === "bad" && (
          <>
            <div className="text-4xl">⚠️</div>
            <h1 className="mt-3 text-xl font-extrabold text-white">Ссылка недействительна</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Ссылка устарела или уже использована. Запросите новое письмо при входе или
              зарегистрируйтесь заново.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
              >
                Ко входу
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm hover:bg-white/10"
              >
                Регистрация
              </Link>
            </div>
          </>
        )}
        {state === "missing" && (
          <>
            <h1 className="text-xl font-extrabold text-white">Нет токена</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Откройте ссылку из письма целиком, например /verify-email?token=...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
