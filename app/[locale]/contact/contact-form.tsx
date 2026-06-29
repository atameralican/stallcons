"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

declare global {
    interface Window {
        onContactTurnstileSuccess?: (token: string) => void;
        onContactTurnstileExpired?: () => void;
        turnstile?: {
            reset: () => void;
        };
    }
}

type ContactFormLabels = {
    formHeading: string;
    firstname: string;
    firstnamePlaceholder: string;
    lastname: string;
    lastnamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    privacyConsentPrefix: string;
    privacyConsentLink: string;
    privacyConsentSuffix: string;
};

type ContactFormProps = {
    locale: string;
    labels: ContactFormLabels;
};

type ContactResponse = {
    success?: boolean;
    message?: string;
    error?: string;
};

const INITIAL_FORM = {
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    company: "", // honeypot
};

export function ContactForm({ locale, labels }: ContactFormProps) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const turnstileSiteKey =
        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

    const sourcePage = useMemo(() => {
        if (typeof window === "undefined") return null;

        return window.location.pathname;
    }, []);

    useEffect(() => {
        window.onContactTurnstileSuccess = (token: string) => {
            setTurnstileToken(token);
        };

        window.onContactTurnstileExpired = () => {
            setTurnstileToken("");
        };

        return () => {
            delete window.onContactTurnstileSuccess;
            delete window.onContactTurnstileExpired;
        };
    }, []);

    function updateField(key: keyof typeof INITIAL_FORM, value: string) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        setLoading(true);
        setFeedback(null);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    locale,
                    source_page: sourcePage,
                    turnstileToken,
                }),
            });

            const result = (await response.json()) as ContactResponse;

            if (!response.ok) {
                throw new Error(
                    result.message || result.error || "Talep gönderilemedi."
                );
            }

            setForm(INITIAL_FORM);
            setTurnstileToken("");

            if (turnstileSiteKey) {
                window.turnstile?.reset();
            }

            setFeedback({
                type: "success",
                text:
                    result.message ||
                    "Talebiniz alınmıştır. En kısa sürede sizinle iletişime geçilecektir.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Talep gönderilirken hata oluştu.",
            });

            if (turnstileSiteKey) {
                window.turnstile?.reset();
                setTurnstileToken("");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            data-slot="card"
            className="lg:col-span-2 flex flex-col gap-6 rounded-xl border bg-card py-8 text-card-foreground shadow-none"
        >
            {turnstileSiteKey && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    async
                    defer
                />
            )}

            <div data-slot="card-header" className="px-6">
                <h3 className="text-xl font-semibold">{labels.formHeading}</h3>
            </div>

            <div data-slot="card-content" className="px-6 flex flex-col gap-5">
                <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={(event) => updateField("company", event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                />

                <div className="flex gap-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="firstname">{labels.firstname}</Label>
                        <Input
                            required
                            type="text"
                            id="firstname"
                            name="firstname"
                            value={form.firstname}
                            onChange={(event) => updateField("firstname", event.target.value)}
                            placeholder={labels.firstnamePlaceholder}
                            autoComplete="given-name"
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="lastname">{labels.lastname}</Label>
                        <Input
                            required
                            type="text"
                            id="lastname"
                            name="lastname"
                            value={form.lastname}
                            onChange={(event) => updateField("lastname", event.target.value)}
                            placeholder={labels.lastnamePlaceholder}
                            autoComplete="family-name"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="email">{labels.emailLabel}</Label>
                        <Input
                            required
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={(event) => updateField("email", event.target.value)}
                            placeholder={labels.emailPlaceholder}
                            autoComplete="email"
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="phone">{labels.phoneLabel}</Label>
                        <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={form.phone}
                            onChange={(event) => updateField("phone", event.target.value)}
                            placeholder={labels.phonePlaceholder}
                            autoComplete="tel"
                        />
                    </div>
                </div>

                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="subject">{labels.subject}</Label>
                    <Input
                        required
                        type="text"
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={(event) => updateField("subject", event.target.value)}
                        placeholder={labels.subjectPlaceholder}
                    />
                </div>

                <div className="grid w-full gap-1.5">
                    <Label htmlFor="message">{labels.message}</Label>
                    <Textarea
                        required
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={(event) => updateField("message", event.target.value)}
                        placeholder={labels.messagePlaceholder}
                        className="min-h-36 resize-none"
                    />
                </div>

                {turnstileSiteKey && (
                    <div
                        className="cf-turnstile"
                        data-sitekey={turnstileSiteKey}
                        data-callback="onContactTurnstileSuccess"
                        data-expired-callback="onContactTurnstileExpired"
                    />
                )}

                {feedback && (
                    <div
                        className={
                            feedback.type === "success"
                                ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
                        }
                    >
                        {feedback.text}
                    </div>
                )}
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input
                        required
                        type="checkbox"
                        className="mt-1"
                    />
                    <span>
                        {labels.privacyConsentPrefix}
                        <a
                            href={`/${locale}/privacy-policy`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-foreground underline underline-offset-4"
                        >
                            {labels.privacyConsentLink}
                        </a>
                        {labels.privacyConsentSuffix}
                    </span>
                </label>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <Send className="h-4 w-4" />
                    {loading ? labels.sending : labels.send}
                </Button>
            </div>
        </form>
    );
}
