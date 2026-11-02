"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-violet-500";
const btnCls =
  "w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Ошибка регистрации");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("Сервер недоступен, попробуйте позже");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-200">
        <p className="font-semibold">Письмо отправлено!</p>
        <p className="mt-1">
          Мы отправили ссылку для подтверждения на <b>{email}</b>. Перейдите по ней, чтобы
          активировать аккаунт (ссылка действует 24 часа). Проверьте папку «Спам», если письма
          нет.
        </p>
        <p className="mt-3">
          <Link href="/login" className="text-violet-300 hover:underline">
            Перейти ко входу →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Имя (необязательно)"
        className={inputCls}
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail"
        className={inputCls}
      />
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль (минимум 6 символов)"
        className={inputCls}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={state === "sending"} className={btnCls}>
        {state === "sending" ? "Отправляем..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setSending(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Ошибка входа");
        if (d.code === "unverified") setUnverified(true);
        setSending(false);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Сервер недоступен, попробуйте позже");
      setSending(false);
    }
  }

  async function resend() {
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail"
        className={inputCls}
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        className={inputCls}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {unverified && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Почта не подтверждена.{" "}
          <button type="button" onClick={resend} className="font-semibold underline">
            Отправить письмо повторно
          </button>
          {resent && <span className="block text-xs">Письмо отправлено, проверьте почту.</span>}
        </div>
      )}
      <button type="submit" disabled={sending} className={btnCls}>
        {sending ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
    >
      Выйти
    </button>
  );
}
