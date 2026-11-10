import { blobReady, send } from "./_lib.js";

export default function handler(req, res) {
  send(res, 200, {
    ready: blobReady(),
    needCode: Boolean(process.env.CLASS_CODE),
    teacherSet: Boolean(process.env.TEACHER_PASSWORD),
  });
}
