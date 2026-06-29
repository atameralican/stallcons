import { headers } from "next/headers";
import {
    ContactRequestsAdminClient,
    type ContactRequestRecord,
} from "./contact-requests-admin-client";

type ContactRequestsResponse = {
    requests?: ContactRequestRecord[];
    error?: string;
};

export default async function ContactRequestsAdmin() {
    const { requests, error } = await getContactRequests();

    return (
        <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950 dark:bg-zinc-950 dark:text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Yönetim Paneli
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold">İletişim Talepleri</h1>
                    </div>

                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {requests.length} talep
                    </div>
                </header>

                {error ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                        İletişim talepleri alınırken hata oluştu: {error}
                    </div>
                ) : (
                    <ContactRequestsAdminClient initialRequests={requests} />
                )}
            </div>
        </main>
    );
}

async function getContactRequests() {
    const headerStore = await headers();
    const host = headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";
    const cookie = headerStore.get("cookie") ?? "";

    if (!host) {
        return {
            requests: [] as ContactRequestRecord[],
            error: "Host bilgisi alınamadı.",
        };
    }

    const response = await fetch(
        `${protocol}://${host}/api/admin/contact-requests`,
        {
            cache: "no-store",
            headers: {
                cookie,
            },
        }
    );

    const result = (await response.json()) as ContactRequestsResponse;

    return {
        requests: result.requests ?? [],
        error: response.ok
            ? undefined
            : result.error ?? "İletişim talepleri alınamadı.",
    };
}