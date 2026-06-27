import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AdminNotFound() {
    return (
        <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950 dark:bg-zinc-950 dark:text-white flex items-center justify-center">
            <div className="w-full max-w-2xl text-center">
                <div className="inline-flex rounded-full bg-red-500/10 p-4 text-red-500 dark:text-red-400 mb-6">
                    <AlertTriangle className="w-12 h-12 animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
                    404 - Sayfa Bulunamadı
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
                    Yönetim panelinde geçersiz veya var olmayan bir adrese ulaştınız. Lütfen soldaki menüyü kullanarak geçerli bir sayfaya gidin.
                </p>
                <Link
                    href="/admin"
                    className="inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
                >
                    Yönetim Paneline Dön
                </Link>
            </div>
        </main>
    );
}
