"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import Image from "next/image";
import { Edit3, ImageIcon, Plus, Save, Trash2, X } from "lucide-react";
import InboxOutlined from "@ant-design/icons/InboxOutlined";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Button from "antd/es/button";
import Input from "antd/es/input";
import antMessage from "antd/es/message";
import Switch from "antd/es/switch";
import Upload, { type UploadFile, type UploadProps } from "antd/es/upload";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const { TextArea } = Input;

type Locale = "tr" | "en";

export type ActivityAreaTranslation = {
    id: string;
    locale: Locale | "es";
    title: string;
    subtitle: string | null;
    description: string | null;
    slug: string;
    created_at: string;
};

export type ActivityAreaPhoto = {
    id: string;
    photo_url: string;
    sort_order: number;
    created_at: string;
};

export type ActivityAreaRecord = {
    id: string;
    main_photo: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    activity_area_translations: ActivityAreaTranslation[];
    activity_area_photos: ActivityAreaPhoto[];
};

type ActivityAreaFormState = {
    id?: string;
    main_photo: string;
    is_active: boolean;
    sort_order: string;
    translations: Record<Locale, {
        title: string;
        subtitle: string;
        description: string;
        slug: string;
    }>;
    photos: Array<{ photo_url: string; sort_order: number }>;
};

type UploadResponse = {
    url?: string;
    error?: string;
};

type ImageUploadFile = UploadFile<UploadResponse>;

type ActivityAreasResponse = {
    activityAreas?: ActivityAreaRecord[];
    error?: string;
};

type ActivityAreaMutationResponse = {
    id?: string;
    error?: string;
};

const EMPTY_FORM: ActivityAreaFormState = {
    main_photo: "",
    is_active: true,
    sort_order: "0",
    translations: {
        tr: { title: "", subtitle: "", description: "", slug: "" },
        en: { title: "", subtitle: "", description: "", slug: "" },
    },
    photos: [],
};

