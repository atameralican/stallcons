import "server-only";

import { BASE_URL } from "@/lib/seo";

const INDEXNOW_KEY = "9cb360da-6e9d-4cfd-9506-8c2dccc0b6ab";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// içerik değişince arama motorlarına güncel adresleri bildiriyorum
export async function submitIndexNow(paths: string[]) {
  if (process.env.VERCEL_ENV !== "production") return;

  const urlList = [...new Set(paths)]
    .filter((path) => path.startsWith("/tr") || path.startsWith("/en"))
    .map((path) => `${BASE_URL}${path}`);

  if (urlList.length === 0) return;

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "www.stallcons.com",
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });

    if (!response.ok && response.status !== 202) {
      console.error("indexnow bildirimi başarısız", response.status);
    }
  } catch (error) {
    console.error("indexnow bildirimi gönderilemedi", error);
  }
}
