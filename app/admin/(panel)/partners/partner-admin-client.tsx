"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Edit3, ImageIcon, Plus, Save, Trash2, X } from "lucide-react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, message as antMessage, Switch, Upload, type UploadProps } from "antd";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type PartnerRecord = {
    id: string;
    name: string;
    url: string;
    sort_order: number;
    is_published: boolean;
};

type PartnerFormState = {
    id?: string;
    name: string;
    url: string;
    sort_order: string;
    is_published: boolean;
};

type UploadResponse = {
    url?: string;
    error?: string;
};

type PartnerResponse = {
    partners?: PartnerRecord[];
    error?: string;
};

type PartnerMutationResponse = {
    id?: string;
    error?: string;
};

const EMPTY_FORM: PartnerFormState = {
    name: "",
    url: "",
    sort_order: "0",
    is_published: true,
};

export function PartnerAdminClient({ initialPartners }: { initialPartners: PartnerRecord[] }) {
    const supabase = useMemo(() => createClient(), []);
    const [messageApi, contextHolder] = antMessage.useMessage();
    const [partners, setPartners] = useState<PartnerRecord[]>(initialPartners);
    const [form, setForm] = useState<PartnerFormState>(EMPTY_FORM);
    const [isFormOpen, setIsFormOpen] = useState(initialPartners.length === 0);
    const [saving, setSaving] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function refreshPartners() {
        const response = await fetch("/api/admin/partners", { cache: "no-store" });
        const result = (await response.json()) as PartnerResponse;

        if (!response.ok) {
            setMessage({ type: "error", text: result.error ?? "İş ortakları alınamadı." });
            return;
        }

        setPartners(result.partners ?? []);
    }

    async function ensureAdmin() {
        const { data, error } = await supabase.auth.getClaims();

        if (error || !data?.claims) {
            setMessage({ type: "error", text: "Bu işlem için admin oturumu gerekli." });
            return false;
        }

        return true;
    }

    function startCreate() {
        setForm(EMPTY_FORM);
        setLogoUploading(false);
        setIsFormOpen(true);
        setMessage(null);
    }

    function startEdit(partner: PartnerRecord) {
        setForm({
            id: partner.id,
            name: partner.name,
            url: partner.url,
            sort_order: partner.sort_order.toString(),
            is_published: partner.is_published,
        });
        setLogoUploading(false);
        setIsFormOpen(true);
        setMessage(null);
    }

    function cancelForm() {
        setForm(EMPTY_FORM);
        setLogoUploading(false);
        setIsFormOpen(false);
        setMessage(null);
    }

    const beforeImageUpload: UploadProps<UploadResponse>["beforeUpload"] = (file) => {
        const isImage = file.type.startsWith("image/");
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
            messageApi.error("Sadece görsel dosyaları yüklenebilir.");
        }

        if (!isLt2M) {
            messageApi.error("Görsel 2 MB'dan küçük olmalı.");
        }

        return isImage && isLt2M ? true : Upload.LIST_IGNORE;
    };

    const uploadData = () => ({
        folder: getUploadFolder(form),
    });

    const handleLogoChange: UploadProps<UploadResponse>["onChange"] = (info) => {
        const { status, name, response } = info.file;

        if (status === "uploading") {
            setLogoUploading(true);
            return;
        }

        setLogoUploading(false);

        if (status === "done" && response?.url) {
            setForm((current) => ({ ...current, url: response.url ?? "" }));
            messageApi.success(`${name} başarıyla yüklendi.`);
        } else if (status === "error") {
            messageApi.error(response?.error ?? `${name} yüklenemedi.`);
        }
    };

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        if (!form.name || !form.url) {
            setSaving(false);
            setMessage({ type: "error", text: "İş ortağı adı ve logo görseli alanları zorunludur." });
            return;
        }

        const partnerPayload = {
            name: form.name.trim(),
            url: form.url.trim(),
            sort_order: form.sort_order ? Number(form.sort_order) : 0,
            is_published: form.is_published,
        };

        try {
            const isAdmin = await ensureAdmin();
            if (!isAdmin) return;

            const response = await fetch("/api/admin/partners", {
                method: form.id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: form.id,
                    partner: partnerPayload,
                }),
            });
            const result = (await response.json()) as PartnerMutationResponse;

            if (!response.ok) {
                throw new Error(result.error ?? "İş ortağı kaydedilemedi.");
            }

            await refreshPartners();
            setForm(EMPTY_FORM);
            setIsFormOpen(false);
            setMessage({
                type: "success",
                text: form.id ? "İş ortağı güncellendi." : "İş ortağı oluşturuldu.",
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "İşlem sırasında hata oluştu.",
            });
        } finally {
            setSaving(false);
        }
    }

    async function deletePartner(partner: PartnerRecord) {
        const name = partner.name;
        const confirmed = window.confirm(`${name} iş ortağını silmek istediğinize emin misiniz?`);

        if (!confirmed) return;

        setDeletingId(partner.id);
        setMessage(null);

        const isAdmin = await ensureAdmin();
        if (!isAdmin) {
            setDeletingId(null);
            return;
        }

        try {
            const response = await fetch("/api/admin/partners", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: partner.id }),
            });
            const result = (await response.json()) as PartnerMutationResponse;

            if (!response.ok) {
                setMessage({ type: "error", text: result.error ?? "İş ortağı silinemedi." });
                return;
            }

            setPartners((current) => current.filter((item) => item.id !== partner.id));
            setMessage({ type: "success", text: "İş ortağı silindi." });

            if (form.id === partner.id) {
                cancelForm();
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "İş ortağı silinemedi.",
            });
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {contextHolder}
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard label="Toplam" value={partners.length.toString()} />
            </section>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">İş Ortakları Listesi</h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Sıralama durumlarını buradan yönetin.
                        </p>
                    </div>
                    <Button type="primary" onClick={startCreate} icon={<Plus className="h-4 w-4" />}>
                        Yeni Partner
                    </Button>
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

                <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
                    {partners.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
                            <div className="rounded-full bg-zinc-100 p-4 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                                <ImageIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Henüz iş ortağı yok</h3>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    İlk iş ortağını ekleyerek public site verisini hazırlayabilirsiniz.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-200 dark:divide-white/10">
                            {partners.map((partner) => (
                                <PartnerRow
                                    key={partner.id}
                                    partner={partner}
                                    active={form.id === partner.id}
                                    deleting={deletingId === partner.id}
                                    onEdit={() => startEdit(partner)}
                                    onDelete={() => deletePartner(partner)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isFormOpen && (
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                >
                    <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {form.id ? "İş ortağı düzenleme" : "Yeni iş ortağı"}
                            </p>
                            <h2 className="mt-1 text-xl font-semibold">
                                {form.id ? "İş ortağı bilgilerini güncelle" : "İş ortağı oluştur"}
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <Button htmlType="button" onClick={cancelForm} icon={<X className="h-4 w-4" />}>
                                Vazgeç
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saving}
                                icon={!saving ? <Save className="h-4 w-4" /> : undefined}
                            >
                                {saving ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 pt-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-6">
                            <div className="space-y-4 rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                                <h3 className="font-semibold">Genel Bilgiler</h3>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">İş Ortağı Adı</label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                        placeholder="Örn. Google DeepMind"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-4 rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Logo Görseli</label>
                                <Upload<UploadResponse>
                                    name="file"
                                    action="/api/admin/upload"
                                    data={uploadData}
                                    accept="image/*"
                                    listType="picture-card"
                                    showUploadList={false}
                                    beforeUpload={beforeImageUpload}
                                    onChange={handleLogoChange}
                                >
                                    {form.url ? (
                                        <img
                                            draggable={false}
                                            src={form.url}
                                            alt=""
                                            className="h-full w-full rounded-lg object-contain p-2"
                                        />
                                    ) : (
                                        <Button
                                            type="text"
                                            htmlType="button"
                                            icon={logoUploading ? <LoadingOutlined /> : <PlusOutlined />}
                                            className="h-auto border-0 bg-transparent"
                                        >
                                            <div className="mt-2 font-medium text-xs">Yükle</div>
                                        </Button>
                                    )}
                                </Upload>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="sort_order" className="text-sm font-medium">Sıra</label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={form.sort_order}
                                    onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                                />
                            </div>

                            <div className="space-y-3 rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                                <SwitchRow
                                    label="Yayında"
                                    description="Public sitede görünür."
                                    checked={form.is_published}
                                    onChange={(value) => setForm((current) => ({ ...current, is_published: value }))}
                                />
                            </div>
                        </aside>
                    </div>
                </form>
            )}
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

function PartnerRow({
    partner,
    active,
    deleting,
    onEdit,
    onDelete,
}: {
    partner: PartnerRecord;
    active: boolean;
    deleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <article
            className={cn(
                "grid gap-4 p-4 transition md:grid-cols-[88px_1fr_auto] items-center",
                active && "bg-blue-50/70 dark:bg-blue-500/10"
            )}
        >
            <div className="h-16 w-24 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center p-2 border border-zinc-200 dark:border-white/10">
                {partner.url ? (
                    <img src={partner.url} alt={partner.name} className="max-h-full max-w-full object-contain" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{partner.name}</h3>
                    {partner.is_published ? (
                        <Badge tone="green">Yayında</Badge>
                    ) : (
                        <Badge tone="zinc">Taslak</Badge>
                    )}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Sıra: {partner.sort_order}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 md:justify-end">
                <Button
                    htmlType="button"
                    size="small"
                    onClick={onEdit}
                    icon={<Edit3 className="h-4 w-4" />}
                >
                    Düzenle
                </Button>
                <Button
                    htmlType="button"
                    size="small"
                    onClick={onDelete}
                    loading={deleting}
                    danger
                    icon={!deleting ? <Trash2 className="h-4 w-4" /> : undefined}
                >
                    {deleting ? "Siliniyor" : "Sil"}
                </Button>
            </div>
        </article>
    );
}

function SwitchRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
            </span>
            <Switch checked={checked} onChange={onChange} />
        </label>
    );
}

function Badge({
    children,
    tone,
}: {
    children: ReactNode;
    tone: "green" | "zinc";
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                tone === "green" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
                tone === "zinc" && "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            )}
        >
            {children}
        </span>
    );
}

function slugify(value: string) {
    return value
        .toLocaleLowerCase("tr")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getUploadFolder(form: PartnerFormState) {
    const folder = form.id ?? slugify(form.name);
    return folder ? `stallcons/partners/${folder}` : "stallcons/partners";
}
