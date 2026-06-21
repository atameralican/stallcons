import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { ProjectRecord } from "@/app/admin/(panel)/projects/project-admin-client";

type Locale = "tr" | "en";

type ProjectMutationPayload = {
    id?: string;
    project: {
        slug: string;
        main_photo: string | null;
        year: number | null;
        weight_tons: number | null;
        sort_order: number;
        is_favorite: boolean;
        is_published: boolean;
    };
    translations: Array<{
        locale: Locale;
        title: string;
        description: string | null;
    }>;
    photos: Array<{
        url: string;
        alt: string | null;
        sort_order: number;
    }>;
};

export async function GET() {
    const supabase = await createClient();

    // public tarafta da kullanıyorum o yüzden admin kontrolü yok
    const { data, error } = await supabase
        .from("projects")
        .select(`
            id,
            slug,
            main_photo,
            year,
            weight_tons,
            sort_order,
            is_favorite,
            is_published,
            created_at,
            updated_at,
            project_translations (
                id,
                locale,
                title,
                description
            ),
            project_photos (
                id,
                url,
                alt,
                sort_order,
                created_at
            )
        `)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const projects = (data ?? []) as ProjectRecord[];

    return NextResponse.json({ projects });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    // yazma işi admin oturumu ile olsun
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as ProjectMutationPayload;
    const { data, error } = await supabase
        .from("projects")
        .insert(payload.project)
        .select("id")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveProjectRelations(supabase, data.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    // güncelleme de ekleme ile aynı data yapısını kullanıyor
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as ProjectMutationPayload;

    if (!payload.id) {
        return NextResponse.json({ error: "Proje id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("projects")
        .update(payload.project)
        .eq("id", payload.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveProjectRelations(supabase, payload.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    return NextResponse.json({ id: payload.id });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    // silme işini de route tarafında koruyorum
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
        return NextResponse.json({ error: "Proje id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id });
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    // ayrı admin tablosu yok şimdilik giriş yapan admin sayılıyor
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
    }

    return null;
}

async function saveProjectRelations(
    supabase: Awaited<ReturnType<typeof createClient>>,
    projectId: string,
    payload: ProjectMutationPayload
) {
    // locale varsa güncelle yoksa ekle
    const translations = payload.translations.map((translation) => ({
        ...translation,
        project_id: projectId,
    }));

    const { error: translationsError } = await supabase
        .from("project_translations")
        .upsert(translations, { onConflict: "project_id,locale" });

    if (translationsError) return translationsError.message;

    // galeri sırası değişebildiği için fotoları temizleyip yeniden yazıyorum
    const { error: deletePhotosError } = await supabase
        .from("project_photos")
        .delete()
        .eq("project_id", projectId);

    if (deletePhotosError) return deletePhotosError.message;

    if (payload.photos.length === 0) return null;

    const { error: photosError } = await supabase
        .from("project_photos")
        .insert(payload.photos.map((photo) => ({ ...photo, project_id: projectId })));

    return photosError?.message ?? null;
}
