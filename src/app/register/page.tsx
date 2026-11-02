import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="rounded-2xl border border-white/10 bg-panel p-6">
        <h1 className="text-xl font-extrabold text-white">Регистрация</h1>
        <p className="mt-1 text-sm text-zinc-500">
          После регистрации мы отправим на почту ссылку для подтверждения — без неё вход будет
          закрыт.
        </p>
        <div className="mt-4">
          <RegisterForm />
        </div>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-violet-300 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
