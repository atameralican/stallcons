import Link from "next/link";

export default function RootNotFound() {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center bg-zinc-200 px-4 text-center text-zinc-950 dark:bg-zinc-900 dark:text-white">
            <h1 className="text-5xl font-bold">404</h1>
            <p className="mt-4 max-w-md text-sm text-zinc-600 dark:text-zinc-300">
                Aradiginiz sayfa bulunamadi.
            </p>
            <Link
                href="/tr"
                className="mt-8 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
                Ana sayfaya don
            </Link>
        </main>
    );
}
