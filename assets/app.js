/* 수학영재반 — 패턴블럭 · 생성형 AI · 테셀레이션 컵 */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SVGNS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const R3 = Math.sqrt(3);

/* ---------- 한국어 조사 ---------- */
function hasBatchim(word) {
  const w = String(word).replace(/\([^)]*\)\s*$/, "").trim();
  const c = w.charCodeAt(w.length - 1);
  if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0;
  return /[136780lmnr]$/i.test(w);
}
const josa = (w, a, b) => w + (hasBatchim(w) ? a : b);

/* ---------- 복사 ---------- */
function copyText(text, btn) {
  const done = () => { const t = btn.textContent; btn.textContent = "복사됨!"; btn.classList.add("done"); setTimeout(() => { btn.textContent = t === "복사됨!" ? "복사" : t; btn.classList.remove("done"); }, 1500); };
  const fallback = () => {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.append(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch { btn.textContent = "Ctrl+C"; }
    ta.remove();
  };
  try { navigator.clipboard.writeText(text).then(done, fallback); } catch { fallback(); }
}
function promptCard(label, text) {
  const wrap = document.createElement("div"); wrap.className = "prompt";
  const head = document.createElement("header");
  const sp = document.createElement("span"); sp.textContent = label;
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "copy"; btn.textContent = "복사";
  btn.setAttribute("aria-label", label + " 프롬프트 복사");
  btn.addEventListener("click", () => copyText(text, btn));
  head.append(sp, btn);
  const pre = document.createElement("pre"); pre.textContent = text;
  wrap.append(head, pre);
  return wrap;
}

/* =========================================================
   ① 꼭짓점 실험실
   ========================================================= */
const POLY_COL = { 3: "--tri", 4: "--sq", 5: "--vio", 6: "--hex", 8: "--rho", 10: "--tan", 12: "--trap" };
const vState = [];
const interior = n => 180 * (n - 2) / n;
function polyAtVertex(n, startDeg, L) {
  const pts = [[0, 0]]; let x = 0, y = 0, dir = startDeg;
  for (let i = 0; i < n - 1; i++) {
    x += L * Math.cos(dir * Math.PI / 180); y += L * Math.sin(dir * Math.PI / 180);
    pts.push([x, y]); dir += 360 / n;
  }
  return pts.map(([a, b]) => `${a.toFixed(2)},${(-b).toFixed(2)}`).join(" ");
}
function renderVertex() {
  const svg = $("#vertexSvg"); svg.textContent = "";
  const maxN = vState.length ? Math.max(...vState) : 3;
  const L = Math.min(120, 180 * Math.sin(Math.PI / maxN));
  let ang = 0;
  vState.forEach((n, i) => {
    const a = interior(n);
    const over = ang + a > 360.001;
    svg.append(svgEl("polygon", { points: polyAtVertex(n, ang, L), fill: `var(${POLY_COL[n] || "--vio"})`, "fill-opacity": over ? .45 : .9, stroke: over ? "var(--trap)" : "var(--fg)", "stroke-width": over ? 3 : 1.5, "stroke-linejoin": "round" }));
    ang += a;
  });
  const sum = vState.reduce((s, n) => s + interior(n), 0);
  if (sum < 360 && vState.length) {
    const r = 40, a0 = sum * Math.PI / 180;
    const big = 360 - sum > 180 ? 1 : 0;
    svg.append(svgEl("path", { d: `M0 0 L${r * Math.cos(a0)} ${-r * Math.sin(a0)} A${r} ${r} 0 ${big} 1 ${r} 0 Z`, fill: "var(--trap)", "fill-opacity": .25, stroke: "var(--trap)", "stroke-dasharray": "4 3" }));
  }
  svg.append(svgEl("circle", { cx: 0, cy: 0, r: 5, fill: "var(--fg)" }));
  const out = $("#vertexSum"), msg = $("#vertexMsg");
  const s = Math.round(sum * 100) / 100;
  out.textContent = `${s}°`;
  out.className = "sum" + (Math.abs(sum - 360) < .01 ? " ok" : sum > 360 ? " over" : "");
  msg.textContent = !vState.length ? "도형 버튼을 눌러 한 점에 붙여 보세요."
    : Math.abs(sum - 360) < .01 ? "딱 360°! 빈틈도 겹침도 없어요. 이 조합은 꼭짓점을 완성해요."
    : sum > 360 ? `${Math.round((sum - 360) * 100) / 100}°만큼 겹쳐요. 하나 빼 볼까요?`
    : `${Math.round((360 - sum) * 100) / 100}°가 비어 있어요.`;
  const seq = $("#vertexSeq"); seq.textContent = "";
  vState.forEach(n => { const sp = document.createElement("span"); sp.textContent = `정${n}각형 ${Math.round(interior(n) * 100) / 100}°`; seq.append(sp); });
}
function initVertex() {
  const names = { 3: "정삼각형", 4: "정사각형", 5: "정오각형", 6: "정육각형", 8: "정팔각형", 10: "정십각형", 12: "정십이각형" };
  const box = $("#vertexBtns");
  Object.keys(names).forEach(n => {
    const b = document.createElement("button"); b.type = "button"; b.className = "tbtn";
    b.innerHTML = `<span class="pb" style="background:var(${POLY_COL[n]});clip-path:${clipFor(+n)}"></span>`;
    b.append(names[n]);
    b.addEventListener("click", () => { if (vState.length < 8) { vState.push(+n); renderVertex(); } });
    box.append(b);
  });
  $("#vertexUndo").addEventListener("click", () => { vState.pop(); renderVertex(); });
  $("#vertexClear").addEventListener("click", () => { vState.length = 0; renderVertex(); });
  $$("[data-combo]").forEach(b => b.addEventListener("click", () => { vState.length = 0; vState.push(...b.dataset.combo.split(",").map(Number)); renderVertex(); }));
  renderVertex();

  const tb = $("#angleTable tbody");
  [3, 4, 5, 6, 7, 8, 10, 12].forEach(n => {
    const a = interior(n), q = 360 / a;
    const tr = document.createElement("tr");
    const fmt = v => Number.isInteger(Math.round(v * 1000) / 1000) ? String(Math.round(v)) : v.toFixed(2);
    const cells = [`정${n}각형`, `${fmt(a)}°`, fmt(q), Number.isInteger(Math.round(q * 1000) / 1000) ? "⭕ 된다" : "❌ 안 된다"];
    cells.forEach((c, i) => {
      const td = document.createElement("td");
      if (i === 0) td.textContent = c;
      else {
        td.className = "q";
        const btn = document.createElement("button"); btn.type = "button"; btn.className = "chip"; btn.textContent = "?";
        btn.setAttribute("aria-label", `정${n}각형 ${["", "한 내각", "360 나누기 내각", "혼자 채우기"][i]} 보기`);
        btn.addEventListener("click", () => { td.textContent = c; });
        td.append(btn);
      }
      tr.append(td);
    });
    tb.append(tr);
  });
}
function clipFor(n) {
  const pts = [];
  for (let i = 0; i < n; i++) { const t = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push(`${50 + 46 * Math.cos(t)}% ${50 + 46 * Math.sin(t)}%`); }
  return `polygon(${pts.join(",")})`;
}

/* =========================================================
   ② 패턴블럭 작업판
   ========================================================= */
const S = 56; // 한 변의 길이
const H = S * R3 / 2;
const c30 = Math.cos(Math.PI / 6), s30 = Math.sin(Math.PI / 6);
const SHAPES = {
  hex: { pts: [...Array(6)].map((_, i) => [S * Math.cos(i * Math.PI / 3), S * Math.sin(i * Math.PI / 3)]), col: "--hex", area: 6, name: "육각형" },
  trap: { pts: [[0, 0], [2 * S, 0], [1.5 * S, -H], [0.5 * S, -H]], col: "--trap", area: 3, name: "사다리꼴" },
  rho: { pts: [[0, 0], [S, 0], [1.5 * S, -H], [0.5 * S, -H]], col: "--rho", area: 2, name: "마름모" },
  tri: { pts: [[0, 0], [S, 0], [S / 2, -H]], col: "--tri", area: 1, name: "삼각형" },
  sq: { pts: [[0, 0], [S, 0], [S, -S], [0, -S]], col: "--sq", area: 4 / R3, name: "정사각형" },
  tan: { pts: [[0, 0], [S, 0], [S + S * c30, -S * s30], [S * c30, -S * s30]], col: "--tan", area: 2 / R3, name: "얇은 마름모" },
};
const PNAME = { hex: "정육각형", trap: "사다리꼴", rho: "마름모", tri: "정삼각형", sq: "정사각형", tan: "얇은 마름모" };
for (const k in SHAPES) { // 무게중심을 원점으로
  const p = SHAPES[k].pts, cx = p.reduce((s, q) => s + q[0], 0) / p.length, cy = p.reduce((s, q) => s + q[1], 0) / p.length;
  SHAPES[k].pts = p.map(([x, y]) => [x - cx, y - cy]);
}
const EXTRA_COLORS = ["#ffc23d", "#ff6b6b", "#4f8ff7", "#2ec4a0", "#ff9f43", "#d9b98c", "#8b7bff", "#ff8fc7", "#2b3050", "#ffffff"];
let pieces = [], selId = null, nextId = 1, snapOn = true;
let vtx = null; // 회전 손잡이를 띄운 꼭짓점 {id, i}
const hist = [];
const pushHist = () => { hist.push(JSON.stringify(pieces)); if (hist.length > 60) hist.shift(); };

function worldPts(p) {
  const sh = SHAPES[p.type], t = p.rot * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  return sh.pts.map(([x, y]) => { if (p.flip) x = -x; return [p.x + x * c - y * s, p.y + x * s + y * c]; });
}
function fillOf(p) { return p.color || cssVar(SHAPES[p.type].col); }

function renderBlocks() {
  const svg = $("#blockSvg"); svg.textContent = "";
  pieces.forEach(p => {
    const g = svgEl("g", { class: "piece" + (p.id === selId ? " sel" : ""), "data-id": p.id });
    g.append(svgEl("polygon", { points: worldPts(p).map(q => q.join(",")).join(" "), fill: fillOf(p), stroke: "rgba(0,0,0,.35)", "stroke-width": 1.5, "stroke-linejoin": "round" }));
    svg.append(g);
  });
  const vi = vtxInfo();
  if (vi) { // 꼭짓점 회전 손잡이
    const [vx, vy] = vi.v, px = -vi.dy, py = vi.dx, cl = (a, lo, hi) => Math.max(lo, Math.min(hi, a));
    const g = svgEl("g", { class: "vh" });
    g.append(svgEl("circle", { class: "vh-dot", cx: vx, cy: vy, r: 7 }));
    [[-30, "↺", -1], [30, "↻", 1]].forEach(([deg, lab, side]) => {
      const bx = cl(vx + vi.dx * 34 + px * 22 * side, 20, 880), by = cl(vy + vi.dy * 34 + py * 22 * side, 20, 580);
      const b = svgEl("g", { class: "vh-btn", "data-rot": deg });
      const t = svgEl("title"); t.textContent = deg < 0 ? "이 꼭짓점을 중심으로 왼쪽으로 30°" : "이 꼭짓점을 중심으로 오른쪽으로 30°";
      const tx = svgEl("text", { x: bx, y: by }); tx.textContent = lab;
      b.append(t, svgEl("circle", { cx: bx, cy: by, r: 19 }), tx); g.append(b);
    });
    svg.append(g);
  }
  $("#blockHint").hidden = pieces.length > 0;
  $("#blockCount").textContent = `블록 ${pieces.length}개`;
  const area = pieces.reduce((s, p) => s + SHAPES[p.type].area, 0);
  $("#blockArea").textContent = Number.isInteger(Math.round(area * 100) / 100) ? Math.round(area) : `약 ${area.toFixed(1)}`;
  $$("#blockBar [data-act]").forEach(b => { if (["rotL", "rotR", "flipH", "flipV", "dup", "del", "color"].includes(b.dataset.act)) b.disabled = selId == null; });
  $("#blockBar [data-act=undo]").disabled = !hist.length;
  try { localStorage.setItem("gifted-board", JSON.stringify(pieces)); } catch {}
  savedNote();
}
function svgPoint(evt) {
  const svg = $("#blockSvg"), pt = svg.createSVGPoint();
  pt.x = evt.clientX; pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function snapPiece(p) {
  if (!snapOn) return;
  const mine = worldPts(p); let best = null;
  pieces.forEach(o => {
    if (o.id === p.id) return;
    worldPts(o).forEach(v => mine.forEach(m => {
      const d = Math.hypot(v[0] - m[0], v[1] - m[1]);
      if (d < 18 && (!best || d < best.d)) best = { d, dx: v[0] - m[0], dy: v[1] - m[1] };
    }));
  });
  if (best) { p.x += best.dx; p.y += best.dy; }
}
function vtxInfo() {
  if (!vtx) return null;
  const p = pieces.find(q => q.id === vtx.id); if (!p) return null;
  const v = worldPts(p)[vtx.i]; if (!v) return null;
  if (vtx.dx != null) return { p, v, dx: vtx.dx, dy: vtx.dy }; // 돌리는 동안 버튼 위치 고정
  const L = Math.hypot(v[0] - p.x, v[1] - p.y) || 1;
  return { p, v, dx: (v[0] - p.x) / L, dy: (v[1] - p.y) / L };
}
function hitVertex(pt, r) { // 선택된 블록 → 위에 있는 블록 순서로 가까운 꼭짓점 찾기
  const order = [...pieces].reverse().sort((a, b) => (b.id === selId) - (a.id === selId));
  let best = null;
  for (const p of order) worldPts(p).forEach((v, i) => {
    const d = Math.hypot(v[0] - pt.x, v[1] - pt.y);
    if (d < r && (!best || d < best.d - 0.5)) best = { id: p.id, i, d };
  });
  return best && { id: best.id, i: best.i };
}
function rotateAbout(p, i, deg) { // 꼭짓점 i를 중심으로 돌리기 (꼭짓점은 제자리)
  pushHist();
  const [vx, vy] = worldPts(p)[i], t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  const ox = p.x - vx, oy = p.y - vy;
  p.x = vx + ox * c - oy * s; p.y = vy + ox * s + oy * c;
  p.rot = ((p.rot + deg) % 360 + 360) % 360;
}
function addPiece(type) {
  pushHist();
  const n = pieces.length;
  const p = { id: nextId++, type, x: 450 + ((n * 37) % 160) - 80, y: 300 + ((n * 23) % 120) - 60, rot: 0, flip: false, color: null };
  pieces.push(p); selId = p.id; renderBlocks();
}
function act(a) {
  const p = pieces.find(q => q.id === selId);
  if (a === "snap") { snapOn = !snapOn; $("#blockBar [data-act=snap]").setAttribute("aria-pressed", snapOn); return; }
  if (a === "undo") { if (hist.length) { pieces = JSON.parse(hist.pop()); if (!pieces.find(q => q.id === selId)) selId = null; renderBlocks(); } return; }
  if (a === "clear") { if (pieces.length && confirmClear()) { pushHist(); pieces = []; selId = null; renderBlocks(); } return; }
  if (!p) return;
  pushHist();
  if (a === "rotL") p.rot = (p.rot - 30 + 360) % 360;
  if (a === "rotR") p.rot = (p.rot + 30) % 360;
  // 뒤집기는 화면 기준 축으로: 좌우 = 세로축 대칭, 상하 = 가로축 대칭
  if (a === "flipH") { p.flip = !p.flip; p.rot = (360 - p.rot) % 360; }
  if (a === "flipV") { p.flip = !p.flip; p.rot = (540 - p.rot) % 360; }
  if (a === "del") { pieces = pieces.filter(q => q !== p); selId = null; }
  if (a === "dup") { const c = { ...p, id: nextId++, x: p.x + 30, y: p.y + 30 }; pieces.push(c); selId = c.id; }
  if (a === "color") { const cur = p.color ? EXTRA_COLORS.indexOf(p.color) : -1; p.color = cur >= EXTRA_COLORS.length - 1 ? null : EXTRA_COLORS[cur + 1]; }
  if (["rotL", "rotR", "flipH", "flipV"].includes(a)) snapPiece(p);
  if (a !== "color") vtx = null;
  renderBlocks();
}
let clearArmed = 0;
function confirmClear() { // 대화상자 없이 두 번 누르기로 확인
  const b = $("#blockBar [data-act=clear]");
  if (Date.now() - clearArmed < 2500) { b.textContent = "모두 지우기"; return true; }
  clearArmed = Date.now(); b.textContent = "한 번 더 누르면 지워요"; setTimeout(() => { b.textContent = "모두 지우기"; }, 2500);
  return false;
}
function initBlocks() {
  const svg = $("#blockSvg"); svg.setAttribute("tabindex", "0");
  $$("#blockBar [data-add]").forEach(b => b.addEventListener("click", () => addPiece(b.dataset.add)));
  $$("#blockBar [data-act]").forEach(b => b.addEventListener("click", () => act(b.dataset.act)));
  let drag = null, lastSpin = 0;
  svg.addEventListener("pointerdown", e => {
    const btn = e.target.closest(".vh-btn"), vi = vtxInfo();
    if (btn && vi) { // 꼭짓점 중심 회전
      e.preventDefault(); lastSpin = Date.now();
      vtx = { ...vtx, dx: vi.dx, dy: vi.dy }; rotateAbout(vi.p, vtx.i, +btn.dataset.rot); selId = vi.p.id; renderBlocks(); return;
    }
    const vhit = hitVertex(svgPoint(e), e.pointerType === "mouse" ? 12 : 22);
    vtx = null;
    let g = e.target.closest(".piece");
    if (!g && vhit) { selId = vhit.id; vtx = vhit; renderBlocks(); return; } // 블록 바깥쪽 꼭짓점 근처를 눌렀을 때
    if (!g) { selId = null; renderBlocks(); return; }
    const p = pieces.find(q => q.id === +g.dataset.id); if (!p) return;
    pushHist();
    // 맨 위로
    pieces = pieces.filter(q => q !== p); pieces.push(p);
    selId = p.id;
    const pt = svgPoint(e); drag = { p, dx: pt.x - p.x, dy: pt.y - p.y, moved: false, vhit };
    svg.setPointerCapture(e.pointerId); renderBlocks(); e.preventDefault();
  });
  svg.addEventListener("pointermove", e => {
    if (!drag) { // 마우스: 꼭짓점에 올리면 회전 버튼 보이기
      if (e.pointerType !== "mouse" || e.target.closest(".vh-btn")) return;
      const pt = svgPoint(e), h = hitVertex(pt, 12), vi = vtxInfo();
      if (h) { if (!vtx || h.id !== vtx.id || h.i !== vtx.i) { vtx = h; renderBlocks(); } }
      else if (vi && Math.hypot(pt.x - vi.v[0], pt.y - vi.v[1]) > 70) { vtx = null; renderBlocks(); }
      return;
    }
    const pt = svgPoint(e);
    drag.p.x = Math.max(0, Math.min(900, pt.x - drag.dx)); drag.p.y = Math.max(0, Math.min(600, pt.y - drag.dy)); drag.moved = true;
    renderBlocks();
  });
  const end = () => { if (!drag) return; if (drag.moved) snapPiece(drag.p); else { hist.pop(); if (drag.vhit) vtx = drag.vhit; } drag = null; renderBlocks(); };
  svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
  svg.addEventListener("pointerleave", e => { if (e.pointerType === "mouse" && !drag && vtx) { vtx = null; renderBlocks(); } });
  svg.addEventListener("dblclick", e => { if (Date.now() - lastSpin < 700 || vtx) return; if (e.target.closest(".piece")) act("rotR"); });
  svg.addEventListener("keydown", e => {
    const p = pieces.find(q => q.id === selId);
    const k = e.key.toLowerCase();
    if (p && k.startsWith("arrow")) { e.preventDefault(); const d = e.shiftKey ? 20 : 4; if (k === "arrowleft") p.x -= d; if (k === "arrowright") p.x += d; if (k === "arrowup") p.y -= d; if (k === "arrowdown") p.y += d; renderBlocks(); return; }
    const map = { q: "rotL", e: "rotR", f: "flipH", v: "flipV", d: "dup", delete: "del", backspace: "del" };
    if (map[k]) { e.preventDefault(); act(map[k]); }
    if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); act("undo"); }
  });
  $("#blockPng").addEventListener("click", () => {
    const u = blocksToDataURL(); if (!u) { flash($("#blockPng"), "블록이 없어요"); return; }
    if (!needTarget()) return;
    saveMyBlock();
    download(u, `패턴블럭_${$("#bTarget").value.trim()}.png`);
  });
  $("#blockSend").addEventListener("click", () => {
    const u = blocksToDataURL(), t = $("#bTarget").value.trim();
    if (!u) { // 실물 블록 사진으로 제출
      openSend({ act: "block", desc: t ? `${t}\n` : "", pickText: "블록판이 비어 있어요. 실물 블록으로 만든 작품 사진을 골라 주세요." });
      return;
    }
    if (t) saveMyBlock();
    openSend({ act: "block", image: u, desc: `${t ? t + " — " : ""}사용한 블록: ${countText(blockCounts())} (모두 ${pieces.length}개)\n`, pickText: "실물 블록 사진을 보내려면 여기서 다시 고르기" });
  });
  $("#bTarget").addEventListener("input", savedNote);
  try { const b = JSON.parse(localStorage.getItem("gifted-board") || "[]"); if (Array.isArray(b) && b.length) { pieces = b; nextId = Math.max(...b.map(p => p.id)) + 1; } } catch {}
  try { myBlock = JSON.parse(localStorage.getItem("gifted-myblock") || "null"); } catch {}
  if (myBlock && myBlock.target) $("#bTarget").value = myBlock.target;
  renderBlocks();
}
function blocksCanvas(scale = 3, pad = 24, bg = "#ffffff") {
  if (!pieces.length) return null;
  const all = pieces.flatMap(worldPts);
  const minX = Math.min(...all.map(p => p[0])) - pad, minY = Math.min(...all.map(p => p[1])) - pad;
  const w = Math.max(...all.map(p => p[0])) + pad - minX, h = Math.max(...all.map(p => p[1])) + pad - minY;
  const cv = document.createElement("canvas"); cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
  const ctx = cv.getContext("2d");
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.scale(scale, scale); ctx.translate(-minX, -minY); ctx.lineJoin = "round";
  pieces.forEach(p => {
    const pts = worldPts(p); ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = fillOf(p); ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1.5; ctx.stroke();
  });
  return cv;
}
const blocksToDataURL = () => { const c = blocksCanvas(); return c ? c.toDataURL("image/png") : null; };

