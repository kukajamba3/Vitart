import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const ok = String(searchParams.ok ?? "") === "1";
  const next = String(searchParams.next ?? "");
  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="rounded-2xl border border-white/10 bg-panel p-6">
        <h1 className="text-xl font-extrabold text-white">Вход</h1>
        {ok && (
          <p className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-sm text-emerald-200">
            Почта подтверждена! Теперь можно войти{next ? ` и перейти на ${next}` : ""}.
          </p>
        )}
        <div className="mt-4">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-violet-300 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
