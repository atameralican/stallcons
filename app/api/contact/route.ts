import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendContactRequestEmails } from "@/lib/mail";

type ContactPayload = {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    locale?: string;
    source_page?: string;
    company?: string; // honeypot
    turnstileToken?: string;
};

type TurnstileResponse = {
    success: boolean;
    "error-codes"?: string[];
};

export async function POST(request: Request) {
    try {
        const payload = (await request.json()) as ContactPayload;

        const firstName = normalizeText(payload.firstname);
        const lastName = normalizeText(payload.lastname);
        const email = normalizeEmail(payload.email);
        const phone = normalizeNullableText(payload.phone);
        const subject = normalizeText(payload.subject);
        const message = normalizeText(payload.message);
        const locale = payload.locale === "en" ? "en" : "tr";
        const sourcePage = normalizeNullableText(payload.source_page);
        const honeypot = normalizeNullableText(payload.company);

        const ipAddress = getClientIp(request);
        const userAgent = request.headers.get("user-agent") ?? null;

        // Honeypot doluysa bot kabul ediyoruz.
        // Bilerek success dönüyoruz ki bot tekrar denemeye çalışmasın.
        if (honeypot) {
            return NextResponse.json({
                success: true,
                message: "Talebiniz alınmıştır.",
            });
        }

        const validationError = validatePayload({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message,
        });

        if (validationError) {
            return NextResponse.json(
                {
                    success: false,
                    message: validationError,
                },
                { status: 400 }
            );
        }

        const turnstileVerified = await verifyTurnstileIfEnabled(
            payload.turnstileToken,
            ipAddress
        );

        if (!turnstileVerified.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: turnstileVerified.message,
                },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const requestHash = createRequestHash({
            email,
            subject,
            message,
        });

        const rateLimitError = await checkRateLimit(supabase, {
            ipAddress,
            email,
            requestHash,
        });

        if (rateLimitError) {
            return NextResponse.json(
                {
                    success: false,
                    message: rateLimitError,
                },
                { status: 429 }
            );
        }

        const { data, error } = await supabase
            .from("contact_requests")
            .insert({
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                subject,
                message,
                locale,
                source_page: sourcePage,
                user_agent: userAgent,
                ip_address: ipAddress,
                status: "new",
                turnstile_verified: turnstileVerified.verified,
                request_hash: requestHash,
            })
            .select("id")
            .single();

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 500 }
            );
        }

        //mail gönderimi start
        let adminEmailSentAt: string | null = null;
        let customerEmailSentAt: string | null = null;
        let lastEmailError: string | null = null;

        try {
            const mailResult = await sendContactRequestEmails({
                id: data.id,
                firstName,
                lastName,
                email,
                phone,
                subject,
                message,
                locale,
                sourcePage,
            });

            adminEmailSentAt = mailResult.adminEmailSentAt;
            customerEmailSentAt = mailResult.customerEmailSentAt;
        } catch (mailError) {
            lastEmailError =
                mailError instanceof Error
                    ? mailError.message
                    : "Mail gönderilirken hata oluştu.";
        }

        await supabase
            .from("contact_requests")
            .update({
                admin_email_sent_at: adminEmailSentAt,
                customer_email_sent_at: customerEmailSentAt,
                last_email_error: lastEmailError,
            })
            .eq("id", data.id);
        //mail gönderimi end


        return NextResponse.json(
            {
                success: true,
                id: data.id,
                message:
                    "Talebiniz alınmıştır. En kısa sürede sizinle iletişime geçilecektir.",
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Talep gönderilirken hata oluştu.",
            },
            { status: 500 }
        );
    }
}

function normalizeText(value?: string) {
    return value?.trim() ?? "";
}

function normalizeNullableText(value?: string) {
    const normalized = value?.trim();

    return normalized ? normalized : null;
}

function normalizeEmail(value?: string) {
    return value?.trim().toLocaleLowerCase("tr") ?? "";
}

function validatePayload(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
}) {
    if (payload.firstName.length < 2) return "Ad alanı zorunludur.";
    if (payload.lastName.length < 2) return "Soyad alanı zorunludur.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        return "Geçerli bir e-posta adresi giriniz.";
    }

    if (payload.phone && payload.phone.length < 5) {
        return "Geçerli bir telefon numarası giriniz.";
    }

    if (payload.subject.length < 2) return "Konu alanı zorunludur.";
    if (payload.message.length < 10) {
        return "Mesaj alanı en az 10 karakter olmalıdır.";
    }

    if (payload.message.length > 5000) {
        return "Mesaj alanı en fazla 5000 karakter olabilir.";
    }

    return null;
}

function getClientIp(request: Request) {
    const cfIp = request.headers.get("cf-connecting-ip");
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    if (cfIp) return cfIp;

    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || null;
    }

    return realIp;
}

function createRequestHash(payload: {
    email: string;
    subject: string;
    message: string;
}) {
    return createHash("sha256")
        .update(`${payload.email}:${payload.subject}:${payload.message}`)
        .digest("hex");
}

async function checkRateLimit(
    supabase: ReturnType<typeof createAdminClient>,
    params: {
        ipAddress: string | null;
        email: string;
        requestHash: string;
    }
) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    if (params.ipAddress) {
        const { count, error } = await supabase
            .from("contact_requests")
            .select("id", { count: "exact", head: true })
            .eq("ip_address", params.ipAddress)
            .gte("created_at", tenMinutesAgo);

        if (error) return error.message;

        if ((count ?? 0) >= 3) {
            return "Çok kısa sürede fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin.";
        }
    }

    const { count: emailCount, error: emailError } = await supabase
        .from("contact_requests")
        .select("id", { count: "exact", head: true })
        .eq("email", params.email)
        .gte("created_at", oneHourAgo);

    if (emailError) return emailError.message;

    if ((emailCount ?? 0) >= 3) {
        return "Bu e-posta adresiyle kısa sürede fazla talep gönderildi.";
    }

    const { count: duplicateCount, error: duplicateError } = await supabase
        .from("contact_requests")
        .select("id", { count: "exact", head: true })
        .eq("request_hash", params.requestHash)
        .gte("created_at", oneHourAgo);

    if (duplicateError) return duplicateError.message;

    if ((duplicateCount ?? 0) >= 1) {
        return "Bu talep daha önce gönderilmiş görünüyor.";
    }

    return null;
}

async function verifyTurnstileIfEnabled(
    token?: string,
    ipAddress?: string | null
): Promise<{ ok: boolean; verified: boolean; message?: string }> {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    // Local geliştirme için boşsa geçiyoruz.
    if (!secretKey) {
        return {
            ok: true,
            verified: false,
        };
    }

    if (!token) {
        return {
            ok: false,
            verified: false,
            message: "Güvenlik doğrulaması eksik.",
        };
    }

    const formData = new FormData();

    formData.append("secret", secretKey);
    formData.append("response", token);

    if (ipAddress) {
        formData.append("remoteip", ipAddress);
    }

    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            body: formData,
        }
    );

    const result = (await response.json()) as TurnstileResponse;

    if (!result.success) {
        return {
            ok: false,
            verified: false,
            message: "Güvenlik doğrulaması başarısız oldu.",
        };
    }

    return {
        ok: true,
        verified: true,
    };
}


//mail gönderimi