/* ---------- ② 에서 저장한 내 작품 (③ 프롬프트에 반영) ---------- */
let myBlock = null;
function blockCounts() {
  return Object.keys(SHAPES).map(k => [PNAME[k], pieces.filter(p => p.type === k).length]).filter(x => x[1]);
}
const countText = counts => counts.map(([n, c]) => `${n} ${c}개`).join(", ");
const boardSig = () => JSON.stringify(pieces.map(p => [p.type, Math.round(p.x), Math.round(p.y), p.rot, p.flip]));
function needTarget() {
  if ($("#bTarget").value.trim()) return true;
  const n = $("#blockSaved"); n.textContent = "먼저 “무엇을 만들었나요?” 칸을 적어 주세요."; n.className = "warn";
  $("#bTarget").focus(); return false;
}
function saveMyBlock() {
  const c = blocksCanvas(1.5);
  const rec = { target: $("#bTarget").value.trim(), counts: blockCounts(), total: pieces.length, sig: boardSig(), img: c ? c.toDataURL("image/jpeg", .85) : null, t: Date.now() };
  myBlock = rec;
  try { localStorage.setItem("gifted-myblock", JSON.stringify(rec)); }
  catch { try { localStorage.setItem("gifted-myblock", JSON.stringify({ ...rec, img: null })); } catch {} }
  applyMyBlockToStyle(true);
  savedNote();
}
function savedNote() {
  const n = $("#blockSaved"); if (!n) return;
  n.className = "";
  if (!myBlock) { n.textContent = "💾 저장하면 ③ 다른 스타일로의 프롬프트에 작품 이름과 블록 개수가 자동으로 들어가요."; return; }
  const changed = myBlock.sig !== boardSig() || myBlock.target !== $("#bTarget").value.trim();
  if (changed && pieces.length) { n.textContent = "블록판이 저장한 뒤로 바뀌었어요. 다시 💾 저장하면 ③ 프롬프트도 새로 바뀌어요."; n.className = "warn"; }
  else { n.textContent = `✓ 저장했어요: ${myBlock.target} · ${countText(myBlock.counts)} — ③ 프롬프트에 반영됐어요.`; n.className = "okc"; }
}

