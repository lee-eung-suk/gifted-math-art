// 학생 작품 올리기: 이미지 1장 + 정보(JSON)를 Blob 저장소에 저장
import { randomUUID } from "node:crypto";
import { ACTIVITIES, blobReady, bodyOf, clean, cleanMultiline, putAuto, send } from "./_lib.js";

const MAX_BYTES = 3 * 1024 * 1024; // 이미지 3MB (브라우저에서 미리 줄여서 보냄)

function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return ["image/jpeg", "jpg"];
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return ["image/png", "png"];
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return ["image/webp", "webp"];
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "POST만 가능해요." });
  if (!blobReady()) return send(res, 503, { error: "저장소가 아직 연결되지 않았어요. 선생님께 알려 주세요." });

  const body = bodyOf(req);
  if (process.env.CLASS_CODE && clean(body.code, 40) !== process.env.CLASS_CODE) {
    return send(res, 403, { error: "수업 코드가 맞지 않아요. 선생님께 다시 물어보세요." });
  }
  const name = clean(body.name, 20);
  if (!name) return send(res, 400, { error: "이름(별명)을 적어 주세요." });
  const activity = Object.hasOwn(ACTIVITIES, body.activity) ? body.activity : "etc";

  const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(body.image || ""));
  if (!m) return send(res, 400, { error: "이미지를 다시 골라 주세요." });
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_BYTES) return send(res, 413, { error: "이미지가 너무 커요." });
  const kind = sniff(buf);
  if (!kind) return send(res, 400, { error: "jpg · png · webp 이미지만 올릴 수 있어요." });

  try {
    const id = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const img = await putAuto(`gifted/img/${id}.${kind[1]}`, buf, kind[0]);
    const meta = {
      id, name, activity,
      group: clean(body.group, 20),
      desc: cleanMultiline(body.desc, 600),
      prompt: cleanMultiline(body.prompt, 1500),
      imagePath: img.pathname,
      access: img.access,
      ext: kind[1],
      createdAt: Date.now(),
    };
    await putAuto(`gifted/meta/${id}.json`, JSON.stringify(meta), "application/json");
    send(res, 200, { ok: true, id });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: "저장하지 못했어요. 잠시 뒤 다시 눌러 주세요." });
  }
}
