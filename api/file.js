// 교사용: 이미지 내려받기 (Private 저장소도 비밀번호로 열람)
import { blobReady, isTeacher, readBlob, send } from "./_lib.js";

export default async function handler(req, res) {
  if (!isTeacher(req)) return send(res, 401, { error: "비밀번호가 맞지 않아요." });
  if (!blobReady()) return send(res, 503, { error: "Blob 저장소가 연결되지 않았어요." });
  const url = new URL(req.url, "http://x");
  const p = url.searchParams.get("p") || "";
  const access = url.searchParams.get("a") === "public" ? "public" : "private";
  if (!/^gifted\/img\/[\w.-]+$/.test(p)) return send(res, 400, { error: "잘못된 요청이에요." });
  try {
    const r = await readBlob(p, access);
    if (!r) return send(res, 404, { error: "파일이 없어요." });
    res.statusCode = 200;
    res.setHeader("Content-Type", r.contentType || "application/octet-stream");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.end(r.buf);
  } catch (e) {
    console.error(e);
    send(res, 500, { error: "파일을 열지 못했어요." });
  }
}
