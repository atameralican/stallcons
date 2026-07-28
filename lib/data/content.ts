import "server-only";

import { cache } from "react";

import type { ActivityAreaRecord } from "@/app/admin/(panel)/faaliyet-alanlari/activity-area-admin-client";
import type { HizmetRecord } from "@/app/admin/(panel)/hizmetler/hizmet-admin-client";
import type { PartnerRecord } from "@/app/admin/(panel)/partners/partner-admin-client";
import type { ProjectRecord } from "@/app/admin/(panel)/projects/project-admin-client";
import { createClient } from "@/lib/supabase/server";

type DataResult<T> = {
    data: T;
    error?: string;
};

// proje sorgusunu aynı request içinde tek kez çalıştırıyorum
export const getProjectsData = cache(async (): Promise<DataResult<ProjectRecord[]>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .select(`
            id,
            slug,
            main_photo,
            year,
            weight_tons,
            sort_order,
            is_favorite,
            is_published,
            created_at,
            updated_at,
            project_translations (
                id,
                locale,
                title,
                description
            ),
            project_photos (
                id,
                url,
                alt,
                sort_order,
                created_at
            )
        `)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    return {
        data: (data ?? []) as ProjectRecord[],
        error: error?.message,
    };
});

// hizmet sorgusunu aynı request içinde tek kez çalıştırıyorum
export const getHizmetlerData = cache(async (): Promise<DataResult<HizmetRecord[]>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("hizmetler")
        .select(`
            id,
            is_published,
            created_at,
            updated_at,
            hizmet_translations (
                id,
                locale,
                title,
                description
            ),
            hizmet_photos (
                id,
                url,
                alt,
                sort_order,
                created_at
            )
        `)
        .order("created_at", { ascending: false })
        .order("sort_order", { foreignTable: "hizmet_photos", ascending: true });

    return {
        data: (data ?? []) as HizmetRecord[],
        error: error?.message,
    };
});

// partner sorgusunu aynı request içinde tek kez çalıştırıyorum
export const getPartnersData = cache(async (): Promise<DataResult<PartnerRecord[]>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    return {
        data: (data ?? []) as PartnerRecord[],
        error: error?.message,
    };
});

// faaliyet sorgusunu aynı request içinde tek kez çalıştırıyorum
export const getActivityAreasData = cache(
    async (): Promise<DataResult<ActivityAreaRecord[]>> => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("activity_areas")
            .select(`
                id,
                main_photo,
                is_active,
                sort_order,
                created_at,
                updated_at,
                activity_area_translations (
                    id,
                    locale,
                    title,
                    subtitle,
                    description,
                    slug,
                    created_at
                ),
                activity_area_photos (
                    id,
                    photo_url,
                    sort_order,
                    created_at
                )
            `)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false })
            .order("sort_order", {
                foreignTable: "activity_area_photos",
                ascending: true,
            });

        return {
            data: (data ?? []) as ActivityAreaRecord[],
            error: error?.message,
        };
    },
);
