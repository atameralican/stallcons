import { NextResponse } from "next/server";

import { getPartnersData } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";



type PartnerMutationPayload = {
    id?: string;
    is_published: boolean;
    name: string;
    url: string;
    sort_order: number;
};

export async function GET() {
    const { data: partners, error } = await getPartnersData();

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ partners });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    // yazma için admin gerekli
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as PartnerMutationPayload;
    const { data, error } = await supabase
        .from("partners")
        .insert(payload)
        .select("id")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    // güncellemede aynı veri yapısı var
    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as PartnerMutationPayload;

    if (!payload.id) {
        return NextResponse.json({ error: "Partner id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("partners")
        .update(payload)
        .eq("id", payload.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        return NextResponse.json({ error: "Partner id zorunludur." }, { status: 400 });
    }

    const { error } = await supabase
        .from("partners")
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
