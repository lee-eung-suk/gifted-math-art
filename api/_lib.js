// 공통 도우미: Vercel Blob 저장소 + 교사 비밀번호 확인
import { put, get } from "@vercel/blob";
import { timingSafeEqual } from "node:crypto";

export const ACTIVITIES = {
  block: "② 패턴블럭 작품",
  style: "③ 스타일 바꾸기",
  tess: "④ 테셀레이션",
  mug: "⑤ 컵 전사 도안",
  etc: "기타",
};

export function blobReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

// 저장소가 Private이면 private, Public이면 public으로 저장 (자동 판별)
let ACCESS = process.env.BLOB_ACCESS === "public" ? "public" : "private";
export async function putAuto(pathname, body, contentType) {
  try {
    return { ...(await put(pathname, body, { access: ACCESS, contentType, addRandomSuffix: true })), access: ACCESS };
  } catch (e) {
    const other = ACCESS === "private" ? "public" : "private";
    if (!/access|private|public/i.test(String(e && e.message))) throw e;
    const r = await put(pathname, body, { access: other, contentType, addRandomSuffix: true });
    ACCESS = other;
    return { ...r, access: other };
  }
}

export async function readBlob(pathname, access) {
  const r = await get(pathname, { access, useCache: false });
  if (!r || r.statusCode !== 200) return null;
  const chunks = [];
  for await (const c of r.stream) chunks.push(Buffer.from(c));
  return { buf: Buffer.concat(chunks), contentType: r.blob.contentType };
}

export function isTeacher(req) {
  const pw = process.env.TEACHER_PASSWORD || "";
  const got = String(req.headers["x-teacher-key"] || "");
  if (!pw || !got) return false;
  const a = Buffer.from(pw), b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function clean(s, max) {
  return String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

export function cleanMultiline(s, max) {
  return String(s ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ").trim().slice(0, max);
}

export function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}

export function bodyOf(req) {
  if (typeof req.body === "string") { try { return JSON.parse(req.body || "{}"); } catch { return {}; } }
  return req.body || {};
}
