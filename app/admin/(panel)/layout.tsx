import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar/sidebar";

type Props = {
    children: React.ReactNode;
};

const adminNavItems = [
    { id: "projects", name: "Projeler", icon: "FileText", href: "/admin/projects" },
    { id: "services", name: "Hizmetler", icon: "HelpCircle", href: "/admin/services" },
    { id: "products", name: "Ürünler", icon: "BarChart3", href: "/admin/products" },
];

export default async function AdminPanelLayout({ children }: Props) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/admin/login");
    }

    return (
        <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
            <Sidebar 
                brandLogoChar="S"
                brandTitle="Stallcons"
                brandSubtitle="Yönetici Paneli"
                items={adminNavItems}
            />
            
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Bar */}
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 backdrop-blur-md md:hidden">
                    <div className="flex items-center gap-3">
                        {/* Space placeholder for the fixed menu button */}
                        <div className="w-10" />
                        <span className="font-semibold text-zinc-900 dark:text-white">Stallcons Admin</span>
                    </div>
                </div>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
