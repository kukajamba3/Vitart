import { LogoutButton } from "@/components/auth-forms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="rounded-2xl border border-white/10 bg-panel p-6">
        <h1 className="text-xl font-extrabold text-white">Профиль</h1>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Имя</dt>
            <dd className="text-zinc-100">{user.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">E-mail</dt>
            <dd className="text-zinc-100">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Почта</dt>
            <dd>
              {user.emailVerified ? (
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                  подтверждена
                </span>
              ) : (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                  не подтверждена
                </span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500"> Зарегистрирован</dt>
            <dd className="text-zinc-100">{user.createdAt.toLocaleDateString("ru-RU")}</dd>
          </div>
        </dl>
        <div className="mt-6 flex gap-3">
          <a
            href="/catalog"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Смотреть аниме
          </a>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