/* =========================================================
   ③ 스타일 바꾸기 — 프롬프트
   ========================================================= */
const STYLES = [
  ["지브리", "부드러운 선과 따뜻한 색감, 몽환적인 분위기"],
  ["레고", "블록으로 만든 듯한 각진 형태와 선명한 색"],
  ["픽셀 아트", "작은 사각형 픽셀로 이루어진 도트 그래픽"],
  ["카툰", "과장된 형태, 뚜렷한 윤곽선, 밝은 색"],
  ["수채화", "물감이 번진 듯 부드러운 색"],
  ["스케치", "연필 · 펜으로 그린 듯한 선"],
  ["3D 렌더링", "실제 같은 질감과 빛, 입체감"],
  ["미니멀리즘", "최소한의 선과 색으로 핵심만"],
  ["동양화", "여백의 미와 먹의 농담, 차분함"],
  ["사이버펑크", "네온사인과 미래 도시 느낌"],
  ["종이접기", "접힌 종이의 면과 그림자"],
  ["찰흙(클레이)", "말랑한 점토로 빚은 느낌"],
  ["스테인드글라스", "검은 테두리 안의 빛나는 유리 조각"],
  ["모자이크", "작은 타일 조각을 붙인 느낌"],
];
const STYLE_PROMPTS = [
  ["기본 — 스타일 바꾸기", "첨부한 사진은 내가 패턴블럭으로 만든 [물고기]야.\n[지브리] 스타일로 바꿔 줘.\n[바닷속] 배경을 넣어 줘."],
  ["수학 지키기 — 모양 · 개수 그대로", "첨부한 사진은 패턴블럭으로 만든 [토끼]야.\n블록의 모양, 개수, 배치는 그대로 두고\n질감만 [레고 블록]처럼 바꿔 줘. 도형의 변이 곧게 보이게."],
  ["스타일 섞기", "첨부한 패턴블럭 [로봇]을\n[픽셀 아트]와 [수채화] 스타일을 섞어서 다시 그려 줘.\n정육각형 몸통이 잘 보이게."],
  ["도형 경계 살리기 (영재)", "첨부한 패턴블럭 [공룡]을 [3D 렌더링] 스타일로 바꿔 줘.\n사용한 도형(정육각형, 사다리꼴, 마름모, 정삼각형)의 경계가 보이도록\n얇은 흰 선을 남겨 줘."],
  ["틀린 곳 고치기", "[귀]의 마름모 개수가 달라졌어.\n처음 사진처럼 마름모 2개로 다시 그려 줘. 나머지는 그대로 둬."],
  ["컵에 넣기 좋게", "이 그림을 머그컵에 넣을 거야.\n가로:세로 2:1 비율로, 양옆에 배경을 자연스럽게 이어 그려 줘.\n글자는 넣지 마."],
];
const TESS_PROMPTS = [
  ["테셀레이션 공식", "[정육각형]을 기본으로 한 테셀레이션 무늬를 만들어 줘.\n[귀여운 고양이] 모양이 빈틈과 겹침 없이 반복되고,\n[무지개 6가지 색]으로, 정사각형 이미지로."],
  ["에셔처럼", "에셔처럼 [도마뱀]이 서로 맞물려 평면을 빈틈없이 채우는 테셀레이션을 그려 줘.\n[돌리기(회전이동)]로 반복하고, [흑백 판화] 느낌으로."],
  ["바꿔 보기", "[정삼각형]을 기본으로 한 테셀레이션 무늬를 만들어 줘.\n[물고기] 모양이 [돌리기]로 빈틈과 겹침 없이 반복되고,\n[파스텔 수채화] 스타일로."],
  ["두 가지 도형 (영재)", "정육각형과 정삼각형을 한 꼭짓점에 3·6·3·6 순서로 배열한 테셀레이션 무늬를 만들어 줘.\n정육각형 안에는 [별], 정삼각형 안에는 [달]을 그려 줘.\n[밤하늘] 색으로."],
  ["컵 전사용", "머그컵에 감을 테셀레이션 무늬를 만들어 줘.\n가로:세로 2:1, 왼쪽 끝과 오른쪽 끝이 자연스럽게 이어지게.\n[펭귄] 모양이 빈틈없이 반복되고, 가장자리까지 꽉 차게, 글자 없이."],
  ["틀린 곳 고치기", "빈틈이 보이는 곳이 있어.\n모든 [고양이]가 같은 크기로, 변끼리 딱 맞물리게 다시 그려 줘."],
  ["영어 프롬프트", "A seamless tessellation pattern of [cute cats] based on a [regular hexagon] grid,\nno gaps and no overlaps, [rainbow colors], flat illustration, 2:1 wide, no text."],
];
function chipGroup(box, onChange, max = 99) {
  const single = box.hasAttribute("data-single");
  box.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    if (single) { $$(".chip", box).forEach(c => c.setAttribute("aria-pressed", c === b)); }
    else {
      const on = b.getAttribute("aria-pressed") === "true";
      const cnt = $$('.chip[aria-pressed="true"]', box).length;
      if (!on && cnt >= max) { const first = $('.chip[aria-pressed="true"]', box); first && first.setAttribute("aria-pressed", "false"); }
      b.setAttribute("aria-pressed", !on);
    }
    onChange();
  });
}
const chosen = box => $$('.chip[aria-pressed="true"]', box).map(c => c.dataset.v);
let styleBuild = () => {};
function applyMyBlockToStyle(force) {
  const box = $("#myWork"); if (!box) return;
  box.textContent = "";
  if (myBlock) {
    if (force || !$("#sTarget").value.trim()) $("#sTarget").value = myBlock.target;
    if (force) $$('#styleBuilder [data-key="form"] .chip').forEach((c, i) => c.setAttribute("aria-pressed", i === 0));
    if (myBlock.img) { const im = document.createElement("img"); im.src = myBlock.img; im.alt = "②에서 저장한 내 패턴블럭 작품"; box.append(im); }
    const d = document.createElement("div");
    d.innerHTML = `<small>②에서 저장한 내 작품</small><b></b><span class="small"></span><p class="small muted">제미나이에는 이 그림(내 기기에 저장한 파일)을 올려요. 바꾸고 싶으면 ②에서 다시 💾 저장하세요.</p>`;
    d.querySelector("b").textContent = myBlock.target; d.querySelector("span").textContent = `${countText(myBlock.counts)} (모두 ${myBlock.total}개)`;
    box.append(d);
  } else {
    const d = document.createElement("div");
    d.innerHTML = `<small>아직 ②에서 저장한 작품이 없어요</small><p class="small">② 블록판에서 <b>💾 내 기기에 저장</b>을 누르면 작품 이름과 블록 개수가 아래 프롬프트에 자동으로 들어가요. 실물 블록 사진이면 ② 대상 칸에 직접 적어요.</p><a class="btn ghost" href="#blocks">② 블록판으로 가기</a>`;
    box.append(d);
  }
  styleBuild();
}
function initStyle() {
  const sc = $("#styleChips");
  STYLES.forEach(([n, d], i) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = n; b.dataset.v = n; b.dataset.d = d; b.setAttribute("aria-pressed", i === 0); sc.append(b); });
  const build = () => {
    const form = chosen($('#styleBuilder [data-key="form"]'))[0] || "";
    const target = $("#sTarget").value.trim() || "작품";
    const st = chosen(sc);
    const extra = $("#sExtra").value.trim();
    const styleTxt = st.length ? (st.length === 2 ? josa(st[0], "과", "와") + " " + st[1] + " 스타일을 섞어서" : st[0] + " 스타일로") : "다른 스타일로";
    const lines = [`${form} ${josa(target, "이야", "야")}.`];
    const isBlock = form.includes("패턴블럭");
    $("#sCountWrap").hidden = !(myBlock && myBlock.counts.length && isBlock);
    if (!$("#sCountWrap").hidden && $("#sCount").checked) lines.push(`블록은 ${countText(myBlock.counts)}, 모두 ${myBlock.total}개를 썼어.`);
    if ($("#sKeep").checked) lines.push("도형의 모양, 개수, 배치는 그대로 지켜 줘.");
    lines.push(`${styleTxt} 바꿔 줘.`);
    if (extra) lines.push(`추가로: ${extra}`);
    $("#styleOut").textContent = lines.join("\n");
    $("#styleDesc").textContent = $$('.chip[aria-pressed="true"]', sc).map(c => `${c.dataset.v}: ${c.dataset.d}`).join(" · ");
  };
  chipGroup($('#styleBuilder [data-key="form"]'), build);
  chipGroup(sc, build, 2);
  ["#sTarget", "#sExtra", "#sKeep", "#sCount"].forEach(s => $(s).addEventListener("input", build));
  styleBuild = build;
  $("#styleSend").addEventListener("click", () => {
    const t = $("#sTarget").value.trim(), st = chosen(sc).join("+");
    openSend({ act: "style", prompt: $("#styleOut").textContent, desc: `${t || "내 작품"}${st ? ` — ${st} 스타일` : ""}\n`, pickText: "제미나이에서 저장한 결과 그림을 골라 주세요." });
  });
  applyMyBlockToStyle(false);
  $("#styleCopy").addEventListener("click", e => copyText($("#styleOut").textContent, e.currentTarget));
  build();
  const box = $("#stylePrompts"); STYLE_PROMPTS.forEach(([l, t]) => box.append(promptCard(l, t)));
}
function initTessBuilder() {
  const build = () => {
    const shape = chosen($('#tessBuilder [data-key="shape"]'))[0];
    const subj = $("#tSubject").value.trim() || "고양이";
    const move = chosen($('#tessBuilder [data-key="move"]'))[0];
    const style = $("#tStyle").value.trim();
    const use = chosen($('#tessBuilder [data-key="use"]'))[0];
    const lines = [
      `${josa(shape, "을", "를")} 기본 도형으로 한 테셀레이션 무늬를 만들어 줘.`,
      `${subj} 모양이 ${josa(move, "으로", "로")} 빈틈과 겹침 없이 반복되고,`,
      style ? `${josa(style, "으로", "로")} 그려 줘.` : "알록달록하게 그려 줘.",
      use === "mug" ? "머그컵에 감을 거라서 가로:세로 2:1로, 왼쪽 끝과 오른쪽 끝이 자연스럽게 이어지고 가장자리까지 꽉 차게. 글자는 넣지 마." : "정사각형 이미지로, 글자는 넣지 마.",
    ];
    $("#tessOut").textContent = lines.join("\n");
  };
  $$("#tessBuilder .chips").forEach(c => chipGroup(c, build));
  ["#tSubject", "#tStyle"].forEach(s => $(s).addEventListener("input", build));
  $("#tessCopy").addEventListener("click", e => copyText($("#tessOut").textContent, e.currentTarget));
  build();
  const box = $("#tessPrompts"); TESS_PROMPTS.forEach(([l, t]) => box.append(promptCard(l, t)));
  $("#tessAiSend").addEventListener("click", () => openSend({ act: "tessai", prompt: $("#tessOut").textContent, desc: `${$("#tSubject").value.trim() || "테셀레이션"} — 제미나이로 만든 테셀레이션\n`, pickText: "제미나이에서 저장한 테셀레이션 그림을 골라 주세요." }));
  const tabs = [["#tabA", "#tessA"], ["#tabB", "#tessB"]];
  tabs.forEach(([t]) => $(t).addEventListener("click", () => tabs.forEach(([t2, p2]) => {
    const on = t2 === t; $(t2).setAttribute("aria-selected", on); $(p2).hidden = !on;
  })));
}

