import { getPartnersData } from "@/lib/data/content";
import { PartnerAdminClient } from "./partner-admin-client";

// ilk partner listesini sunucuda alıp client ekrana veriyorum
export default async function PartnerAdmin() {
    const { data: partners, error } = await getPartnersData();

    return (
        <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950 dark:bg-zinc-950 dark:text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Yönetim Paneli
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold">İş Ortakları</h1>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {partners.length} iş ortağı
                    </div>
                </header>

                {error ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                        İş ortakları alınırken hata oluştu: {error}
                    </div>
                ) : (
                    <PartnerAdminClient initialPartners={partners} />
                )}
            </div>
        </main>
    );
}
