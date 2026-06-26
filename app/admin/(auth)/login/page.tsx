import LoginForm from "./login-form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LinkedInLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (!error && data?.claims) {
        redirect("/admin/projects");
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[110px]" />
                <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-zinc-500/10 blur-[100px]" />
            </div>

            {/* Grid pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

            <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
                    {/* Left side */}
                    <div className="hidden flex-col justify-between border-r border-white/10 bg-white/[0.03] p-10 lg:flex">
                        <div>
                            <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                                Stallcons Yönetim Paneli
                            </div>

                            <h1 className="max-w-md text-4xl font-semibold tracking-tight text-white">
                                Projeleri, ürünleri ve içerikleri tek panelden yönetin.
                            </h1>

                            <p className="mt-5 max-w-md text-sm leading-6 text-zinc-400">
                                Güvenli giriş yaptıktan sonra web sitesindeki içerikleri
                                kolayca ekleyebilir, düzenleyebilir ve yayına alabilirsiniz.
                            </p>
                        </div>

                        <div className="grid gap-3 text-sm text-zinc-400">
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                                <div className="text-sm text-zinc-300">
                                    <span className="text-xs text-zinc-500 block">Developer</span>
                                    <span className="font-medium text-white">Alican ATAMER</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="https://www.linkedin.com/in/alican-atamer/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="LinkedIn"
                                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                                    >
                                        <LinkedInLogoIcon className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="https://github.com/atameralican"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="GitHub"
                                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                                    >
                                        <GitHubLogoIcon className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login card */}
                    <div className="flex items-center justify-center p-6 sm:p-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8 text-center lg:text-left">
                                <h2 className="text-2xl font-semibold tracking-tight text-white">
                                    Admin Girişi
                                </h2>

                                <p className="mt-2 text-sm text-zinc-400">
                                    Yönetim paneline devam etmek için giriş yapın.
                                </p>
                            </div>

                            <LoginForm />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
