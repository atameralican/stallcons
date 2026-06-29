"use client";

import { ReactNode, useMemo, useState } from "react";
import {
    Archive,
    Clock3,
    Mail,
    MessageSquare,
    Phone,
    RefreshCw,
    Search,
    ShieldAlert,
    Trash2,
    User,
} from "lucide-react";
import { Button, Input, Popconfirm, Select, message as antMessage } from "antd";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const { TextArea } = Input;

export type ContactStatus =
    | "new"
    | "reviewing"
    | "contacted"
    | "offer_sent"
    | "won"
    | "lost"
    | "spam"
    | "archived";

export type ContactRequestRecord = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    locale: "tr" | "en";
    source_page: string | null;
    user_agent: string | null;
    ip_address: string | null;
    status: ContactStatus;
    turnstile_verified: boolean;
    request_hash: string | null;
    spam_reason: string | null;
    admin_note: string | null;
    admin_email_sent_at: string | null;
    customer_email_sent_at: string | null;
    last_email_error: string | null;
    created_at: string;
    updated_at: string;
};

type ContactRequestsResponse = {
    requests?: ContactRequestRecord[];
    error?: string;
};

type ContactRequestMutationResponse = {
    request?: ContactRequestRecord;
    id?: string;
    error?: string;
};

const STATUS_OPTIONS: Array<{ value: ContactStatus; label: string }> = [
    { value: "new", label: "Yeni" },
    { value: "reviewing", label: "İnceleniyor" },
    { value: "contacted", label: "İletişime Geçildi" },
    { value: "offer_sent", label: "Teklif Gönderildi" },
    { value: "won", label: "Kazanıldı" },
    { value: "lost", label: "Kaybedildi" },
    { value: "spam", label: "Spam" },
    { value: "archived", label: "Arşiv" },
];

