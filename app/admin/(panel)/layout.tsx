import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
    children: React.ReactNode;
};

export default async function AdminPanelLayout({ children }: Props) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/admin/login");
    }

    return <>{children}</>;
}