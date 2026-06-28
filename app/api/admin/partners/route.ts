import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PartnerRecord } from "@/app/admin/(panel)/partners/partner-admin-client";



type PartnerMutationPayload = {
    id?: string;
    is_published: boolean;
    name: string;
    url: string;
    sort_order: number;
};

export async function GET() {
    const supabase = await createClient();

    // public tarafta da kullanıyorum o yüzden admin kontrolü yok
    const { data, error } = await supabase
        .from("partners")
        .select('*')
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const partners = (data ?? []) as PartnerRecord[];

    return NextResponse.json({ partners });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    // yazma işi admin oturumu ile olsun
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
    // güncelleme de ekleme ile aynı data yapısını kullanıyor
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
    // silme işini de route tarafında koruyorum
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
    // ayrı admin tablosu yok şimdilik giriş yapan admin sayılıyor
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
    }

    return null;
}