export function ContactRequestsAdminClient({
    initialRequests,
}: {
    initialRequests: ContactRequestRecord[];
}) {
    const supabase = useMemo(() => createClient(), []);
    const [messageApi, contextHolder] = antMessage.useMessage();

    const [requests, setRequests] =
        useState<ContactRequestRecord[]>(initialRequests);
    const [selectedId, setSelectedId] = useState<string | null>(
        initialRequests[0]?.id ?? null
    );
    const [noteDraft, setNoteDraft] = useState(
        initialRequests[0]?.admin_note ?? ""
    );
    const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
    const [searchText, setSearchText] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const selectedRequest = requests.find((item) => item.id === selectedId) ?? null;

    const totalCount = requests.length;
    const newCount = requests.filter((item) => item.status === "new").length;
    const reviewingCount = requests.filter(
        (item) => item.status === "reviewing"
    ).length;
    const spamCount = requests.filter((item) => item.status === "spam").length;

    const filteredRequests = useMemo(() => {
        const normalizedSearch = searchText.trim().toLocaleLowerCase("tr");

        return requests.filter((request) => {
            const statusMatches =
                statusFilter === "all" || request.status === statusFilter;

            if (!statusMatches) return false;

            if (!normalizedSearch) return true;

            const searchableText = [
                request.first_name,
                request.last_name,
                request.email,
                request.phone,
                request.subject,
                request.message,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("tr");

            return searchableText.includes(normalizedSearch);
        });
    }, [requests, searchText, statusFilter]);

    async function refreshRequests() {
        setRefreshing(true);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/contact-requests", {
                cache: "no-store",
            });
            const result = (await response.json()) as ContactRequestsResponse;

            if (!response.ok) {
                throw new Error(result.error ?? "İletişim talepleri alınamadı.");
            }

            const nextRequests = result.requests ?? [];

            setRequests(nextRequests);

            if (!selectedId && nextRequests[0]) {
                setSelectedId(nextRequests[0].id);
                setNoteDraft(nextRequests[0].admin_note ?? "");
            }

            messageApi.success("Talepler güncellendi.");
        } catch (error) {
            setMessage({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "İletişim talepleri alınamadı.",
            });
        } finally {
            setRefreshing(false);
        }
    }

    async function ensureAdmin() {
        const { data, error } = await supabase.auth.getClaims();

        if (error || !data?.claims) {
            setMessage({
                type: "error",
                text: "Bu işlem için admin oturumu gerekli.",
            });
            return false;
        }

        return true;
    }

    function selectRequest(request: ContactRequestRecord) {
        setSelectedId(request.id);
        setNoteDraft(request.admin_note ?? "");
        setMessage(null);
    }

    async function updateRequest(
        request: ContactRequestRecord,
        payload: {
            status?: ContactStatus;
            admin_note?: string | null;
        }
    ) {
        const isAdmin = await ensureAdmin();

        if (!isAdmin) return;

        setSavingId(request.id);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/contact-requests", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: request.id,
                    status: payload.status ?? request.status,
                    admin_note:
                        typeof payload.admin_note === "undefined"
                            ? request.admin_note
                            : payload.admin_note,
                }),
            });

            const result = (await response.json()) as ContactRequestMutationResponse;

            if (!response.ok || !result.request) {
                throw new Error(result.error ?? "Talep güncellenemedi.");
            }

            setRequests((current) =>
                current.map((item) =>
                    item.id === result.request!.id ? result.request! : item
                )
            );

            setNoteDraft(result.request.admin_note ?? "");
            setMessage({ type: "success", text: "Talep güncellendi." });
        } catch (error) {
            setMessage({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "İşlem sırasında hata oluştu.",
            });
        } finally {
            setSavingId(null);
        }
    }

    async function deleteRequest(request: ContactRequestRecord) {
        const isAdmin = await ensureAdmin();

        if (!isAdmin) return;

        setDeletingId(request.id);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/contact-requests", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: request.id }),
            });

            const result = (await response.json()) as ContactRequestMutationResponse;

            if (!response.ok) {
                throw new Error(result.error ?? "Talep silinemedi.");
            }

            setRequests((current) => current.filter((item) => item.id !== request.id));

            if (selectedId === request.id) {
                const nextRequest = requests.find((item) => item.id !== request.id);
                setSelectedId(nextRequest?.id ?? null);
                setNoteDraft(nextRequest?.admin_note ?? "");
            }

            setMessage({ type: "success", text: "Talep silindi." });
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Talep silinemedi.",
            });
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {contextHolder}

            <section className="grid gap-4 md:grid-cols-4">
                <StatCard label="Toplam" value={totalCount.toString()} />
                <StatCard label="Yeni" value={newCount.toString()} />
                <StatCard label="İnceleniyor" value={reviewingCount.toString()} />
                <StatCard label="Spam" value={spamCount.toString()} />
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Talep Listesi</h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Formdan gelen fiyat teklifi ve iletişim taleplerini buradan
                            yönetin.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            allowClear
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Ad, mail, telefon, konu ara"
                            prefix={<Search className="h-4 w-4 text-zinc-400" />}
                            className="min-w-64"
                        />

                        <Select<ContactStatus | "all">
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="min-w-44"
                            options={[
                                { value: "all", label: "Tüm durumlar" },
                                ...STATUS_OPTIONS,
                            ]}
                        />

                        <Button
                            htmlType="button"
                            onClick={refreshRequests}
                            loading={refreshing}
                            icon={!refreshing ? <RefreshCw className="h-4 w-4" /> : undefined}
                        >
                            Yenile
                        </Button>
                    </div>
                </div>

                {message && (
                    <div
                        className={cn(
                            "mt-4 rounded-2xl border px-4 py-3 text-sm",
                            message.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
                        )}
                    >
                        {message.text}
                    </div>
                )}

                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_390px]">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
                        {filteredRequests.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
                                <div className="rounded-full bg-zinc-100 p-4 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                                    <MessageSquare className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Talep bulunamadı</h3>
                                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                        Filtreleri temizleyerek tekrar deneyebilirsiniz.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-200 dark:divide-white/10">
                                {filteredRequests.map((request) => (
                                    <ContactRequestRow
                                        key={request.id}
                                        request={request}
                                        active={selectedId === request.id}
                                        onSelect={() => selectRequest(request)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                        {!selectedRequest ? (
                            <div className="flex min-h-72 flex-col items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">
                                <MessageSquare className="mb-3 h-8 w-8" />
                                Detay görüntülemek için bir talep seçin.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-white/10">
                                    <div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Talep detayı
                                        </p>
                                        <h3 className="mt-1 text-lg font-semibold">
                                            {selectedRequest.subject}
                                        </h3>
                                    </div>

                                    <StatusBadge status={selectedRequest.status} />
                                </div>

                                <DetailItem
                                    icon={<User className="h-4 w-4" />}
                                    label="Ad Soyad"
                                    value={`${selectedRequest.first_name} ${selectedRequest.last_name}`}
                                />

                                <DetailItem
                                    icon={<Mail className="h-4 w-4" />}
                                    label="E-posta"
                                    value={
                                        <a
                                            href={`mailto:${selectedRequest.email}`}
                                            className="text-blue-600 hover:underline dark:text-blue-300"
                                        >
                                            {selectedRequest.email}
                                        </a>
                                    }
                                />

                                <DetailItem
                                    icon={<Phone className="h-4 w-4" />}
                                    label="Telefon"
                                    value={
                                        selectedRequest.phone ? (
                                            <a
                                                href={`tel:${selectedRequest.phone}`}
                                                className="text-blue-600 hover:underline dark:text-blue-300"
                                            >
                                                {selectedRequest.phone}
                                            </a>
                                        ) : (
                                            "-"
                                        )
                                    }
                                />

                                <DetailItem
                                    icon={<Clock3 className="h-4 w-4" />}
                                    label="Tarih"
                                    value={formatDate(selectedRequest.created_at)}
                                />

                                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                                    <p className="mb-2 text-sm font-medium">Mesaj</p>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                                        {selectedRequest.message}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Durum</label>
                                    <Select<ContactStatus>
                                        value={selectedRequest.status}
                                        onChange={(status) =>
                                            updateRequest(selectedRequest, { status })
                                        }
                                        disabled={savingId === selectedRequest.id}
                                        className="w-full"
                                        options={STATUS_OPTIONS}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="admin_note" className="text-sm font-medium">
                                        Admin Notu
                                    </label>
                                    <TextArea
                                        id="admin_note"
                                        value={noteDraft}
                                        onChange={(event) => setNoteDraft(event.target.value)}
                                        className="min-h-28"
                                        placeholder="Bu talep ile ilgili iç not ekleyin..."
                                    />
                                    <Button
                                        type="primary"
                                        htmlType="button"
                                        className="mt-2"
                                        loading={savingId === selectedRequest.id}
                                        onClick={() =>
                                            updateRequest(selectedRequest, {
                                                admin_note: noteDraft.trim() || null,
                                            })
                                        }
                                    >
                                        Notu Kaydet
                                    </Button>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Button
                                        htmlType="button"
                                        icon={<ShieldAlert className="h-4 w-4" />}
                                        onClick={() =>
                                            updateRequest(selectedRequest, { status: "spam" })
                                        }
                                        disabled={savingId === selectedRequest.id}
                                    >
                                        Spam Yap
                                    </Button>

                                    <Button
                                        htmlType="button"
                                        icon={<Archive className="h-4 w-4" />}
                                        onClick={() =>
                                            updateRequest(selectedRequest, { status: "archived" })
                                        }
                                        disabled={savingId === selectedRequest.id}
                                    >
                                        Arşivle
                                    </Button>
                                </div>

                                <div className="rounded-2xl border border-zinc-200 p-3 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                                    <p>Locale: {selectedRequest.locale}</p>
                                    <p>IP: {selectedRequest.ip_address ?? "-"}</p>
                                    <p>Sayfa: {selectedRequest.source_page ?? "-"}</p>
                                    <p>
                                        Turnstile:{" "}
                                        {selectedRequest.turnstile_verified ? "Doğrulandı" : "-"}
                                    </p>
                                    <p>
                                        Firmaya mail:{" "}
                                        {selectedRequest.admin_email_sent_at
                                            ? formatDate(selectedRequest.admin_email_sent_at)
                                            : "-"}
                                    </p>
                                    <p>
                                        Müşteriye mail:{" "}
                                        {selectedRequest.customer_email_sent_at
                                            ? formatDate(selectedRequest.customer_email_sent_at)
                                            : "-"}
                                    </p>
                                    {selectedRequest.last_email_error && (
                                        <p className="mt-2 text-red-500">
                                            Mail hatası: {selectedRequest.last_email_error}
                                        </p>
                                    )}
                                </div>

                                <Popconfirm
                                    title="Talebi sil"
                                    description="Bu talebi silmek istediğine emin misin?"
                                    okText="Sil"
                                    cancelText="Vazgeç"
                                    okButtonProps={{ danger: true }}
                                    onConfirm={() => deleteRequest(selectedRequest)}
                                >
                                    <Button
                                        danger
                                        block
                                        htmlType="button"
                                        loading={deletingId === selectedRequest.id}
                                        icon={
                                            deletingId !== selectedRequest.id ? (
                                                <Trash2 className="h-4 w-4" />
                                            ) : undefined
                                        }
                                    >
                                        Talebi Sil
                                    </Button>
                                </Popconfirm>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
    );
}

function ContactRequestRow({
    request,
    active,
    onSelect,
}: {
    request: ContactRequestRecord;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "grid w-full gap-3 p-4 text-left transition hover:bg-zinc-50 dark:hover:bg-white/5 md:grid-cols-[1fr_auto]",
                active && "bg-blue-50/70 dark:bg-blue-500/10"
            )}
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">
                        {request.first_name} {request.last_name}
                    </h3>
                    <StatusBadge status={request.status} />
                </div>

                <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-300">
                    {request.subject}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{request.email}</span>
                    <span>{request.phone ?? "-"}</span>
                    <span>{formatDate(request.created_at)}</span>
                </div>
            </div>

            <div className="flex items-center md:justify-end">
                <MessageSquare className="h-5 w-5 text-zinc-400" />
            </div>
        </button>
    );
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                {icon}
            </span>
            <span className="min-w-0">
                <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {label}
                </span>
                <span className="mt-0.5 block break-words text-sm">{value}</span>
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: ContactStatus }) {
    const tone = getStatusTone(status);

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                tone === "blue" &&
                "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
                tone === "amber" &&
                "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
                tone === "green" &&
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
                tone === "red" &&
                "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
                tone === "zinc" &&
                "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            )}
        >
            {getStatusLabel(status)}
        </span>
    );
}

function getStatusLabel(status: ContactStatus) {
    return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

function getStatusTone(status: ContactStatus) {
    switch (status) {
        case "new":
            return "blue";
        case "reviewing":
        case "contacted":
        case "offer_sent":
            return "amber";
        case "won":
            return "green";
        case "lost":
        case "spam":
            return "red";
        case "archived":
        default:
            return "zinc";
    }
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}