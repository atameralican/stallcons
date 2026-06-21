import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
    const supabase = await createClient();
    // upload admin panelinden geliyor oturumu burada kontrol ediyorum
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
    }

    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        // cloudinary bilgileri client tarafına gitmesin diye burada kontrol ediyorum
        return NextResponse.json(
            { error: "Cloudinary ortam değişkenleri eksik." },
            { status: 500 }
        );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    // panelden gelen klasör adını direkt kullanmıyorum
    const folder = sanitizeFolder(formData.get("folder"));

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Sadece görsel dosyaları yüklenebilir." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Dosya 2 MB sınırını aşıyor." }, { status: 400 });
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        // cloudinary stream istediği için buffer'a çeviriyorum
        const result = await uploadBuffer(buffer, folder);

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        });
    } catch (uploadError) {
        return NextResponse.json(
            {
                error:
                    uploadError instanceof Error
                        ? uploadError.message
                        : "Cloudinary yüklemesi başarısız oldu.",
            },
            { status: 500 }
        );
    }
}

function uploadBuffer(buffer: Buffer, folder: string) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                unique_filename: true,
                use_filename: true,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary yanıtı boş döndü."));
                    return;
                }

                resolve(result);
            }
        );

        stream.end(buffer);
    });
}

function sanitizeFolder(value: FormDataEntryValue | null) {
    const folder = typeof value === "string" ? value : "projects";

    // klasör yolu bozulmasın diye güvenli karakterleri bırakıyorum
    return folder
        .split("/")
        .map((part) => part.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-"))
        .filter(Boolean)
        .join("/") || "projects";
}
