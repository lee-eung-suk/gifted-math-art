// 교사용: 올라온 작품 목록 (비밀번호 필요)
import { list } from "@vercel/blob";
import { blobReady, isTeacher, readBlob, send } from "./_lib.js";

export default async function handler(req, res) {
  if (!isTeacher(req)) return send(res, 401, { error: "비밀번호가 맞지 않아요." });
  if (!blobReady()) return send(res, 503, { error: "Blob 저장소가 연결되지 않았어요." });

  try {
    const metas = [];
    let cursor;
    do {
      const r = await list({ prefix: "gifted/meta/", cursor, limit: 1000 });
      metas.push(...r.blobs);
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);

    const items = [];
    for (let i = 0; i < metas.length; i += 20) {
      const part = await Promise.all(metas.slice(i, i + 20).map(async b => {
        for (const access of ["private", "public"]) {
          try {
            const r = await readBlob(b.pathname, access);
            if (r) return { ...JSON.parse(r.buf.toString("utf8")), metaPath: b.pathname };
          } catch { /* 다른 접근 방식으로 다시 시도 */ }
        }
        return null;
      }));
      items.push(...part.filter(Boolean));
    }
    items.sort((a, b) => b.createdAt - a.createdAt);
    send(res, 200, { items });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: "목록을 불러오지 못했어요." });
  }
}
