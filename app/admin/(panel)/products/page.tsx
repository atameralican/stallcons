import { Hammer } from "lucide-react";

export default function ProductsAdminPlaceholder() {
    return (
        <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950 dark:bg-zinc-950 dark:text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Yönetim Paneli
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold">Ürünler</h1>
                    </div>
                </header>

                <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white p-16 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04] min-h-[50vh]">
                    <div className="rounded-full bg-blue-500/10 p-4 text-blue-600 dark:text-blue-400 mb-6">
                        <Hammer className="w-10 h-10 animate-bounce" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Yapım Aşamasında</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                        Ürün ekleme, düzenleme ve silme modülü geliştirme aşamasındadır. Çok yakında aktif edilecektir.
                    </p>
                </div>
            </div>
        </main>
    );
}
