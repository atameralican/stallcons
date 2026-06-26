"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setErrorMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setErrorMessage("E-posta veya şifre hatalı.");
            return;
        }

        router.replace("/admin/projects");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-200">
                    E-posta
                </label>

                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="admin@stallcons.com"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/70 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-200">
                    Şifre
                </label>

                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/70 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10"
                />
            </div>

            {errorMessage && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
                <span className="relative z-10">
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </span>

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition group-hover:translate-x-full" />
            </button>

            <p className="text-center text-xs leading-5 text-zinc-500">
                Bu alan yalnızca yetkili kullanıcılar içindir.
            </p>
        </form>
    );
}
