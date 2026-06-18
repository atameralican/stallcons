import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations("Pages.notFound");

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
            <div className="rounded-full bg-blue-500/10 dark:bg-blue-500/20 p-4 text-blue-600 dark:text-blue-400 mb-6">
                <AlertCircle className="w-12 h-12 animate-pulse" />
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
                404
            </h1>
            
            <h2 className="mt-3 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                {t("heading")}
            </h2>
            
            <p className="mt-4 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                {t("description")}
            </p>
            
            <div className="mt-10">
                <Link
                    href="/"
                    className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 hover:scale-105 dark:bg-blue-500 dark:hover:bg-blue-400 dark:shadow-blue-900/30"
                >
                    {t("button")}
                </Link>
            </div>
        </div>
    );
}
