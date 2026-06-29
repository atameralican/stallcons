import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type {
    ContactRequestRecord,
    ContactStatus,
} from "@/app/admin/(panel)/contact-requests/contact-requests-admin-client";

type ContactRequestUpdatePayload = {
    id?: string;
    status?: ContactStatus;
    admin_note?: string | null;
};

const VALID_STATUSES: ContactStatus[] = [
    "new",
    "reviewing",
    "contacted",
    "offer_sent",
    "won",
    "lost",
    "spam",
    "archived",
];

const CONTACT_REQUEST_SELECT = `
  id,
  first_name,
  last_name,
  email,
  phone,
  subject,
  message,
  locale,
  source_page,
  user_agent,
  ip_address,
  status,
  turnstile_verified,
  request_hash,
  spam_reason,
  admin_note,
  admin_email_sent_at,
  customer_email_sent_at,
  last_email_error,
  created_at,
  updated_at
`;

export async function GET() {
    const supabase = await createClient();

    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const { data, error } = await supabase
        .from("contact_requests")
        .select(CONTACT_REQUEST_SELECT)
        .order("created_at", { ascending: false })
        .limit(300);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requests = (data ?? []) as ContactRequestRecord[];

    return NextResponse.json({ requests });
}

export async function PUT(request: Request) {
    const supabase = await createClient();

    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as ContactRequestUpdatePayload;

    if (!payload.id) {
        return NextResponse.json(
            { error: "Talep id zorunludur." },
            { status: 400 }
        );
    }

    if (!payload.status || !VALID_STATUSES.includes(payload.status)) {
        return NextResponse.json(
            { error: "Geçerli bir status değeri zorunludur." },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("contact_requests")
        .update({
            status: payload.status,
            admin_note: payload.admin_note?.trim() || null,
        })
        .eq("id", payload.id)
        .select(CONTACT_REQUEST_SELECT)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        request: data as ContactRequestRecord,
    });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();

    const unauthorized = await requireAdmin(supabase);

    if (unauthorized) return unauthorized;

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
        return NextResponse.json(
            { error: "Talep id zorunludur." },
            { status: 400 }
        );
    }

    const { error } = await supabase
        .from("contact_requests")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id });
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
    }

    return null;
}