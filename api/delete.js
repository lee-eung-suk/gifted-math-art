// 교사용: 작품 삭제 (이미지 + 정보 파일)
import { del } from "@vercel/blob";
import { blobReady, bodyOf, isTeacher, send } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "POST만 가능해요." });
  if (!isTeacher(req)) return send(res, 401, { error: "비밀번호가 맞지 않아요." });
  if (!blobReady()) return send(res, 503, { error: "Blob 저장소가 연결되지 않았어요." });
  const { imagePath, metaPath } = bodyOf(req);
  const ok = /^gifted\/img\/[\w.-]+$/.test(imagePath || "") && /^gifted\/meta\/[\w.-]+$/.test(metaPath || "");
  if (!ok) return send(res, 400, { error: "잘못된 요청이에요." });
  try {
    await del([imagePath, metaPath]);
    send(res, 200, { ok: true });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: "삭제하지 못했어요." });
  }
}
