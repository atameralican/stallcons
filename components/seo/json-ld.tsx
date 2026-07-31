type JsonLdProps = {
  data: Record<string, unknown>;
};

// json ld verisini güvenli script olarak basıyorum
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
