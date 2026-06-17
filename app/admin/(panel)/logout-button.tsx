"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        await supabase.auth.signOut({
            scope: "local",
        });

        router.replace("/admin/login");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500 hover:text-white dark:text-red-300"
        >
            Çıkış Yap
        </button>
    );
}