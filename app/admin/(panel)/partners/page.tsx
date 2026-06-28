import { headers } from "next/headers";
import { PartnerAdminClient, type PartnerRecord } from "./partner-admin-client";

type PartnersResponse = {
    partners?: PartnerRecord[];
    error?: string;
};

export default async function PartnerAdmin() {
    // sayfa sadece ekranı hazırlıyor data api route üzerinden geliyor
    const { partners, error } = await getPartners();

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

async function getPartners() {
    const headerStore = await headers();
    const host = headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";
    // admin sayfasında cookie gidiyor api oturumu okuyabilsin
    const cookie = headerStore.get("cookie") ?? "";

    if (!host) {
        return { partners: [] as PartnerRecord[], error: "Host bilgisi alınamadı." };
    }

    const response = await fetch(`${protocol}://${host}/api/admin/partners`, {
        cache: "no-store",
        headers: {
            cookie,
        },
    });
    const result = (await response.json()) as PartnersResponse;

    return {
        partners: result.partners ?? [],
        error: response.ok ? undefined : result.error ?? "İş ortakları alınamadı.",
    };
}
