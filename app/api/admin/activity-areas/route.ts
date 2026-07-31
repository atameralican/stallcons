import { after, NextResponse } from "next/server";

import { getActivityAreasData } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";
import { submitIndexNow } from "@/lib/indexnow";

type Locale = "tr" | "en";

type ActivityAreaMutationPayload = {
    id?: string;
    activityArea: {
        main_photo: string | null;
        is_active: boolean;
        sort_order: number;
    };
    translations: Array<{
        locale: Locale;
        title: string;
        subtitle: string | null;
        description: string | null;
        slug: string;
    }>;
    photos: Array<{
        photo_url: string;
        sort_order: number;
    }>;
};

export async function GET() {
    const { data: activityAreas, error } = await getActivityAreasData();

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ activityAreas });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as ActivityAreaMutationPayload;
    const validationError = validatePayload(payload);

    if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("activity_areas")
        .insert(payload.activityArea)
        .select("id")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveActivityAreaRelations(supabase, data.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    after(() => submitIndexNow(getActivityPaths(payload)));

    return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as ActivityAreaMutationPayload;

    if (!payload.id) {
        return NextResponse.json({ error: "Faaliyet alanı id zorunludur." }, { status: 400 });
    }

    const validationError = validatePayload(payload);

    if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { error } = await supabase
        .from("activity_areas")
        .update(payload.activityArea)
        .eq("id", payload.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveActivityAreaRelations(supabase, payload.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    after(() => submitIndexNow(getActivityPaths(payload)));

    return NextResponse.json({ id: payload.id });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
        return NextResponse.json({ error: "Faaliyet alanı id zorunludur." }, { status: 400 });
    }

    const { data: translations } = await supabase
        .from("activity_area_translations")
        .select("locale, slug")
        .eq("activity_area_id", id);

    const { error } = await supabase
        .from("activity_areas")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    after(() => submitIndexNow(
        ["/tr", "/en", ...(translations ?? [])
            .filter((translation) => translation.locale === "tr" || translation.locale === "en")
            .map((translation) => `/${translation.locale}/expertise-areas/${translation.slug}`)],
    ));

    return NextResponse.json({ id });
}

function getActivityPaths(payload: ActivityAreaMutationPayload) {
    return ["/tr", "/en", ...payload.translations.map(
        (translation) => `/${translation.locale}/expertise-areas/${translation.slug}`,
    )];
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
    }

    return null;
}

function validatePayload(payload: ActivityAreaMutationPayload) {
    const tr = payload.translations.find((item) => item.locale === "tr");
    const en = payload.translations.find((item) => item.locale === "en");

    if (!tr?.title?.trim() || !en?.title?.trim()) {
        return "TR ve EN başlık alanları zorunludur.";
    }

    if (!tr?.slug?.trim() || !en?.slug?.trim()) {
        return "TR ve EN slug alanları zorunludur.";
    }

    return null;
}

async function saveActivityAreaRelations(
    supabase: Awaited<ReturnType<typeof createClient>>,
    activityAreaId: string,
    payload: ActivityAreaMutationPayload
) {
    const translations = payload.translations.map((translation) => ({
        ...translation,
        activity_area_id: activityAreaId,
    }));

    const { error: translationsError } = await supabase
        .from("activity_area_translations")
        .upsert(translations, { onConflict: "activity_area_id,locale" });

    if (translationsError) return translationsError.message;

    const { error: deletePhotosError } = await supabase
        .from("activity_area_photos")
        .delete()
        .eq("activity_area_id", activityAreaId);

    if (deletePhotosError) return deletePhotosError.message;

    if (payload.photos.length === 0) return null;

    const { error: photosError } = await supabase
        .from("activity_area_photos")
        .insert(payload.photos.map((photo) => ({ ...photo, activity_area_id: activityAreaId })));

    return photosError?.message ?? null;
}