/* ---------- 이미지 도우미 ---------- */
function loadImage(src) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}
function fileToImage(file) {
  return new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error("이미지 파일이 아니에요"));
    const r = new FileReader(); r.onload = () => loadImage(r.result).then(res, rej); r.onerror = rej; r.readAsDataURL(file);
  });
}
function download(url, name) { const a = document.createElement("a"); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); }
function flash(btn, msg) { const t = btn.textContent; btn.textContent = msg; setTimeout(() => { btn.textContent = t; }, 1500); }
function wireDrop(zone, input, cb) {
  input.addEventListener("change", () => { if (input.files[0]) cb(input.files[0]); });
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));
  zone.addEventListener("drop", e => { e.preventDefault(); zone.classList.remove("over"); const f = e.dataTransfer.files[0]; if (f) cb(f); });
}

/* =========================================================
   ④ 내 그림으로 테셀레이션
   ========================================================= */
let tileImg = null, tileMode = "slide";
function sampleTile() {
  const c = document.createElement("canvas"); c.width = c.height = 300; const x = c.getContext("2d");
  x.fillStyle = "#fff4d4"; x.fillRect(0, 0, 300, 300);
  const poly = (pts, col) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fillStyle = col; x.fill(); x.strokeStyle = "rgba(0,0,0,.3)"; x.lineWidth = 2; x.stroke(); };
  const r = 70, cx = 150, cy = 150;
  poly([...Array(6)].map((_, i) => [cx + r * Math.cos(i * Math.PI / 3), cy + r * Math.sin(i * Math.PI / 3)]), "#ffc23d");
  poly([[cx - r / 2, cy - r * R3 / 2], [cx + r / 2, cy - r * R3 / 2], [cx, cy - r * R3]], "#2ec4a0");
  poly([[cx + r, cy], [cx + r / 2, cy + r * R3 / 2], [cx + r * 1.5, cy + r * R3 / 2]], "#ff6b6b");
  poly([[cx - r, cy], [cx - r / 2, cy + r * R3 / 2], [cx - r * 1.5, cy + r * R3 / 2]], "#4f8ff7");
  return c;
}
function squareCrop(img) {
  const s = Math.min(img.width, img.height), c = document.createElement("canvas"); c.width = c.height = s;
  c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, s, s); return c;
}
function renderTile() {
  const cv = $("#tileCanvas"), ctx = cv.getContext("2d");
  const src0 = tileImg || sampleTile();
  const src = (tileMode === "rot4") ? squareCrop(src0) : src0;
  const w = +$("#tileSize").value, h = w * src.height / src.width;
  $("#tileSizeV").textContent = `${w}px`;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
  const cols = Math.ceil(cv.width / w) + 2, rows = Math.ceil(cv.height / h) + 2;
  for (let j = -1; j < rows; j++) for (let i = -1; i < cols; i++) {
    let x = i * w, y = j * h;
    if (tileMode === "brick" && (j & 1)) x += w / 2;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2);
    const odd = ((i + j) & 1) !== 0;
    if (tileMode === "half" && odd) ctx.rotate(Math.PI);
    if (tileMode === "rot4") ctx.rotate([[0, 1], [3, 2]][(j & 1)][(i & 1)] * Math.PI / 2);
    if (tileMode === "mirror") ctx.scale((i & 1) ? -1 : 1, (j & 1) ? -1 : 1);
    ctx.drawImage(src, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}
function initTile() {
  wireDrop($("#tileDrop"), $("#tileFile"), f => fileToImage(f).then(im => { tileImg = im; renderTile(); }).catch(() => {}));
  $("#tileFromBlocks").addEventListener("click", () => {
    const c = blocksCanvas(2, 0, null);
    if (c) { tileImg = c; renderTile(); return; }
    if (myBlock && myBlock.img) { loadImage(myBlock.img).then(im => { tileImg = im; renderTile(); }); return; }
    flash($("#tileFromBlocks"), "② 블록판이 비어 있어요");
  });
  $$("#tileModes .chip").forEach(b => b.addEventListener("click", () => {
    $$("#tileModes .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); tileMode = b.dataset.m; renderTile();
  }));
  $("#tileSize").addEventListener("input", renderTile);
  $("#tilePng").addEventListener("click", () => download($("#tileCanvas").toDataURL("image/png"), "테셀레이션_직접만들기.png"));
  $("#tileToMug").addEventListener("click", () => { loadImage($("#tileCanvas").toDataURL("image/png")).then(im => { mugImg = im; setFit("cover"); renderMug(); go("mug"); }); });
  $("#tileSend").addEventListener("click", () => setUpload($("#tileCanvas").toDataURL("image/jpeg", .9), "tess", `직접 만든 테셀레이션 (움직임: ${$("#tileModes [aria-pressed=true]").textContent})\n`, "다른 그림을 보내려면 여기서 고르기"));
  renderTile();
}

/* =========================================================
   ⑤ 머그컵 미리보기 · 전사 도안
   ========================================================= */
const PRINT_W = 2480, PRINT_H = 1040; // 21cm × 8.8cm @300dpi
const COVER = 0.84; // 도안이 컵 둘레에서 차지하는 비율 (21cm / 약 25cm)
let mugImg = null, mugFit = "repeat";
const printCv = document.createElement("canvas"); printCv.width = PRINT_W; printCv.height = PRINT_H;
function setFit(f) { mugFit = f; $$("#mugFit .chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.f === f)); }
function drawPrint() {
  const ctx = printCv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, PRINT_W, PRINT_H);
  const img = mugImg || sampleTile(); const k = +$("#mugScale").value / 100;
  if (mugFit === "repeat") {
    const h = PRINT_H * k * .5, w = h * img.width / img.height;
    for (let y = 0; y < PRINT_H; y += h) for (let x = 0; x < PRINT_W; x += w) ctx.drawImage(img, x, y, w, h);
  } else if (mugFit === "cover") {
    const s = Math.max(PRINT_W / img.width, PRINT_H / img.height) * k, w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (PRINT_W - w) / 2, (PRINT_H - h) / 2, w, h);
  } else {
    const half = PRINT_W / 2, s = Math.min(half / img.width, PRINT_H / img.height) * .9 * k, w = img.width * s, h = img.height * s;
    [half / 2, half * 1.5].forEach(cx => ctx.drawImage(img, cx - w / 2, (PRINT_H - h) / 2, w, h));
  }
}
function renderMug() {
  drawPrint();
  // 전사지 미리보기 (좌우반전)
  const sh = $("#mugSheet"), sx = sh.getContext("2d");
  sx.save(); sx.fillStyle = "#fff"; sx.fillRect(0, 0, sh.width, sh.height);
  sx.translate(sh.width, 0); sx.scale(-1, 1); sx.drawImage(printCv, 0, 0, sh.width, sh.height); sx.restore();
  sx.strokeStyle = "#999"; sx.setLineDash([10, 8]); sx.lineWidth = 3; sx.strokeRect(1.5, 1.5, sh.width - 3, sh.height - 3);

  // 컵
  const cv = $("#mugCanvas"), c = cv.getContext("2d");
  const W = cv.width, Hh = cv.height, cx = W / 2 - 30, r = 175, top = 90, bot = 450, ry = 26;
  c.clearRect(0, 0, W, Hh);
  const spin = +$("#mugSpin").value;
  const handleRel = ((90 - spin) % 360 + 360) % 360; // 손잡이 위치(앞=0)
  const hx = Math.sin(handleRel * Math.PI / 180), hFront = Math.cos(handleRel * Math.PI / 180) > 0;
  const drawHandle = () => {
    if (Math.abs(hx) < .2 && !hFront) return;
    const side = hx >= 0 ? 1 : -1, x0 = cx + side * r * Math.max(Math.abs(hx), .55) * (Math.abs(hx) > .2 ? 1 : 0);
    c.save(); c.lineWidth = 30; c.strokeStyle = "#e9ecf3"; c.lineCap = "round";
    c.beginPath();
    if (Math.abs(hx) > .2) { c.moveTo(x0 - side * 10, top + 80); c.bezierCurveTo(x0 + side * 120, top + 60, x0 + side * 130, bot - 70, x0 - side * 10, bot - 80); }
    else { c.moveTo(cx - 40, top + 80); c.bezierCurveTo(cx - 60, top + 200, cx + 60, top + 200, cx + 40, top + 80); }
    c.stroke(); c.lineWidth = 2; c.strokeStyle = "rgba(0,0,0,.15)"; c.stroke(); c.restore();
  };
  // 그림자
  c.fillStyle = "rgba(0,0,0,.10)"; c.beginPath(); c.ellipse(cx, bot + 18, r * 1.05, 22, 0, 0, Math.PI * 2); c.fill();
  if (!hFront) drawHandle();
  // 몸통 경로
  c.save();
  c.beginPath(); c.moveTo(cx - r, top); c.lineTo(cx - r, bot); c.ellipse(cx, bot, r, ry, 0, Math.PI, 0, true); c.lineTo(cx + r, top); c.ellipse(cx, top, r, ry, 0, 0, Math.PI, false); c.closePath();
  c.fillStyle = "#ffffff"; c.fill(); c.clip();
  // 무늬 감기
  const startDeg = 360 * (1 - COVER) / 2; // 손잡이 옆 빈 곳 다음부터 도안 시작
  const pTop = top + 10, pH = bot - top - 20;
  for (let px = -r; px < r; px += 1) {
    const phi = Math.asin(Math.max(-1, Math.min(1, (px + .5) / r))) * 180 / Math.PI; // -90~90
    const theta = (((phi - handleRel + 360) % 360) + 360) % 360; // 손잡이 기준 각도
    const rel = theta - startDeg;
    if (rel < 0 || rel > 360 * COVER) continue;
    const u = rel / (360 * COVER) * PRINT_W;
    const du = Math.max(1, (PRINT_W / (360 * COVER)) * (180 / Math.PI) / Math.sqrt(Math.max(.02, r * r - px * px)));
    c.drawImage(printCv, Math.min(PRINT_W - du, u), 0, du, PRINT_H, cx + px, pTop + ry * Math.sqrt(Math.max(0, 1 - (px / r) ** 2)) * .0, 1.2, pH);
  }
  // 입체 음영
  const g = c.createLinearGradient(cx - r, 0, cx + r, 0);
  g.addColorStop(0, "rgba(0,0,0,.28)"); g.addColorStop(.18, "rgba(0,0,0,.06)"); g.addColorStop(.35, "rgba(255,255,255,.18)"); g.addColorStop(.45, "rgba(255,255,255,0)"); g.addColorStop(.85, "rgba(0,0,0,.1)"); g.addColorStop(1, "rgba(0,0,0,.32)");
  c.fillStyle = g; c.fillRect(cx - r, top - ry, r * 2, bot - top + ry * 2);
  c.restore();
  // 입구
  c.beginPath(); c.ellipse(cx, top, r, ry, 0, 0, Math.PI * 2); c.fillStyle = "#f1f3f8"; c.fill(); c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = 2; c.stroke();
  c.beginPath(); c.ellipse(cx, top + 3, r - 12, ry - 5, 0, 0, Math.PI * 2); c.fillStyle = "#dfe3ec"; c.fill();
  if (hFront) drawHandle();
}
function mirrored() {
  const c = document.createElement("canvas"); c.width = PRINT_W; c.height = PRINT_H;
  const x = c.getContext("2d"); x.translate(PRINT_W, 0); x.scale(-1, 1); x.drawImage(printCv, 0, 0); return c;
}
function initMug() {
  wireDrop($("#mugDrop"), $("#mugFile"), f => fileToImage(f).then(im => { mugImg = im; renderMug(); }).catch(() => {}));
  $$("#mugFit .chip").forEach(b => b.addEventListener("click", () => { setFit(b.dataset.f); renderMug(); }));
  ["#mugScale", "#mugSpin"].forEach(s => $(s).addEventListener("input", renderMug));
  $("#mugPrint").addEventListener("click", () => { drawPrint(); download(mirrored().toDataURL("image/png"), "컵전사_좌우반전_21x8.8cm.png"); });
  $("#mugPlain").addEventListener("click", () => { drawPrint(); download(printCv.toDataURL("image/png"), "컵도안_원본방향_21x8.8cm.png"); });
  $("#mugSend").addEventListener("click", () => { drawPrint(); setUpload(printCv.toDataURL("image/jpeg", .9), "mug", "컵 전사 도안 (원본 방향)\n"); });
  // 끌어서 돌리기
  let d = null; const cv = $("#mugCanvas"); cv.style.touchAction = "pan-y"; cv.style.cursor = "grab";
  cv.addEventListener("pointerdown", e => { d = { x: e.clientX, v: +$("#mugSpin").value }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", e => { if (!d) return; $("#mugSpin").value = ((d.v - (e.clientX - d.x) * .8) % 360 + 360) % 360; renderMug(); });
  cv.addEventListener("pointerup", () => { d = null; });
  renderMug();
}

/* =========================================================
   작품 올리기
   ========================================================= */
let upData = null;
async function compress(src, max = 1600) {
  const im = typeof src === "string" ? await loadImage(src) : src;
  const s = Math.min(1, max / Math.max(im.width, im.height));
  const c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
  const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
  let q = .88, url = c.toDataURL("image/jpeg", q);
  while (url.length > 3.6e6 && q > .5) { q -= .1; url = c.toDataURL("image/jpeg", q); }
  return url;
}
function setUpload(src, act, descPrefix = "", pickText) { openSend({ act, image: src, desc: descPrefix, pickText }); }

/* ---------- 보낸 기록 (이 기기) ---------- */
const ACT_NAMES = { block: "② 패턴블럭 작품", style: "③ 다른 스타일로 (제미나이 결과)", tess: "④ 테셀레이션 A · 직접 만들기", tessai: "④ 테셀레이션 B · 제미나이", mug: "⑤ 컵 디자인", etc: "기타" };
const sentLog = () => { try { return JSON.parse(localStorage.getItem("gifted-sent") || "[]"); } catch { return []; } };
function logSent(act) { const l = sentLog(); l.push({ act, t: Date.now() }); try { localStorage.setItem("gifted-sent", JSON.stringify(l.slice(-200))); } catch {} renderSent(); }
function renderSent() {
  const l = sentLog();
  $$("[data-sent]").forEach(el => { const n = l.filter(x => x.act === el.dataset.sent).length; el.textContent = n ? `✓ 이 기기에서 ${n}개 보냄` : ""; });
  const ul = $("#sentList"); if (!ul) return; ul.textContent = "";
  if (!l.length) { const li = document.createElement("li"); li.className = "muted"; li.textContent = "아직 보낸 작품이 없어요."; ul.append(li); return; }
  l.slice(-15).reverse().forEach(x => {
    const li = document.createElement("li"), d = new Date(x.t);
    li.textContent = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} · ${ACT_NAMES[x.act] || "기타"}`;
    ul.append(li);
  });
}
async function postWork(body) {
  const r = await fetch("api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "보내지 못했어요.");
  try { localStorage.setItem("gifted-name", body.name); localStorage.setItem("gifted-group", body.group); } catch {}
  logSent(body.activity);
}
let needCode = false;

/* ---------- 공용 제출 창 ---------- */
let sd = null;
const sdStatus = (t, kind) => { const s = $("#sdStatus"); s.textContent = t; s.className = "status" + (kind ? " " + kind : ""); };
function sdSetImage(u) { sd.data = u; $("#sdThumb").src = u; $("#sdThumb").hidden = false; }
async function openSend(o) {
  sd = { ...o, data: null };
  $("#sdBody").hidden = false; $("#sdDone").hidden = true; sdStatus("");
  $("#sdAct").textContent = "보내는 활동: " + (ACT_NAMES[o.act] || "기타");
  $("#sdThumb").hidden = true; $("#sdFile").value = "";
  $("#sdDropText").textContent = o.pickText || "보낼 그림을 고르거나 여기에 끌어다 놓기";
  $("#sdDesc").value = o.desc || ""; $("#sdDesc").placeholder = "어떤 작품인지, 어떤 도형 · 움직임을 썼는지 적어요";
  $("#sdPromptWrap").hidden = o.prompt == null; $("#sdPrompt").value = o.prompt || "";
  $("#sdCodeWrap").hidden = !needCode;
  try { $("#sdName").value = localStorage.getItem("gifted-name") || ""; $("#sdGroup").value = localStorage.getItem("gifted-group") || ""; } catch {}
  $("#sendDlg").showModal();
  if (o.image) { try { sdSetImage(await compress(o.image)); } catch {} }
}
function initSend() {
  const dlg = $("#sendDlg");
  $("#sdClose").addEventListener("click", () => dlg.close());
  $("#sdOk").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  wireDrop($("#sdDrop"), $("#sdFile"), f => fileToImage(f).then(im => compress(im)).then(sdSetImage).catch(() => sdStatus("그림 파일을 골라 주세요.", "err")));
  $("#sdForm").addEventListener("submit", async e => {
    e.preventDefault(); if (!sd) return;
    const name = $("#sdName").value.trim();
    if (!name) { sdStatus("이름(별명)을 적어 주세요.", "err"); $("#sdName").focus(); return; }
    if (!sd.data) { sdStatus("보낼 그림을 골라 주세요.", "err"); return; }
    const btn = $("#sdBtn"); btn.disabled = true; sdStatus("보내는 중…");
    try {
      await postWork({ name, group: $("#sdGroup").value.trim(), activity: sd.act, desc: $("#sdDesc").value, prompt: $("#sdPrompt").value, code: $("#sdCode").value.trim(), image: sd.data });
      const n = sentLog().filter(x => x.act === sd.act).length;
      $("#sdBody").hidden = true; $("#sdDone").hidden = false; sdStatus("");
      $("#sdDoneMsg").textContent = `‘${ACT_NAMES[sd.act]}’에서 이 기기로 지금까지 ${n}개 보냈어요. 작품을 고치거나 새로 만들면 또 보내도 돼요.`;
    } catch (err) { sdStatus(err.message || "보내지 못했어요. 잠시 뒤 다시 눌러 주세요.", "err"); }
    finally { btn.disabled = false; }
  });
  renderSent();
}
function setStatus(t, kind) { const s = $("#uStatus"); s.textContent = t; s.className = "status" + (kind ? " " + kind : ""); }
function initUpload() {
  wireDrop($("#upDrop"), $("#uFile"), f => fileToImage(f).then(im => compress(im)).then(u => {
    upData = u; $("#upThumb").src = u; $("#upThumb").hidden = false; $("#upDropText").textContent = "다른 이미지로 바꾸려면 다시 고르기"; setStatus("");
  }).catch(() => setStatus("이미지 파일을 골라 주세요.", "err")));
  try { const n = localStorage.getItem("gifted-name"); if (n) $("#uName").value = n; const g = localStorage.getItem("gifted-group"); if (g) $("#uGroup").value = g; } catch {}
  fetch("api/config").then(r => r.json()).then(c => {
    if (c.needCode) { $("#uCodeWrap").hidden = false; needCode = true; }
    if (!c.ready) setStatus("아직 저장소가 연결되지 않았어요. (선생님: README의 Blob 연결 단계를 확인하세요)", "err");
  }).catch(() => setStatus("이 화면은 미리보기라 올리기가 꺼져 있어요. 배포된 주소에서 올려 주세요.", "err"));

  $("#upForm").addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#uName").value.trim();
    if (!name) { setStatus("이름(별명)을 적어 주세요.", "err"); $("#uName").focus(); return; }
    if (!upData) { setStatus("올릴 이미지를 골라 주세요.", "err"); return; }
    const btn = $("#uBtn"); btn.disabled = true; setStatus("보내는 중…");
    try {
      await postWork({ name, group: $("#uGroup").value.trim(), activity: $("#uAct").value, desc: $("#uDesc").value, prompt: $("#uPrompt").value, code: $("#uCode").value.trim(), image: upData });
      setStatus("선생님께 보냈어요! 🎉 다른 작품도 또 보낼 수 있어요.", "ok");
      upData = null; $("#upThumb").hidden = true; $("#upDropText").textContent = "사진을 고르거나 여기에 끌어다 놓기"; $("#uFile").value = ""; $("#uDesc").value = ""; $("#uPrompt").value = "";
    } catch (err) { setStatus(err.message || "보내지 못했어요. 잠시 뒤 다시 눌러 주세요.", "err"); }
    finally { btn.disabled = false; }
  });
}


/* ---------- 화면 전환 (랜딩 ↔ 하위 페이지) ---------- */
const PAGES = [["explore", "① 테셀레이션 탐구"], ["blocks", "② 패턴블럭 작품"], ["style", "③ 다른 스타일로"], ["tess", "④ 테셀레이션 만들기"], ["mug", "⑤ 컵에 전사하기"], ["submit", "작품 올리기"]];
function go(id) { if (location.hash === "#" + id) route(); else location.hash = id; }
function route() {
  const id = location.hash.slice(1);
  const idx = PAGES.findIndex(p => p[0] === id);
  document.body.classList.toggle("on-home", idx < 0);
  $$(".pages > section").forEach(s => s.classList.toggle("active", s.id === id));
  $$(".subnav a").forEach(a => { if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  const pg = $("#pager"); pg.textContent = "";
  if (idx >= 0) {
    const prev = idx > 0 ? PAGES[idx - 1] : ["home", "처음으로"], next = PAGES[idx + 1];
    const a1 = document.createElement("a"); a1.href = "#" + prev[0]; a1.textContent = "← " + prev[1]; pg.append(a1);
    if (next) { const a2 = document.createElement("a"); a2.className = "next"; a2.href = "#" + next[0]; a2.textContent = next[1] + " →"; pg.append(a2); }
    document.title = PAGES[idx][1] + " · 응석쌤 수학영재수업";
  } else document.title = "도형이 예술이 되는 시간 · 응석쌤 수학영재수업";
  window.scrollTo(0, 0);
  if (id === "mug") renderMug();
  if (id === "style") applyMyBlockToStyle(false);
}
window.addEventListener("hashchange", route);

initVertex(); initBlocks(); initStyle(); initTessBuilder(); initTile(); initMug(); initUpload(); initSend(); route();
})();
