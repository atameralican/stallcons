"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Edit3, ImageIcon, Plus, Save, Star, Trash2, X } from "lucide-react";
import { InboxOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, message as antMessage, Switch, Upload, type UploadFile, type UploadProps } from "antd";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const { TextArea } = Input;

type Locale = "tr" | "en";

export type HizmetTranslation = {
    id: string;
    locale: Locale;
    title: string;
    description: string | null;
};

export type HizmetPhoto = {
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
    created_at: string;
};

export type HizmetRecord = {
    id: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    hizmet_translations: HizmetTranslation[];
    hizmet_photos: HizmetPhoto[];
};

type HizmetFormState = {
    id?: string;
    // slug: string;
    // main_photo: string;
    // year: string;
    // weight_tons: string;
    // sort_order: string;
    // is_favorite: boolean;
    is_published: boolean;
    translations: Record<Locale, { title: string; description: string }>;
    photos: Array<{ url: string; alt: string; sort_order: number }>;
};

type UploadResponse = {
    url?: string;
    error?: string;
};

type ImageUploadFile = UploadFile<UploadResponse>;

type HizmetResponse = {
    hizmetler?: HizmetRecord[];
    error?: string;
};

type HizmetMutationResponse = {
    id?: string;
    error?: string;
};

const EMPTY_FORM: HizmetFormState = {
    is_published: false,
    translations: {
        tr: { title: "", description: "" },
        en: { title: "", description: "" },
    },
    photos: [],
};

