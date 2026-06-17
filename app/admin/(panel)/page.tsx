import LogoutButton from "./logout-button";

export default function AdminPage() {
    return (
        <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950 dark:bg-zinc-950 dark:text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Yönetim Paneli
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold">Hoş geldiniz</h1>
                    </div>

                    <LogoutButton />
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Projeler
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold">0</h2>
                        <p className="mt-3 text-sm text-zinc-500">
                            Henüz proje bağlantısı kurulmadı.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Ürünler
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold">0</h2>
                        <p className="mt-3 text-sm text-zinc-500">
                            Ürün yönetimi daha sonra eklenecek.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Durum
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-emerald-500">
                            Aktif
                        </h2>
                        <p className="mt-3 text-sm text-zinc-500">
                            Oturum başarıyla doğrulandı.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}