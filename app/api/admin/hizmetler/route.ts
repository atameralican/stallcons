import { NextResponse } from "next/server";

import { getHizmetlerData } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";

type Locale = "tr" | "en";

type HizmetMutationPayload = {
    id?: string;
    hizmet: {
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
    const { data: hizmetler, error } = await getHizmetlerData();

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ hizmetler });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    // yazma için admin gerekli
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as HizmetMutationPayload;
    const { data, error } = await supabase
        .from("hizmetler")
        .insert(payload.hizmet)
        .select("id")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveHizmetRelations(supabase, data.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    // güncellemede aynı veri yapısı var
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as HizmetMutationPayload;

    if (!payload.id) {
        return NextResponse.json({ error: "Hizmet id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("hizmetler")
        .update(payload.hizmet)
        .eq("id", payload.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveHizmetRelations(supabase, payload.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    return NextResponse.json({ id: payload.id });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    // silme için admin gerekli
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
        return NextResponse.json({ error: "Hizmet id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("hizmetler")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id });
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    // giriş yapan kullanıcı admin sayılıyor
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
    }

    return null;
}

async function saveHizmetRelations(
    supabase: Awaited<ReturnType<typeof createClient>>,
    hizmetId: string,
    payload: HizmetMutationPayload
) {
    // çeviriyi ekliyorum ya da güncelliyorum
    const translations = payload.translations.map((translation) => ({
        ...translation,
        hizmet_id: hizmetId,
    }));

    const { error: translationsError } = await supabase
        .from("hizmet_translations")
        .upsert(translations, { onConflict: "hizmet_id,locale" });

    if (translationsError) return translationsError.message;

    // galeri sırasını yeniden yazıyorum
    const { error: deletePhotosError } = await supabase
        .from("hizmet_photos")
        .delete()
        .eq("hizmet_id", hizmetId);

    if (deletePhotosError) return deletePhotosError.message;

    if (payload.photos.length === 0) return null;

    const { error: photosError } = await supabase
        .from("hizmet_photos")
        .insert(payload.photos.map((photo) => ({ ...photo, hizmet_id: hizmetId })));

    return photosError?.message ?? null;
}