export function HizmetAdminClient({ initialHizmetler }: { initialHizmetler: HizmetRecord[] }) {
    const supabase = useMemo(() => createClient(), []);
    const [messageApi, contextHolder] = antMessage.useMessage();
    const [hizmetler, setHizmetler] = useState<HizmetRecord[]>(initialHizmetler);
    const [form, setForm] = useState<HizmetFormState>(EMPTY_FORM);
    const [isFormOpen, setIsFormOpen] = useState(initialHizmetler.length === 0);
    const [saving, setSaving] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [galleryFileList, setGalleryFileList] = useState<ImageUploadFile[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const publishedCount = hizmetler.filter((hizmet) => hizmet.is_published).length;

    async function refreshHizmetler() {

        const response = await fetch("/api/admin/hizmetler", { cache: "no-store" });
        console.log(response)
        const result = (await response.json()) as HizmetResponse;

        if (!response.ok) {
            setMessage({ type: "error", text: result.error ?? "Hizmetler alınamadı." });
            return;
        }
        setHizmetler(result.hizmetler ?? []);
    }

    async function ensureAdmin() {
        // asıl kontrol api route'ta burada erken uyarı veriyorum
        const { data, error } = await supabase.auth.getClaims();

        if (error || !data?.claims) {
            setMessage({ type: "error", text: "Bu işlem için admin oturumu gerekli." });
            return false;
        }

        return true;
    }

    function startCreate() {
        setForm(EMPTY_FORM);
        setGalleryFileList([]);
        setIsFormOpen(true);
        setMessage(null);
    }

    function startEdit(hizmet: HizmetRecord) {
        const tr = hizmet.hizmet_translations.find((item) => item.locale === "tr");
        const en = hizmet.hizmet_translations.find((item) => item.locale === "en");

        // ant upload kendi formatını istediği için urlleri dönüştürüyorum
        const photos = hizmet.hizmet_photos.map((photo) => ({
            url: photo.url,
            alt: photo.alt ?? "",
            sort_order: photo.sort_order,
        }));

        setForm({
            id: hizmet.id,
            is_published: hizmet.is_published,
            translations: {
                tr: {
                    title: tr?.title ?? "",
                    description: tr?.description ?? "",
                },
                en: {
                    title: en?.title ?? "",
                    description: en?.description ?? "",
                },
            },
            photos,
        });
        setGalleryFileList(toUploadFileList(photos.map((photo) => photo.url)));
        setCoverUploading(false);
        setIsFormOpen(true);
        setMessage(null);
    }

    function cancelForm() {
        setForm(EMPTY_FORM);
        setGalleryFileList([]);
        setCoverUploading(false);
        setIsFormOpen(false);
        setMessage(null);
    }

    function updateTranslation(locale: Locale, key: "title" | "description", value: string) {
        setForm((current) => ({
            ...current,
            translations: {
                ...current.translations,
                [locale]: {
                    ...current.translations[locale],
                    [key]: value,
                },
            },
        }));
    }

    function updateGalleryPhotos(urls: string[]) {
        setForm((current) => ({
            ...current,
            // alt metni kullanıcı girmiyor kayıtta başlıktan veriyorum
            photos: urls.map((url, index) => ({
                url,
                alt: "",
                sort_order: index,
            })),
        }));
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
        // cloudinary klasörü burada belirleniyor
        folder: getUploadFolder(form),
    });

    const handleGalleryChange: UploadProps<UploadResponse>["onChange"] = (info) => {
        const nextFileList = info.fileList.slice(-24);
        const { status, name, response } = info.file;

        setGalleryFileList(nextFileList);
        updateGalleryPhotos(getUploadedUrls(nextFileList));

        if (status === "done") {
            messageApi.success(`${name} yüklendi.`);
        } else if (status === "error") {
            messageApi.error(response?.error ?? `${name} yüklenemedi.`);
        }
    };



    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        const trTitle = form.translations.tr.title.trim();
        const enTitle = form.translations.en.title.trim();
        // galeri alt alanı yok en varsa onu yoksa tr başlığı kullanıyorum
        const photoAlt = enTitle || trTitle;
        const photos = form.photos
            .map((photo, index) => ({
                url: photo.url.trim(),
                alt: photoAlt || null,
                sort_order: index,
            }))
            .filter((photo) => photo.url.length > 0);

        if (!trTitle || !enTitle) {
            setSaving(false);
            setMessage({ type: "error", text: "TR ve EN başlık alanları zorunludur." });
            return;
        }

        const hizmetPayload = {
            is_published: form.is_published,
        };

        try {
            const isAdmin = await ensureAdmin();

            if (!isAdmin) return;

            // db yazma işi clientta değil hizmetler api route'a gidiyor
            const response = await fetch("/api/admin/hizmetler", {
                method: form.id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: form.id,
                    hizmet: hizmetPayload,
                    translations: (["tr", "en"] as Locale[]).map((locale) => ({
                        locale,
                        title: form.translations[locale].title.trim(),
                        description: form.translations[locale].description.trim() || null,
                    })),
                    photos,
                }),
            });
            const result = (await response.json()) as HizmetMutationResponse;

            if (!response.ok) {
                throw new Error(result.error ?? "Hizmet kaydedilemedi.");
            }

            await refreshHizmetler();
            setForm(EMPTY_FORM);
            setIsFormOpen(false);
            setMessage({
                type: "success",
                text: form.id ? "Hizmet güncellendi." : "Hizmet oluşturuldu.",
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

    async function deleteHizmet(hizmet: HizmetRecord) {
        const title = getHizmetTitle(hizmet);
        const confirmed = window.confirm(`${title} hizmetini silmek istediğine emin misin?`);

        if (!confirmed) return;

        setDeletingId(hizmet.id);
        setMessage(null);

        const isAdmin = await ensureAdmin();

        if (!isAdmin) {
            setDeletingId(null);
            return;
        }

        try {
            // silme de direkt supabase'e değil api route'a gidiyor
            const response = await fetch("/api/admin/hizmetler", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: hizmet.id }),
            });
            const result = (await response.json()) as HizmetMutationResponse;

            if (!response.ok) {
                setMessage({ type: "error", text: result.error ?? "Hizmet silinemedi." });
                return;
            }

            setHizmetler((current) => current.filter((item) => item.id !== hizmet.id));
            setMessage({ type: "success", text: "Hizmet silindi." });

            if (form.id === hizmet.id) {
                cancelForm();
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Hizmet silinemedi.",
            });
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {contextHolder}
            <section className="grid gap-4 md:grid-cols-2">
                <StatCard label="Toplam" value={hizmetler.length.toString()} />
                <StatCard label="Yayında" value={publishedCount.toString()} />
            </section>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Hizmet Listesi</h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Yayın, favori ve sıralama durumlarını buradan yönetin.
                        </p>
                    </div>
                    <Button type="primary" onClick={startCreate} icon={<Plus className="h-4 w-4" />}>
                        Yeni Hizmet
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
                    {hizmetler.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
                            <div className="rounded-full bg-zinc-100 p-4 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                                <ImageIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Henüz hizmet yok</h3>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    İlk hizmeti ekleyerek public site verisini hazırlayabilirsiniz.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-200 dark:divide-white/10">
                            {hizmetler.map((hizmet) => (
                                <HizmetRow
                                    key={hizmet.id}
                                    hizmet={hizmet}
                                    active={form.id === hizmet.id}
                                    deleting={deletingId === hizmet.id}
                                    onEdit={() => startEdit(hizmet)}
                                    onDelete={() => deleteHizmet(hizmet)}
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
                                {form.id ? "Hizmet düzenleme" : "Yeni hizmet"}
                            </p>
                            <h2 className="mt-1 text-xl font-semibold">
                                {form.id ? "Hizmet bilgilerini güncelle" : "Hizmet oluştur"}
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
                            <div className="grid gap-4 md:grid-cols-2">
                                <LocalizedFields
                                    locale="tr"
                                    title="Türkçe"
                                    value={form.translations.tr}
                                    onChange={updateTranslation}
                                />
                                <LocalizedFields
                                    locale="en"
                                    title="English"
                                    value={form.translations.en}
                                    onChange={updateTranslation}
                                />
                            </div>

                            <div className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                                <div className="mb-4">
                                    <div>
                                        <h3 className="font-semibold">Galeri Fotoğrafları</h3>
                                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                            Birden fazla görsel seçebilir veya dosyaları alana bırakabilirsiniz.
                                        </p>
                                    </div>
                                </div>

                                <Upload.Dragger<UploadResponse>
                                    name="file"
                                    multiple
                                    action="/api/admin/upload"
                                    data={uploadData}
                                    accept="image/*"
                                    fileList={galleryFileList}
                                    beforeUpload={beforeImageUpload}
                                    onChange={handleGalleryChange}
                                    onRemove={(file) => {
                                        const nextFileList = galleryFileList.filter((item) => item.uid !== file.uid);
                                        setGalleryFileList(nextFileList);
                                        updateGalleryPhotos(getUploadedUrls(nextFileList));
                                        return true;
                                    }}
                                    listType="picture"
                                    maxCount={24}
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">
                                        Galeri fotoğraflarını seçin veya buraya sürükleyin
                                    </p>
                                    <p className="ant-upload-hint">
                                        Çoklu yükleme desteklenir. Sadece görsel dosyaları, maksimum 2 MB.
                                    </p>
                                </Upload.Dragger>
                            </div>
                        </div>

                        <aside className="space-y-4 rounded-2xl border border-zinc-200 p-4 dark:border-white/10">


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

function HizmetRow({
    hizmet,
    active,
    deleting,
    onEdit,
    onDelete,
}: {
    hizmet: HizmetRecord;
    active: boolean;
    deleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const title = getHizmetTitle(hizmet);
    const photo = hizmet.hizmet_photos[0]?.url;

    return (
        <article
            className={cn(
                "grid gap-4 p-4 transition md:grid-cols-[88px_1fr_auto]",
                active && "bg-blue-50/70 dark:bg-blue-500/10"
            )}
        >
            <div className="h-24 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-white/10 md:h-20">
                {photo ? (
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{title}</h3>
                    {hizmet.is_published ? (
                        <Badge tone="green">Yayında</Badge>
                    ) : (
                        <Badge tone="zinc">Taslak</Badge>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Fotoğraf: {hizmet.hizmet_photos.length}</span>
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

function LocalizedFields({
    locale,
    title,
    value,
    onChange,
}: {
    locale: Locale;
    title: string;
    value: { title: string; description: string };
    onChange: (locale: Locale, key: "title" | "description", value: string) => void;
}) {
    return (
        <section className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
            <h3 className="mb-4 font-semibold">{title}</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor={`${locale}-title`} className="text-sm font-medium">Başlık</label>
                    <Input
                        id={`${locale}-title`}
                        value={value.title}
                        onChange={(event) => onChange(locale, "title", event.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor={`${locale}-description`} className="text-sm font-medium">Açıklama</label>
                    <TextArea
                        id={`${locale}-description`}
                        value={value.description}
                        onChange={(event) => onChange(locale, "description", event.target.value)}
                        className="min-h-40"
                    />
                </div>
            </div>
        </section>
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
    tone: "green" | "amber" | "zinc";
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                tone === "green" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
                tone === "amber" && "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
                tone === "zinc" && "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            )}
        >
            {children}
        </span>
    );
}

function getHizmetTitle(hizmet: HizmetRecord) {
    return (
        hizmet.hizmet_translations.find((item) => item.locale === "tr")?.title ||
        hizmet.hizmet_translations.find((item) => item.locale === "en")?.title ||
        ""
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

function getUploadFolder(form: HizmetFormState) {
    const folder = form.id ?? slugify(form.translations.tr.title || form.translations.en.title);

    return folder ? `stallcons/hizmetler/${folder}` : "stallcons/hizmetler";
}

function toUploadFileList(urls: string[]): ImageUploadFile[] {
    return urls
        .filter(Boolean)
        .map((url, index) => ({
            uid: url,
            name: getFileNameFromUrl(url) || `hizmet-photo-${index + 1}`,
            status: "done",
            url,
            response: { url },
        }));
}

function getUploadedUrls(fileList: ImageUploadFile[]) {
    return fileList
        .map((file) => file.response?.url ?? file.url)
        .filter((url): url is string => Boolean(url));
}

function getFileNameFromUrl(url: string) {
    try {
        return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
    } catch {
        return url.split("/").pop() ?? "";
    }
}
