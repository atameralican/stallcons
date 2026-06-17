import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    /**
     * Admin panel çok dilli olmayacak.
     */
    if (pathname.startsWith("/admin")) {
        return await updateSession(request, NextResponse.next({ request }));
    }

    /**
     * Public site tarafında next-intl çalışır:
     */
    const response = handleI18nRouting(request);

    /**
     * next-intl response'unu bozmadan Supabase cookie'lerini ekliyoruz.
     */
    return await updateSession(request, response);
}

export const config = {
    matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};