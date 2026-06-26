import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { ServiceRecord } from "@/app/admin/(panel)/services/service-admin-client";

type Locale = "tr" | "en";

type ServiceMutationPayload = {
    id?: string;
    service: {
        is_active: boolean;
    };
    translations: Array<{
        locale: Locale;
        title: string;
        description: string | null;
    }>;
    photos: Array<{
        photo_url: string;
    }>;
};

export async function GET() {
    const supabase = await createClient();

    // public tarafta da kullanılabilir o yüzden gette admin kontrolü yok
    const { data, error } = await supabase
        .from("services")
        .select(`
            id,
            is_active,
            created_at,
            updated_at,
            service_translations (
                id,
                locale,
                title,
                description
            ),
            service_photos (
                id,
                photo_url,
                created_at
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const services = (data ?? []) as ServiceRecord[];

    return NextResponse.json({ services });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    // yazma işi admin oturumu ile olsun
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as ServiceMutationPayload;
    const { data, error } = await supabase
        .from("services")
        .insert(payload.service)
        .select("id")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveServiceRelations(supabase, data.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    // güncelleme de aynı payload ile geliyor
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as ServiceMutationPayload;

    if (!payload.id) {
        return NextResponse.json({ error: "Hizmet id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("services")
        .update(payload.service)
        .eq("id", payload.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saveError = await saveServiceRelations(supabase, payload.id, payload);

    if (saveError) {
        return NextResponse.json({ error: saveError }, { status: 500 });
    }

    return NextResponse.json({ id: payload.id });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    // silme işini route tarafında koruyorum
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
        return NextResponse.json({ error: "Hizmet id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id });
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    // ayrı admin rolü yok giriş yapan admin sayılıyor
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
    }

    return null;
}

async function saveServiceRelations(
    supabase: Awaited<ReturnType<typeof createClient>>,
    serviceId: string,
    payload: ServiceMutationPayload
) {
    // locale varsa güncelle yoksa ekle
    const translations = payload.translations.map((translation) => ({
        ...translation,
        service_id: serviceId,
    }));

    const { error: translationsError } = await supabase
        .from("service_translations")
        .upsert(translations, { onConflict: "service_id,locale" });

    if (translationsError) return translationsError.message;

    // foto sıralaması yok o yüzden gelen listeyi baştan yazıyorum
    const { error: deletePhotosError } = await supabase
        .from("service_photos")
        .delete()
        .eq("service_id", serviceId);

    if (deletePhotosError) return deletePhotosError.message;

    if (payload.photos.length === 0) return null;

    const { error: photosError } = await supabase
        .from("service_photos")
        .insert(payload.photos.map((photo) => ({ ...photo, service_id: serviceId })));

    return photosError?.message ?? null;
}
