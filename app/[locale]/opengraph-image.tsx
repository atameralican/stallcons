import { ImageResponse } from "next/og";

export const alt = "Stallcons Steel Construction";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string }>;
};

// sosyal paylaşımlarda aynı kurumsal kartı kullanıyorum
export default async function OpenGraphImage({ params }: Props) {
  const { locale } = await params;
  const tagline = locale === "tr"
    ? "Mühendislik  •  İmalat  •  Montaj"
    : "Engineering  •  Fabrication  •  Erection";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "76px 88px",
        color: "white",
        background: "linear-gradient(135deg, #0b1f3a 0%, #123f82 58%, #1e50a0 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 112, fontWeight: 800, letterSpacing: -6 }}>
        stallcons
      </div>
      <div style={{ display: "flex", marginTop: 8, fontSize: 34, fontWeight: 600, letterSpacing: 16 }}>
        STEEL CONSTRUCTION
      </div>
      <div style={{ display: "flex", width: 180, height: 5, marginTop: 50, background: "#79aaf2" }} />
      <div style={{ display: "flex", marginTop: 30, fontSize: 31, color: "#dce9fb" }}>
        {tagline}
      </div>
    </div>,
    size,
  );
}
