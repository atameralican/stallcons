import type { PublicLocale } from "@/lib/seo";

type ActivitySeoContent = {
  title: string;
  description: string;
};

const ACTIVITY_SEO: Record<string, Record<PublicLocale, ActivitySeoContent>> = {
  "engineering-design": {
    tr: {
      title: "Çelik Yapı Mühendisliği ve Tasarım",
      description: "Çelik yapılar için statik hesap, yapısal analiz, 3D modelleme, uygulama ve imalat çizimleri sunan Stallcons mühendislik hizmetlerini inceleyin.",
    },
    en: {
      title: "Structural Engineering and Steel Design",
      description: "Explore Stallcons structural engineering services for steel structures, including structural analysis, 3D modeling, design development, and fabrication drawings.",
    },
  },
  "steel-construction": {
    tr: {
      title: "Çelik Konstrüksiyon İmalat ve Montaj",
      description: "Endüstriyel tesis, depo ve özel çelik yapılar için mühendislik, çelik konstrüksiyon imalatı, yurt dışı sevkiyat ve sahada montaj hizmetleri.",
    },
    en: {
      title: "Structural Steel Fabrication and Erection",
      description: "Structural steel engineering, fabrication, international delivery, and on-site erection services for industrial facilities, warehouses, and custom steel structures.",
    },
  },
  consulting: {
    tr: {
      title: "Çelik Yapı Mühendislik Danışmanlığı",
      description: "Çelik yapı projelerinde tasarım inceleme, teknik şartname, imalat ve montaj denetimi ile proje koordinasyonuna yönelik mühendislik danışmanlığı.",
    },
    en: {
      title: "Structural Steel Engineering Consulting",
      description: "Engineering consulting for structural steel projects, including design review, technical specifications, fabrication oversight, erection supervision, and project coordination.",
    },
  },
  "quality-control": {
    tr: {
      title: "Çelik Konstrüksiyon Kalite Kontrol",
      description: "Çelik konstrüksiyon üretiminde malzeme izlenebilirliği, kaynak kontrolleri, tahribatsız muayene ve proje dokümantasyonuna yönelik kalite kontrol hizmetleri.",
    },
    en: {
      title: "Structural Steel Quality Control",
      description: "Quality control services for structural steel fabrication, covering material traceability, weld inspection, non-destructive testing, and project documentation.",
    },
  },
  defense: {
    tr: {
      title: "Savunma Sanayii Çelik Yapıları",
      description: "Savunma ve stratejik tesis projeleri için yüksek hassasiyetli çelik yapı mühendisliği, imalat, kalite kontrol, sevkiyat ve sahada montaj çözümleri.",
    },
    en: {
      title: "Steel Structures for Defense Projects",
      description: "High-precision structural steel engineering, fabrication, quality control, international delivery, and on-site erection solutions for defense and strategic facility projects.",
    },
  },
  "mining-equipment-steel-structures": {
    tr: {
      title: "Maden Ekipmanları ve Çelik Yapılar",
      description: "Maden tesisleri için ağır hizmet tipi çelik yapılar, ekipman taşıyıcıları, platformlar ve zorlu çalışma koşullarına yönelik endüstriyel imalat çözümleri.",
    },
    en: {
      title: "Mining Equipment and Steel Structures",
      description: "Heavy-duty steel structures, equipment supports, platforms, and industrial fabrication solutions engineered for demanding mining facilities and operating conditions.",
    },
  },
};

export function getActivitySeo(
  locale: PublicLocale,
  slug: string,
  title: string,
  subtitle: string,
): ActivitySeoContent {
  return ACTIVITY_SEO[slug]?.[locale] ?? {
    title,
    description: subtitle,
  };
}