// faaliyet alanı liste form çeviri ve galerisini yönetiyorum
export function ActivityAreaAdminClient({
    initialActivityAreas,
}: {
    initialActivityAreas: ActivityAreaRecord[];
}) {
    const supabase = useMemo(() => createClient(), []);
    const [messageApi, contextHolder] = antMessage.useMessage();
    const [activityAreas, setActivityAreas] = useState<ActivityAreaRecord[]>(initialActivityAreas);
    const [form, setForm] = useState<ActivityAreaFormState>(EMPTY_FORM);
    const [isFormOpen, setIsFormOpen] = useState(initialActivityAreas.length === 0);
    const [saving, setSaving] = useState(false);
    const [mainUploading, setMainUploading] = useState(false);
    const [galleryFileList, setGalleryFileList] = useState<ImageUploadFile[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const activeCount = activityAreas.filter((item) => item.is_active).length;

    async function refreshActivityAreas() {
        const response = await fetch("/api/admin/activity-areas", { cache: "no-store" });
        const result = (await response.json()) as ActivityAreasResponse;

        if (!response.ok) {
            setMessage({ type: "error", text: result.error ?? "Faaliyet alanları alınamadı." });
            return;
        }

        setActivityAreas(result.activityAreas ?? []);
    }

    async function ensureAdmin() {
        const { data, error } = await supabase.auth.getClaims();

        if (error || !data?.claims) {
            setMessage({ type: "error", text: "Bu işlem için admin oturumu gerekli." });
            return false;
        }

        return true;
    }

    // boş faaliyet formunu açıyorum
    function startCreate() {
        setForm(EMPTY_FORM);
        setGalleryFileList([]);
        setMainUploading(false);
        setIsFormOpen(true);
        setMessage(null);
    }

    // seçilen kaydı forma aktarıyorum
    function startEdit(activityArea: ActivityAreaRecord) {
        const tr = activityArea.activity_area_translations.find((item) => item.locale === "tr");
        const en = activityArea.activity_area_translations.find((item) => item.locale === "en");
        const photos = activityArea.activity_area_photos
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((photo) => ({
                photo_url: photo.photo_url,
                sort_order: photo.sort_order,
            }));

        setForm({
            id: activityArea.id,
            main_photo: activityArea.main_photo ?? "",
            is_active: activityArea.is_active,
            sort_order: activityArea.sort_order.toString(),
            translations: {
                tr: {
                    title: tr?.title ?? "",
                    subtitle: tr?.subtitle ?? "",
                    description: tr?.description ?? "",
                    slug: tr?.slug ?? "",
                },
                en: {
                    title: en?.title ?? "",
                    subtitle: en?.subtitle ?? "",
                    description: en?.description ?? "",
                    slug: en?.slug ?? "",
                },
            },
            photos,
        });
        setGalleryFileList(toUploadFileList(photos.map((photo) => photo.photo_url)));
        setMainUploading(false);
        setIsFormOpen(true);
        setMessage(null);
    }

    function cancelForm() {
        setForm(EMPTY_FORM);
        setGalleryFileList([]);
        setMainUploading(false);
        setIsFormOpen(false);
        setMessage(null);
    }

    function updateTranslation(
        locale: Locale,
        key: "title" | "subtitle" | "description" | "slug",
        value: string
    ) {
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
            photos: urls.map((url, index) => ({
                photo_url: url,
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
        folder: getUploadFolder(form),
    });

    const handleMainPhotoChange: UploadProps<UploadResponse>["onChange"] = (info) => {
        const { status, name, response } = info.file;

        if (status === "uploading") {
            setMainUploading(true);
            return;
        }

        setMainUploading(false);

        if (status === "done" && response?.url) {
            setForm((current) => ({ ...current, main_photo: response.url ?? "" }));
            messageApi.success(`${name} ana görsel olarak yüklendi.`);
        } else if (status === "error") {
            messageApi.error(response?.error ?? `${name} yüklenemedi.`);
        }
    };

    // yüklenen galeri görsellerini sırayla tutuyorum
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

    // faaliyet alanı ve çevirileri kaydediyorum
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        const trTitle = form.translations.tr.title.trim();
        const enTitle = form.translations.en.title.trim();
        const trSlug = (form.translations.tr.slug.trim() || slugify(trTitle)).toLowerCase();
        const enSlug = (form.translations.en.slug.trim() || slugify(enTitle)).toLowerCase();

        if (!trTitle || !enTitle) {
            setSaving(false);
            setMessage({ type: "error", text: "TR ve EN başlık alanları zorunludur." });
            return;
        }

        if (!trSlug || !enSlug) {
            setSaving(false);
            setMessage({ type: "error", text: "TR ve EN slug oluşturulamadı." });
            return;
        }

        const payload = {
            id: form.id,
            activityArea: {
                main_photo: form.main_photo.trim() || null,
                is_active: form.is_active,
                sort_order: form.sort_order ? Number(form.sort_order) : 0,
            },
            translations: (["tr", "en"] as Locale[]).map((locale) => ({
                locale,
                title: form.translations[locale].title.trim(),
                subtitle: form.translations[locale].subtitle.trim() || null,
                description: form.translations[locale].description.trim() || null,
                slug: locale === "tr" ? trSlug : enSlug,
            })),
            photos: form.photos
                .map((photo, index) => ({
                    photo_url: photo.photo_url.trim(),
                    sort_order: index,
                }))
                .filter((photo) => photo.photo_url.length > 0),
        };

        try {
            const isAdmin = await ensureAdmin();

            if (!isAdmin) return;

            const response = await fetch("/api/admin/activity-areas", {
                method: form.id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const result = (await response.json()) as ActivityAreaMutationResponse;

            if (!response.ok) {
                throw new Error(result.error ?? "Faaliyet alanı kaydedilemedi.");
            }

            await refreshActivityAreas();
            setForm(EMPTY_FORM);
            setGalleryFileList([]);
            setIsFormOpen(false);
            setMessage({
                type: "success",
                text: form.id ? "Faaliyet alanı güncellendi." : "Faaliyet alanı oluşturuldu.",
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

    // onay sonrası faaliyet alanını siliyorum
    async function deleteActivityArea(activityArea: ActivityAreaRecord) {
        const title = getActivityAreaTitle(activityArea);
        const confirmed = window.confirm(`${title} faaliyet alanını silmek istediğine emin misin?`);

        if (!confirmed) return;

        setDeletingId(activityArea.id);
        setMessage(null);

        const isAdmin = await ensureAdmin();

        if (!isAdmin) {
            setDeletingId(null);
            return;
        }

        try {
            const response = await fetch("/api/admin/activity-areas", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: activityArea.id }),
            });
            const result = (await response.json()) as ActivityAreaMutationResponse;

            if (!response.ok) {
                setMessage({ type: "error", text: result.error ?? "Faaliyet alanı silinemedi." });
                return;
            }

            setActivityAreas((current) => current.filter((item) => item.id !== activityArea.id));
            setMessage({ type: "success", text: "Faaliyet alanı silindi." });

            if (form.id === activityArea.id) {
                cancelForm();
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Faaliyet alanı silinemedi.",
            });
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {contextHolder}
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard label="Toplam" value={activityAreas.length.toString()} />
                <StatCard label="Aktif" value={activeCount.toString()} />
                <StatCard
                    label="Galeri Fotoğrafı"
                    value={activityAreas
                        .reduce((total, item) => total + item.activity_area_photos.length, 0)
                        .toString()}
                />
            </section>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Faaliyet Alanları Listesi</h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Ana sayfa kartları ve ileride detay sayfaları için kullanılacak içerikleri yönetin.
                        </p>
                    </div>
                    <Button type="primary" onClick={startCreate} icon={<Plus className="h-4 w-4" />}>
                        Yeni Faaliyet
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
                    {activityAreas.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
                            <div className="rounded-full bg-zinc-100 p-4 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                                <ImageIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Henüz faaliyet alanı yok</h3>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    İlk faaliyet alanını ekleyerek public site verisini hazırlayabilirsiniz.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-200 dark:divide-white/10">
                            {activityAreas.map((activityArea) => (
                                <ActivityAreaRow
                                    key={activityArea.id}
                                    activityArea={activityArea}
                                    active={form.id === activityArea.id}
                                    deleting={deletingId === activityArea.id}
                                    onEdit={() => startEdit(activityArea)}
                                    onDelete={() => deleteActivityArea(activityArea)}
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
                                {form.id ? "Faaliyet alanı düzenleme" : "Yeni faaliyet alanı"}
                            </p>
                            <h2 className="mt-1 text-xl font-semibold">
                                {form.id ? "Faaliyet bilgilerini güncelle" : "Faaliyet alanı oluştur"}
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
                                    <h3 className="font-semibold">Detay Galeri Fotoğrafları</h3>
                                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                        Faaliyet detay sayfasında kullanılacak fotoğrafları yükleyin.
                                    </p>
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ana Görsel</label>
                                <Upload<UploadResponse>
                                    name="file"
                                    action="/api/admin/upload"
                                    data={uploadData}
                                    accept="image/*"
                                    listType="picture-card"
                                    showUploadList={false}
                                    beforeUpload={beforeImageUpload}
                                    onChange={handleMainPhotoChange}
                                >
                                    {form.main_photo ? (
                                        <div className="relative h-full w-full">
                                            <Image
                                                draggable={false}
                                                src={form.main_photo}
                                                alt=""
                                                fill
                                                sizes="150px"
                                                unoptimized={!form.main_photo.startsWith("http")}
                                                className="rounded-lg object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <Button
                                            type="text"
                                            htmlType="button"
                                            icon={mainUploading ? <LoadingOutlined /> : <PlusOutlined />}
                                            className="h-auto border-0 bg-transparent"
                                        >
                                            <div className="mt-2">Yükle</div>
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
                                    label="Aktif"
                                    description="Public sitede görünür."
                                    checked={form.is_active}
                                    onChange={(value) => setForm((current) => ({ ...current, is_active: value }))}
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

function ActivityAreaRow({
    activityArea,
    active,
    deleting,
    onEdit,
    onDelete,
}: {
    activityArea: ActivityAreaRecord;
    active: boolean;
    deleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const title = getActivityAreaTitle(activityArea);
    const tr = activityArea.activity_area_translations.find((item) => item.locale === "tr");
    const en = activityArea.activity_area_translations.find((item) => item.locale === "en");
    const photo = activityArea.main_photo || activityArea.activity_area_photos[0]?.photo_url;

    return (
        <article
            className={cn(
                "grid gap-4 p-4 transition md:grid-cols-[88px_1fr_auto]",
                active && "bg-blue-50/70 dark:bg-blue-500/10"
            )}
        >
            <div className="relative h-24 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-white/10 md:h-20">
                {photo ? (
                    <Image
                        src={photo}
                        alt=""
                        fill
                        sizes="(max-width: 767px) calc(100vw - 3rem), 88px"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{title}</h3>
                    {activityArea.is_active ? (
                        <Badge tone="green">Aktif</Badge>
                    ) : (
                        <Badge tone="zinc">Pasif</Badge>
                    )}
                </div>
                <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                    TR: /{tr?.slug ?? "-"} · EN: /{en?.slug ?? "-"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Sıra: {activityArea.sort_order}</span>
                    <span>Fotoğraf: {activityArea.activity_area_photos.length}</span>
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
    value: { title: string; subtitle: string; description: string; slug: string };
    onChange: (
        locale: Locale,
        key: "title" | "subtitle" | "description" | "slug",
        value: string
    ) => void;
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
                    <label htmlFor={`${locale}-subtitle`} className="text-sm font-medium">Alt Başlık</label>
                    <Input
                        id={`${locale}-subtitle`}
                        value={value.subtitle}
                        onChange={(event) => onChange(locale, "subtitle", event.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor={`${locale}-slug`} className="text-sm font-medium">Slug</label>
                    <Input
                        id={`${locale}-slug`}
                        value={value.slug}
                        onChange={(event) => onChange(locale, "slug", event.target.value)}
                        placeholder="muhendislik-ve-tasarim"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Boş kalırsa başlıktan otomatik oluşturulur.
                    </p>
                </div>
                <div className="space-y-2">
                    <label htmlFor={`${locale}-description`} className="text-sm font-medium">Açıklama</label>
                    <TextArea
                        id={`${locale}-description`}
                        value={value.description}
                        onChange={(event) => onChange(locale, "description", event.target.value)}
                        className="min-h-40"
                        placeholder={"Ana aciklama metni\n\n• Birinci madde\n• Ikinci madde\n• Ucuncu madde"}
                    />
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        Detay sayfasinda bu alan duz metin olarak gosterilir. Madde isaretli anlatim
                        isteniyorsa her satira “•” veya “-” ile baslayarak yazin; satir bosluklari
                        korunur.
                    </p>
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

function getActivityAreaTitle(activityArea: ActivityAreaRecord) {
    return (
        activityArea.activity_area_translations.find((item) => item.locale === "tr")?.title ||
        activityArea.activity_area_translations.find((item) => item.locale === "en")?.title ||
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

function getUploadFolder(form: ActivityAreaFormState) {
    const folder = form.id ?? slugify(form.translations.tr.title || form.translations.en.title);

    return folder ? `stallcons/activity-areas/${folder}` : "stallcons/activity-areas";
}

function toUploadFileList(urls: string[]): ImageUploadFile[] {
    return urls
        .filter(Boolean)
        .map((url, index) => ({
            uid: url,
            name: getFileNameFromUrl(url) || `activity-area-photo-${index + 1}`,
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
