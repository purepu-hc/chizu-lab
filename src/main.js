import { geoMercator, geoPath } from 'd3-geo';
import { select, selectAll, pointer } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import 'd3-transition';
import { feature } from 'topojson-client';
import mapTopo from './data/map.json';
import P from './data/prefectures.json';
import G from './data/geography.json';
import H from './data/heritage.json';
import R from './data/rankings.json';
import { icon, symbolDefs } from './icons.js';

// ───────────────────────── 基本データの整理 ─────────────────────────
const prefs = P.prefectures;
const prefByCode = new Map(prefs.map((p) => [p.code, p]));
const totalPop = prefs.reduce((a, p) => a + p.population, 0);
const popRank = new Map([...prefs].sort((a, b) => b.population - a.population).map((p, i) => [p.code, i + 1]));
const areaRank = new Map([...prefs].sort((a, b) => b.area - a.area).map((p, i) => [p.code, i + 1]));
const densRank = new Map([...prefs].sort((a, b) => b.population / b.area - a.population / a.area).map((p, i) => [p.code, i + 1]));
const items = R.items.filter((it) => it.ranks && it.ranks.length);
const itemById = new Map(items.map((it) => [it.id, it]));
const REGION_COLOR = {
  北海道: 'var(--r-hokkaido)', 東北: 'var(--r-tohoku)', 関東: 'var(--r-kanto)', 中部: 'var(--r-chubu)',
  近畿: 'var(--r-kinki)', 中国: 'var(--r-chugoku)', 四国: 'var(--r-shikoku)', '九州・沖縄': 'var(--r-kyushu)',
};
const fmt = (n) => n.toLocaleString('ja-JP');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ───────────────────────── 投影（本土＋南西諸島・小笠原インセット） ─────────────────────────
const W = 1000;
const fc = feature(mapTopo, mapTopo.objects.p);
const byPart = (part) => ({ type: 'FeatureCollection', features: fc.features.filter((f) => f.properties.part === part) });
const mainFC = byPart('main');
const ryukyuFC = byPart('ryukyu');
const ogaFC = byPart('ogasawara');

const projMain = geoMercator().fitWidth(W - 40, mainFC);
const [[mx0, my0], [mx1, my1]] = geoPath(projMain).bounds(mainFC);
projMain.translate([projMain.translate()[0] + 20 - mx0, projMain.translate()[1] + 20 - my0]);
const H_ = Math.ceil(my1 - my0 + 40);
const RY = { x: 14, y: 14, w: 300, h: 250 };
const projRy = geoMercator().fitExtent([[RY.x + 10, RY.y + 22], [RY.x + RY.w - 10, RY.y + RY.h - 10]], ryukyuFC);
const OG = { x: W - 130, y: H_ - 170, w: 110, h: 120 };
const projOg = geoMercator().fitExtent([[OG.x + 25, OG.y + 22], [OG.x + OG.w - 25, OG.y + OG.h - 10]], ogaFC);

function projFor([lon, lat]) {
  if (lon > 140.5 && lat < 30) return projOg;
  if (lat < 30 && lon < 131.5) return projRy;
  return projMain;
}
const proj = (ll) => projFor(ll)(ll);
const pathFor = { main: geoPath(projMain), ryukyu: geoPath(projRy), ogasawara: geoPath(projOg) };

// 都道府県ラベル位置：本土側（沖縄はインセット）の最大ポリゴン重心。小さい県は手で微調整。
const LABEL_NUDGE = { 13: [-6, -2], 14: [4, 6], 11: [0, -4], 27: [-3, 0], 28: [-6, -6], 26: [-4, -8], 47: [0, 0], 1: [10, 10], 34: [0, -4], 40: [0, -2] };
const labelPos = new Map();
for (const f of fc.features) {
  const { code, part } = f.properties;
  if (part === 'ogasawara') continue;
  if (code === 47 ? part !== 'ryukyu' : part !== 'main') continue;
  const polys = f.geometry.coordinates;
  let best = null, bestA = -1;
  for (const poly of polys) {
    const g = { type: 'Polygon', coordinates: poly };
    const a = pathFor[part].area(g);
    if (a > bestA) { bestA = a; best = g; }
  }
  const c = pathFor[part].centroid(best);
  const n = LABEL_NUDGE[code] || [0, 0];
  labelPos.set(code, [c[0] + n[0], c[1] + n[1]]);
}

// ───────────────────────── 状態 ─────────────────────────
const LAYERS = [
  { id: 'names', label: '県名', ic: null, on: true },
  { id: 'capitals', label: '県庁所在地', ic: 'capital', on: true },
  { id: 'cities', label: '政令指定都市', ic: 'city', on: false },
  { id: 'ranges', label: '山脈・山', ic: 'fuji', on: false },
  { id: 'rivers', label: '川', ic: null, on: false, swatch: '#2f80ed' },
  { id: 'lakes', label: '湖', ic: null, on: false, dot: '#64b5f6' },
  { id: 'plains', label: '平野・盆地・台地', ic: null, on: false, dot: '#c5e1a5' },
  { id: 'peninsulas', label: '半島・岬・島', ic: 'island', on: false },
  { id: 'currents', label: '海流', ic: null, on: false, swatch: '#e53935' },
  { id: 'heritage', label: '世界遺産', ic: 'castle', on: false },
  { id: 'industry', label: '工業地帯', ic: 'factory', on: false },
  { id: 'specialty', label: '生産量1位', ic: 'apple', on: false },
  { id: 'crafts', label: '伝統工芸品', ic: 'craft', on: false },
];
const state = {
  mode: 'map',
  layers: Object.fromEntries(LAYERS.map((l) => [l.id, l.on])),
  hideNames: false,
  selected: null,
  rankCat: R.categories[0]?.id,
  rankItem: null,
  popMetric: 'population',
  k: 1,
  history: [],
};

// ───────────────────────── SVG構築 ─────────────────────────
const svg = select('#map').attr('viewBox', `0 0 ${W} ${H_}`).attr('preserveAspectRatio', 'xMidYMid meet');
svg.append('defs').html(symbolDefs() + `
  <marker id="arrow-warm" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e53935"/></marker>
  <marker id="arrow-cold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1e63c6"/></marker>`);
const root = svg.append('g').attr('class', 'root');
const gFrames = root.append('g');
const gPrefs = root.append('g');
const gSeas = root.append('g').attr('data-layer', 'currents');
const gCurrents = root.append('g').attr('data-layer', 'currents');
const gZones = root.append('g').attr('data-layer', 'industry');
const gRanges = root.append('g').attr('data-layer', 'ranges');
const gRivers = root.append('g').attr('data-layer', 'rivers');
const gNames = root.append('g').attr('data-layer', 'names');
const gPoints = root.append('g');
const gBadges = root.append('g');
const tooltip = document.getElementById('tooltip');

// インセット枠
gFrames.append('rect').attr('class', 'inset-frame').attr('x', RY.x).attr('y', RY.y).attr('width', RY.w).attr('height', RY.h).attr('rx', 10);
gFrames.append('text').attr('class', 'inset-label').attr('x', RY.x + 10).attr('y', RY.y + 16).text('南西諸島（縮尺・位置を変えています）');
gFrames.append('rect').attr('class', 'inset-frame').attr('x', OG.x).attr('y', OG.y).attr('width', OG.w).attr('height', OG.h).attr('rx', 10);
gFrames.append('text').attr('class', 'inset-label').attr('x', OG.x + 8).attr('y', OG.y + 16).text('小笠原諸島');

// 都道府県
gPrefs.selectAll('path').data(fc.features).join('path')
  .attr('class', 'pref')
  .attr('d', (f) => pathFor[f.properties.part](f))
  .attr('data-code', (f) => f.properties.code)
  .on('click', (ev, f) => { ev.stopPropagation(); openPref(f.properties.code); })
  .on('mousemove', (ev, f) => showTip(ev, prefTip(f.properties.code)))
  .on('mouseleave', hideTip);

// 県名
gNames.selectAll('text').data(prefs).join('text')
  .attr('class', 'pref-label')
  .attr('x', (p) => labelPos.get(p.code)[0])
  .attr('y', (p) => labelPos.get(p.code)[1])
  .text((p) => p.short);

// 海の名前
gSeas.selectAll('text').data(G.seas).join('text')
  .attr('class', (d) => 'sea-label' + (d.small ? ' small' : ''))
  .attr('x', (d) => proj(d.ll)[0]).attr('y', (d) => proj(d.ll)[1]).text((d) => d.name);

// 海流
const lineMain = (pts) => 'M' + pts.map((p) => projMain(p).join(',')).join('L');
const smooth = (pts, pr = projMain) => {
  const xy = pts.map((p) => pr(p));
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1], [x1, y1] = xy[i];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    d += i === 1 ? ` L${mx},${my}` : ` Q${x0},${y0} ${mx},${my}`;
  }
  const last = xy[xy.length - 1];
  return d + ` L${last[0]},${last[1]}`;
};
const curG = gCurrents.selectAll('g').data(G.currents).join('g').attr('class', 'feat');
curG.append('path').attr('class', (d) => 'current ' + (d.warm ? 'warm' : 'cold')).attr('d', (d) => smooth(d.line))
  .attr('marker-end', (d) => `url(#arrow-${d.warm ? 'warm' : 'cold'})`);
curG.append('path').attr('class', 'current-hit').attr('d', (d) => smooth(d.line))
  .on('click', (ev, d) => { ev.stopPropagation(); openFeature('current', d); })
  .on('mousemove', (ev, d) => showTip(ev, `${d.name}（${d.warm ? '暖流' : '寒流'}）`)).on('mouseleave', hideTip);
curG.append('text').attr('class', 'feat-label').attr('fill', (d) => (d.warm ? '#c62828' : '#1e63c6'))
  .attr('x', (d) => projMain(d.line[Math.floor(d.line.length / 2)])[0] + 6)
  .attr('y', (d) => projMain(d.line[Math.floor(d.line.length / 2)])[1] - 6)
  .text((d) => d.name);

// 工業地帯（楕円）
const zoneG = gZones.selectAll('g').data(G.industrialZones).join('g').attr('class', 'feat');
zoneG.append('ellipse').attr('class', 'zone')
  .attr('cx', (d) => proj(d.ll)[0]).attr('cy', (d) => proj(d.ll)[1])
  .attr('rx', (d) => (d.kind === '工業地帯' ? 22 : 18)).attr('ry', (d) => (d.kind === '工業地帯' ? 14 : 11))
  .on('click', (ev, d) => { ev.stopPropagation(); openFeature('industry', d); })
  .on('mousemove', (ev, d) => showTip(ev, d.name)).on('mouseleave', hideTip);
zoneG.append('text').attr('class', 'feat-label').attr('fill', '#bf360c')
  .attr('x', (d) => proj(d.ll)[0]).attr('y', (d) => proj(d.ll)[1] + 24).attr('text-anchor', 'middle')
  .text((d) => d.name.replace('工業', ''));

// 山脈
function teeth(pts) {
  // 山脈の線に「ぎざぎざ」を描く
  const xy = pts.map((p) => projMain(p));
  let d = '';
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1], [x1, y1] = xy[i];
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(len / 9));
    const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
      d += `M${cx - (x1 - x0) / len * 3 + nx * 2},${cy - (y1 - y0) / len * 3 + ny * 2} L${cx - nx * 4},${cy - ny * 4} L${cx + (x1 - x0) / len * 3 + nx * 2},${cy + (y1 - y0) / len * 3 + ny * 2}`;
    }
  }
  return d;
}
const rangeG = gRanges.selectAll('g.r').data(G.mountainRanges).join('g').attr('class', 'r feat');
rangeG.append('path').attr('class', 'range').attr('d', (d) => smooth(d.line));
rangeG.append('path').attr('class', 'range-teeth').attr('d', (d) => teeth(d.line));
rangeG.append('path').attr('class', 'range-hit').attr('d', (d) => smooth(d.line))
  .on('click', (ev, d) => { ev.stopPropagation(); openFeature('range', d); })
  .on('mousemove', (ev, d) => showTip(ev, d.name)).on('mouseleave', hideTip);
rangeG.append('text').attr('class', 'feat-label').attr('fill', '#5d4037')
  .attr('x', (d) => projMain(d.line[Math.floor((d.line.length - 1) / 2)])[0] + 8)
  .attr('y', (d) => projMain(d.line[Math.floor((d.line.length - 1) / 2)])[1])
  .text((d) => d.name.replace(/（.*）/, ''));

// 川
const riverG = gRivers.selectAll('g').data(G.rivers).join('g').attr('class', 'feat');
riverG.append('path').attr('class', 'river').attr('d', (d) => smooth(d.line));
riverG.append('path').attr('class', 'river-hit').attr('d', (d) => smooth(d.line))
  .on('click', (ev, d) => { ev.stopPropagation(); openFeature('river', d); })
  .on('mousemove', (ev, d) => showTip(ev, d.name)).on('mouseleave', hideTip);
riverG.append('text').attr('class', 'feat-label').attr('fill', '#1e63c6')
  .attr('x', (d) => projMain(d.line[Math.floor(d.line.length / 2)])[0] + 5)
  .attr('y', (d) => projMain(d.line[Math.floor(d.line.length / 2)])[1] + 4)
  .text((d) => d.name);

// ───── 点で表すもの（画面上の大きさを一定に保つため counter-scale する） ─────
const counterScaled = [];
function addPoint(layer, ll, draw, onClick, tip, label, labelColor) {
  const [x, y] = proj(ll);
  const g = gPoints.append('g').attr('class', 'marker cs').attr('data-layer', layer)
    .attr('tabindex', 0).attr('role', 'button').attr('aria-label', tip);
  g.node().__xy = [x, y];
  draw(g);
  if (label) {
    g.append('text').attr('class', 'feat-label ptl').attr('x', 11).attr('y', 4).attr('fill', labelColor || 'var(--ink)')
      .style('font-size', '11.5px').style('stroke-width', '3px').text(label);
  }
  g.on('click', (ev) => { ev.stopPropagation(); onClick(); })
    .on('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onClick(); } })
    .on('mousemove', (ev) => showTip(ev, tip)).on('mouseleave', hideTip);
  counterScaled.push(g.node());
  return g;
}
const useIc = (name, size) => (g) => g.append('use').attr('href', `#ic-${name}`).attr('x', -size / 2).attr('y', -size / 2).attr('width', size).attr('height', size);

// 平野・盆地・台地
for (const d of G.plains) {
  addPoint('plains', d.ll, (g) => g.append('rect').attr('class', 'plain-dot').attr('x', -5).attr('y', -5).attr('width', 10).attr('height', 10).attr('rx', d.kind === '平野' ? 2 : 5),
    () => openFeature('plain', d), d.name, d.name, '#33691e');
}
// 湖
for (const d of G.lakes) {
  addPoint('lakes', d.ll, (g) => g.append('ellipse').attr('class', 'lake-dot').attr('rx', d.rank ? 8 - d.rank * 0.6 : 5).attr('ry', d.rank ? 5.5 - d.rank * 0.4 : 3.5),
    () => openFeature('lake', d), d.name + (d.rank ? `（面積${d.rank}位）` : ''), d.name, '#1565c0');
}
// 山
for (const d of G.mountains) {
  addPoint('ranges', d.ll, (g) => g.append('path').attr('d', 'M-7,5 L0,-7 L7,5 Z').attr('fill', '#a1887f').attr('stroke', '#4e342e').attr('stroke-width', 1.4),
    () => openFeature('mountain', d), `${d.name}（${fmt(d.elev)}m）`, d.name, '#4e342e');
}
// 半島・岬・島
for (const d of G.peninsulas.filter((x) => !x.offmap)) {
  addPoint('peninsulas', d.ll, (g) => g.append('circle').attr('class', 'pen-dot').attr('r', d.kind === '岬' ? 3.5 : 4.5),
    () => openFeature('peninsula', d), d.name, d.name, '#4e342e');
}
// 政令指定都市
for (const d of P.designatedCities) {
  addPoint('cities', d.ll, useIc('city', 15), () => openPref(d.pref), `${d.name}（政令指定都市）`, null);
}
// 県庁所在地
for (const p of prefs) {
  const diff = p.capital.replace(/市$/, '') !== p.short && p.code !== 13 && p.code !== 1;
  addPoint('capitals', p.capitalLL, useIc('capital', 12), () => openPref(p.code), `${p.capital}（${p.name}の県庁所在地）`,
    diff ? p.capital.replace(/（.*）/, '') : null, '#b23c17');
}
// 世界遺産
for (const d of H.sites) {
  addPoint('heritage', d.ll, (g) => {
    g.append('circle').attr('r', 15).attr('fill', '#fff').attr('stroke', d.type === '自然' ? '#2e7d32' : '#b23c17').attr('stroke-width', 2.2);
    useIc(d.icon, 22)(g);
  }, () => openFeature('heritage', d), `${d.name}（${d.year}年・${d.type}遺産）`, null);
}
// 伝統工芸品
for (const p of prefs) {
  addPoint('crafts', p.capitalLL, useIc('craft', 18), () => openPref(p.code), `${p.name}：${p.crafts.join('・')}`, p.crafts[0], '#7b1f1f');
}
// 生産量1位アイコン（ランキングデータから自動生成）
const firstPlaces = new Map();
for (const it of items) {
  const top = it.ranks[0];
  if (!firstPlaces.has(top.pref)) firstPlaces.set(top.pref, []);
  firstPlaces.get(top.pref).push(it);
}
for (const [code, list] of firstPlaces) {
  const [lx, ly] = labelPos.get(code);
  const shown = list.slice(0, 4);
  shown.forEach((it, i) => {
    const offset = (i - (shown.length - 1) / 2) * 20;
    const g = gPoints.append('g').attr('class', 'marker cs').attr('data-layer', 'specialty').attr('tabindex', 0)
      .attr('aria-label', `${prefByCode.get(code).name}：${it.name} 1位`);
    g.node().__xy = [lx, ly];
    g.node().__off = [offset, 16];
    g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 10).attr('fill', '#fff').attr('stroke', '#d4a017').attr('stroke-width', 1.6);
    useIc(it.icon, 17)(g);
    g.on('click', (ev) => { ev.stopPropagation(); setMode('rank'); selectItem(it.id); })
      .on('mousemove', (ev) => showTip(ev, `${it.name} 1位（${it.year}）${list.length > 4 ? ` ほか${list.length - 4}品目` : ''}`))
      .on('mouseleave', hideTip);
    counterScaled.push(g.node());
  });
}

// ───────────────────────── ズーム ─────────────────────────
const zoomer = zoom().scaleExtent([1, 10]).translateExtent([[-200, -200], [W + 200, H_ + 200]])
  .on('zoom', (ev) => {
    const t = ev.transform;
    state.k = t.k;
    root.attr('transform', t);
    applyCounterScale();
  });
svg.call(zoomer).on('dblclick.zoom', null);
svg.on('click', () => { if (state.mode === 'map') { clearSelection(); renderPanel(); } });
// 画面上の見た目の大きさを一定に保つ。小さい画面（スマホ）では少しだけ大きめにして読めるようにする。
let vbScale = 1;
function measure() {
  const r = svg.node().getBoundingClientRect();
  vbScale = Math.min(r.width / W, r.height / H_) || 1;
}
window.addEventListener('resize', () => { measure(); applyCounterScale(); });
measure();
const markerScale = () => Math.min(Math.max(vbScale * state.k, 0.55), 0.95) / (state.k * vbScale);
function applyCounterScale() {
  const c = markerScale();
  svg.node().style.setProperty('--k', 1 / c);
  for (const n of counterScaled) {
    const [x, y] = n.__xy, [ox, oy] = n.__off || [0, 0];
    n.setAttribute('transform', `translate(${x},${y}) scale(${c}) translate(${ox},${oy})`);
  }
  gBadges.selectAll('g.rank-badge').attr('transform', function () { const [x, y] = this.__xy; return `translate(${x},${y}) scale(${c})`; });
}
document.getElementById('zoomIn').onclick = () => svg.transition().duration(250).call(zoomer.scaleBy, 1.6);
document.getElementById('zoomOut').onclick = () => svg.transition().duration(250).call(zoomer.scaleBy, 1 / 1.6);
document.getElementById('zoomReset').onclick = () => svg.transition().duration(300).call(zoomer.transform, zoomIdentity);
function zoomToPref(code) {
  const f = fc.features.filter((x) => x.properties.code === code && x.properties.part !== 'ogasawara')
    .sort((a, b) => pathFor[b.properties.part].area(b) - pathFor[a.properties.part].area(a))[0];
  const [[x0, y0], [x1, y1]] = pathFor[f.properties.part].bounds(f);
  const box = svg.node().getBoundingClientRect();
  const vbScale = Math.min(box.width / W, box.height / H_);
  const k = Math.max(1, Math.min(5, 0.55 / Math.max((x1 - x0) / W, (y1 - y0) / H_)));
  if (k <= state.k * 1.05 && k < 1.5) return;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  svg.transition().duration(450).call(zoomer.transform, zoomIdentity.translate(W / 2, H_ / 2).scale(k).translate(-cx, -cy));
  void vbScale;
}

// ───────────────────────── 表示の更新 ─────────────────────────
function applyLayers() {
  selectAll('[data-layer]').style('display', function () {
    return state.layers[this.getAttribute('data-layer')] ? null : 'none';
  });
  svg.classed('hidden-label', state.hideNames);
  selectAll('.feat-label').style('visibility', state.hideNames ? 'hidden' : null);
}

const RANK_COLORS = ['#b3261e', '#d9442b', '#ea6a2e', '#f08a3c', '#f4a24f', '#f7b866', '#f9c97f', '#fbd896', '#fce4ad', '#fdefc6'];
function popColor(v, min, max, log) {
  const t = log ? (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min)) : (v - min) / (max - min);
  const stops = ['#fff6dc', '#fbd38d', '#f6a04d', '#e2652e', '#a8321c'];
  const x = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1), i = Math.floor(x), f = x - i;
  const a = hex(stops[i]), b = hex(stops[i + 1]);
  return `rgb(${a.map((c, j) => Math.round(c + (b[j] - c) * f)).join(',')})`;
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

function paint() {
  const sel = gPrefs.selectAll('path.pref');
  const legend = document.getElementById('legend');
  gBadges.selectAll('*').remove();
  legend.hidden = true;
  if (state.mode === 'rank' && state.rankItem) {
    const it = itemById.get(state.rankItem);
    const rk = new Map(it.ranks.map((r, i) => [r.pref, i]));
    sel.style('fill', (f) => (rk.has(f.properties.code) ? RANK_COLORS[rk.get(f.properties.code)] : '#f1ede4'));
    it.ranks.forEach((r, i) => {
      const [x, y] = labelPos.get(r.pref);
      const g = gBadges.append('g').attr('class', 'rank-badge');
      g.node().__xy = [x, y - 14];
      g.append('circle').attr('r', 9).attr('fill', i < 3 ? '#fff3c4' : '#fff');
      g.append('text').text(i + 1).attr('fill', 'var(--ink)');
    });
    legend.hidden = false;
    legend.innerHTML = `<b>${esc(it.name)}</b> <span class="year">${esc(it.year)}</span>
      <div class="scale">${RANK_COLORS.map((c, i) => `<span style="background:${c}" title="${i + 1}位"></span>`).join('')}</div>
      <div style="display:flex;justify-content:space-between"><span>1位</span><span>10位</span></div>`;
  } else if (state.mode === 'pop') {
    const m = state.popMetric;
    const val = (p) => (m === 'population' || m === 'share' ? p.population : m === 'density' ? p.population / p.area : p.area);
    const vs = prefs.map(val), min = Math.min(...vs), max = Math.max(...vs);
    sel.style('fill', (f) => popColor(val(prefByCode.get(f.properties.code)), min, max, m !== 'area'));
    legend.hidden = false;
    const lab = { population: '人口', share: '人口比率（全国に占める割合）', density: '人口密度', area: '面積' }[m];
    legend.innerHTML = `<b>${lab}</b> <span class="year">${esc(m === 'area' ? P.meta.area.year : P.meta.population.year)}</span>
      <div class="scale">${[0, .25, .5, .75, 1].map((t) => `<span style="background:${popColor(t, 0, 1, false)}"></span>`).join('')}</div>
      <div style="display:flex;justify-content:space-between"><span>少</span><span>多</span></div>`;
  } else {
    sel.style('fill', (f) => REGION_COLOR[prefByCode.get(f.properties.code).region]);
  }
  sel.classed('selected', (f) => state.selected === f.properties.code);
  applyCounterScale();
}

// ───────────────────────── ツールチップ ─────────────────────────
function showTip(ev, text) {
  if (state.hideNames || !text || ev.pointerType === 'touch') return;
  const [x, y] = pointer(ev, document.getElementById('mapWrap'));
  tooltip.hidden = false;
  tooltip.textContent = text;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}
function hideTip() { tooltip.hidden = true; }
function prefTip(code) {
  const p = prefByCode.get(code);
  if (state.mode === 'rank' && state.rankItem) {
    const it = itemById.get(state.rankItem);
    const i = it.ranks.findIndex((r) => r.pref === code);
    return i >= 0 ? `${p.name}：${i + 1}位 ${fmt(it.ranks[i].value)}${it.unit}` : `${p.name}：11位以下`;
  }
  if (state.mode === 'pop') return `${p.name}：${popValueText(p)}`;
  return `${p.name}（${p.capital}）`;
}

// ───────────────────────── ツールバー ─────────────────────────
function renderToolbar() {
  const tb = document.getElementById('toolbar');
  const chips = LAYERS.map((l) => {
    const ic = l.ic ? icon(l.ic, 20) : l.swatch ? `<svg class="ic" viewBox="0 0 20 20" width="20" height="20"><path d="M2 14C6 4 12 18 18 6" stroke="${l.swatch}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`
      : l.dot ? `<svg class="ic" viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="6" fill="${l.dot}" stroke="#3b2a1a" stroke-width="1.4"/></svg>` : '';
    return `<button class="chip" data-layer-toggle="${l.id}" aria-pressed="${state.layers[l.id]}">${ic}${l.label}</button>`;
  }).join('');
  tb.innerHTML = chips + `<span class="sep"></span>
    <button class="chip" id="hideNames" aria-pressed="${state.hideNames}">${icon('paper', 20)}白地図テスト</button>
    <button class="chip" id="allOff">すべて消す</button>`;
  tb.querySelectorAll('[data-layer-toggle]').forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.layerToggle;
      state.layers[id] = !state.layers[id];
      b.setAttribute('aria-pressed', state.layers[id]);
      applyLayers();
    };
  });
  tb.querySelector('#hideNames').onclick = (e) => {
    state.hideNames = !state.hideNames;
    e.currentTarget.setAttribute('aria-pressed', state.hideNames);
    applyLayers();
  };
  tb.querySelector('#allOff').onclick = () => {
    for (const l of LAYERS) state.layers[l.id] = false;
    renderToolbar(); applyLayers();
  };
}

// ───────────────────────── パネル ─────────────────────────
const panelBody = document.getElementById('panelBody');
const panelEl = document.getElementById('panel');
document.getElementById('panelGrip').onclick = () => panelEl.classList.toggle('collapsed');
const expandPanel = () => panelEl.classList.remove('collapsed');

function clearSelection() { state.selected = null; state.history = []; paint(); }

function openPref(code) {
  state.selected = code;
  paint();
  zoomToPref(code);
  expandPanel();
  panelBody.innerHTML = prefCard(code);
  bindPanel();
  panelBody.scrollTop = 0;
}

function popValueText(p) {
  const m = state.popMetric;
  if (m === 'share') return `${(p.population / totalPop * 100).toFixed(2)}%`;
  if (m === 'density') return `${fmt(Math.round(p.population / p.area))}人/km²`;
  if (m === 'area') return `${fmt(Math.round(p.area))}km²`;
  return `${fmt(p.population)}人`;
}

function backButton() {
  if (state.mode === 'rank' && state.rankItem) return `<button class="chip sm" data-back="rank">← ${esc(itemById.get(state.rankItem).name)}のランキングへ</button>`;
  if (state.mode === 'pop') return `<button class="chip sm" data-back="pop">← 人口ランキングへ</button>`;
  return '';
}

function prefCard(code) {
  const p = prefByCode.get(code);
  const cityName = p.capital.replace(/（.*）/, '');
  const diff = cityName.replace(/市$/, '') !== p.short && code !== 13;
  const cities = P.designatedCities.filter((c) => c.pref === code);
  const share = (p.population / totalPop * 100).toFixed(2);
  const myRanks = items.map((it) => ({ it, i: it.ranks.findIndex((r) => r.pref === code) }))
    .filter((x) => x.i >= 0).sort((a, b) => a.i - b.i || a.it.name.localeCompare(b.it.name, 'ja'));
  const her = H.sites.filter((s) => s.prefs.includes(code));
  const has = (arr) => arr.filter((x) => x.prefs && x.prefs.includes(code));
  const geo = [
    ['山脈・山地', has(G.mountainRanges), 'range'], ['山', has(G.mountains), 'mountain'], ['川', has(G.rivers), 'river'],
    ['湖', has(G.lakes), 'lake'], ['平野・盆地・台地', has(G.plains), 'plain'], ['半島・岬・島', has(G.peninsulas), 'peninsula'],
    ['工業地帯・地域', has(G.industrialZones), 'industry'],
  ].filter(([, a]) => a.length);
  const popMeta = P.meta.population;
  return `
  ${backButton()}
  <div class="card">
    <h2>${esc(p.name)} <span class="region-tag">${esc(p.region)}地方</span></h2>
    <dl class="kv">
      <dt>${code === 13 ? '都庁所在地' : code === 1 ? '道庁所在地' : code === 26 || code === 27 ? '府庁所在地' : '県庁所在地'}</dt>
      <dd>${esc(p.capital)}${diff ? '<span class="note-diff">県名とちがう</span>' : ''}</dd>
      <dt>政令指定都市</dt><dd>${cities.length ? cities.map((c) => esc(c.name)).join('・') : '<span class="empty">なし</span>'}</dd>
      <dt>人口</dt><dd>${fmt(p.population)}人（${popRank.get(code)}位）<span class="year">${esc(popMeta.year)}</span></dd>
      <dt>人口比率</dt><dd>全国の ${share}%</dd>
      <dt>面積</dt><dd>${fmt(Math.round(p.area))}km²（${areaRank.get(code)}位）</dd>
      <dt>人口密度</dt><dd>${fmt(Math.round(p.population / p.area))}人/km²（${densRank.get(code)}位）</dd>
    </dl>
  </div>
  <div class="card">
    <h3>${icon('apple', 20)} ランキング入りしている産物</h3>
    ${myRanks.length ? `<div class="prod-list">${myRanks.map(({ it, i }) => `<button class="tag" data-item="${it.id}">${icon(it.icon, 22)}${esc(it.name)}<span class="r ${i === 0 ? 'gold' : ''}">${i + 1}位</span></button>`).join('')}</div>
      <p class="hint" style="margin-top:8px">数字は各品目のデータ年のもの。タップでランキングを表示。</p>`
      : `<p class="empty">${items.length ? '上位10位に入っている品目はありません' : 'ランキングデータを準備中です'}</p>`}
  </div>
  ${her.length ? `<div class="card"><h3>${icon('castle', 20)} 世界遺産</h3><div class="tags">${her.map((s) => `<button class="tag" data-heritage="${esc(s.name)}">${icon(s.icon, 22)}${esc(s.name)}<span class="year">${s.year}</span></button>`).join('')}</div></div>` : ''}
  ${geo.length ? `<div class="card"><h3>${icon('fuji', 20)} 地形・工業</h3>${geo.map(([t, a, kind]) => `<p><b>${t}</b><br>${a.map((x) => `<button class="tag" data-feat="${kind}" data-name="${esc(x.name)}">${esc(x.name)}</button>`).join(' ')}</p>`).join('')}</div>` : ''}
  <div class="card"><h3>${icon('craft', 20)} 伝統的工芸品（例）</h3><div class="tags">${p.crafts.map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div></div>`;
}

const FEATURE_SETS = {
  range: G.mountainRanges, mountain: G.mountains, river: G.rivers, lake: G.lakes, plain: G.plains,
  peninsula: G.peninsulas, industry: G.industrialZones, current: G.currents, heritage: H.sites,
};
function openFeature(kind, d) {
  expandPanel();
  const prefsLine = d.prefs ? `<p><b>関係する都道府県：</b>${d.prefs.map((c) => `<button class="tag" data-pref="${c}">${esc(prefByCode.get(c).name)}</button>`).join(' ')}</p>` : '';
  let head = '', body = '';
  if (kind === 'heritage') {
    head = `${icon(d.icon, 52, 'class="ic big-ic"')}<div><h2>${esc(d.name)}</h2><span class="region-tag">${d.type}遺産</span> <span class="year">${d.year}年登録</span></div>`;
    body = `<p>${esc(d.note || '')}</p>`;
  } else if (kind === 'current') {
    head = `<h2>${esc(d.name)}</h2><span class="region-tag" style="background:${d.warm ? '#ffebee' : '#e3f2fd'}">${d.warm ? '暖流' : '寒流'}</span>`;
    body = `<p>${d.warm ? '南から流れてくる、あたたかい海流です。' : '北から流れてくる、つめたい海流です。プランクトンが多く、よい漁場をつくります。'}</p>
      <p class="hint">暖流と寒流がぶつかる<b>潮目（潮境）</b>は魚が多く集まる好漁場。三陸沖が有名です。</p>`;
  } else {
    const kindLabel = { range: '山脈・山地', mountain: `山（標高${d.elev ? fmt(d.elev) : '-'}m）`, river: '川', lake: `湖（${d.kind || ''}）`, plain: d.kind, peninsula: d.kind, industry: d.kind }[kind];
    head = `<h2>${esc(d.name)}</h2><span class="region-tag">${esc(kindLabel)}</span>`;
    body = [
      d.rank ? `<p><b>面積の順位：</b>全国${d.rank}位</p>` : '',
      d.length ? `<p><b>長さ：</b>約${d.length}km</p>` : '',
      d.note ? `<p>${esc(d.note)}</p>` : '',
    ].join('');
  }
  panelBody.innerHTML = `${backButton()}<div class="card"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${head}</div>${body}${prefsLine}</div>`;
  bindPanel();
  panelBody.scrollTop = 0;
}

function homeCard() {
  const byRegion = {};
  for (const p of prefs) (byRegion[p.region] ||= []).push(p);
  return `<div class="card">
    <h2>地図をタップしてみよう</h2>
    <p class="hint">都道府県をタップすると、<b>県庁所在地・人口・ランキング入りの産物・世界遺産・地形</b>がまとめて出てきます。<br>
    上のボタンで<b>山脈・川・湖・平野・海流</b>などを重ねて表示できます。<b>白地図テスト</b>にすると名前が消えるので、言えるか試してみよう。</p>
  </div>
  <div class="card"><h3>都道府県から選ぶ</h3>
    ${Object.entries(byRegion).map(([r, ps]) => `<p><b>${r}</b><br>${ps.map((p) => `<button class="tag" data-pref="${p.code}">${esc(p.short)}</button>`).join(' ')}</p>`).join('')}
  </div>
  <div class="card"><h3>${icon('capital', 20)} 県名と県庁所在地名がちがう都道府県</h3>
    <div class="tags">${prefs.filter((p) => p.capital.replace(/市$/, '') !== p.short && p.code !== 13).map((p) => `<button class="tag" data-pref="${p.code}">${esc(p.short)} → ${esc(p.capital)}</button>`).join('')}</div>
  </div>`;
}

function rankPanel() {
  if (!items.length) {
    return `<div class="card"><h2>ランキング</h2><div class="pending">農産物・畜産・水産・工業の都道府県ランキング（1〜10位）は、政府統計から数値を読み込み中です。データがそろい次第ここに表示されます。</div></div>`;
  }
  const cats = R.categories.filter((c) => items.some((it) => it.cat === c.id));
  const cur = cats.find((c) => c.id === state.rankCat) ? state.rankCat : cats[0].id;
  state.rankCat = cur;
  const list = items.filter((it) => it.cat === cur);
  let detail = '';
  if (state.rankItem) {
    const it = itemById.get(state.rankItem);
    const max = it.ranks[0].value;
    detail = `<div class="card">
      <div style="display:flex;gap:10px;align-items:center">${icon(it.icon, 52, 'class="ic big-ic"')}
        <div><h2>${esc(it.name)}</h2><span class="year">${esc(it.year)}</span> <span class="hint">${esc(it.measure || '')}</span></div></div>
      <table class="rank-table"><tbody>
        ${it.ranks.map((r, i) => `<tr data-pref="${r.pref}"><td class="no"><span class="rank-no" style="background:${RANK_COLORS[i]};${i < 2 ? 'color:#fff' : ''}">${i + 1}</span></td>
          <td><b>${esc(prefByCode.get(r.pref).name)}</b></td>
          <td class="bar-wrap"><div class="bar" style="width:${Math.max(3, r.value / max * 100)}%"></div></td>
          <td class="val">${fmt(r.value)}<small>${esc(it.unit)}</small>${r.share != null ? `<br><small>${r.share.toFixed(1)}%</small>` : ''}</td></tr>`).join('')}
      </tbody></table>
      ${it.total ? `<p class="hint">全国計：${fmt(it.total)}${esc(it.unit)}　上位3県で全国の${(it.ranks.slice(0, 3).reduce((a, r) => a + r.value, 0) / it.total * 100).toFixed(1)}%</p>` : ''}
      ${it.memo ? `<p class="hint">💡 ${esc(it.memo)}</p>` : ''}
      <div class="src">出典：${it.sourceUrl ? `<a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">${esc(it.source)}</a>` : esc(it.source)}${it.published ? `（${esc(it.published)}公表）` : ''}</div>
    </div>`;
  }
  return `<div class="card">
    <h3>${icon('apple', 20)} 品目を選ぶ</h3>
    <div class="rank-cats">${cats.map((c) => `<button class="chip sm" data-cat="${c.id}" aria-pressed="${c.id === cur}">${esc(c.name)}</button>`).join('')}</div>
    <div class="items">${list.map((it) => `<button class="item-btn" data-item="${it.id}" aria-pressed="${it.id === state.rankItem}">${icon(it.icon, 34)}${esc(it.name)}</button>`).join('')}</div>
  </div>${detail}`;
}

function popPanel() {
  const m = state.popMetric;
  const val = (p) => (m === 'population' || m === 'share' ? p.population : m === 'density' ? p.population / p.area : p.area);
  const sorted = [...prefs].sort((a, b) => val(b) - val(a));
  const meta = m === 'area' ? P.meta.area : P.meta.population;
  const max = val(sorted[0]);
  const top8 = sorted.slice(0, 8).reduce((a, p) => a + p.population, 0);
  return `<div class="card">
    <h2>${icon('population', 30)} 人口と面積</h2>
    <div class="seg">${[['population', '人口'], ['share', '人口比率'], ['density', '人口密度'], ['area', '面積']].map(([k, l]) => `<button data-metric="${k}" aria-pressed="${m === k}">${l}</button>`).join('')}</div>
    <p class="hint">全国の人口 <b>${fmt(totalPop)}人</b> <span class="year">${esc(P.meta.population.asOf)}</span><br>
    東京都だけで全国の<b>${(prefByCode.get(13).population / totalPop * 100).toFixed(1)}%</b>、東京圏（東京・神奈川・埼玉・千葉）で<b>${([11, 12, 13, 14].reduce((a, c) => a + prefByCode.get(c).population, 0) / totalPop * 100).toFixed(1)}%</b>${m !== 'area' && m !== 'density' ? `、上位8都道府県で<b>${(top8 / totalPop * 100).toFixed(1)}%</b>` : ''}。</p>
    <table class="rank-table"><tbody>
      ${sorted.map((p, i) => `<tr data-pref="${p.code}"><td class="no"><span class="rank-no">${i + 1}</span></td><td><b>${esc(p.name)}</b></td>
        <td class="bar-wrap"><div class="bar" style="width:${Math.max(2, val(p) / max * 100)}%"></div></td><td class="val">${popValueText(p)}</td></tr>`).join('')}
    </tbody></table>
    <div class="src">出典：<a href="${esc(meta.sourceUrl)}" target="_blank" rel="noopener">${esc(meta.source)}</a>${meta.published ? `（${esc(meta.published)}公表）` : ''}</div>
  </div>`;
}

function aboutPanel() {
  const rows = [
    ['人口', P.meta.population.year + '（' + P.meta.population.asOf + '）', P.meta.population.source, P.meta.population.nextUpdate],
    ['面積', P.meta.area.year, P.meta.area.source, '毎年（国土地理院）'],
    ['世界遺産', H.meta.asOf + ' 時点 ' + H.meta.count, H.meta.source, H.meta.nextUpdate],
    ...items.map((it) => [it.name, it.year, it.source, it.nextUpdate || '']),
  ];
  return `<div class="card"><h2>出典とデータ年</h2>
    <p class="hint">数字はすべて政府の公式統計から作っています。統計によって<b>何年のデータか</b>がちがうので、塾のテキストと順位が少しちがうことがあります。そのときは<b>データ年</b>をくらべてみてください。</p>
    <table class="about-table"><thead><tr><th>項目</th><th>データ年</th><th>出典</th><th>次の更新</th></tr></thead><tbody>
    ${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}
    </tbody></table>
    <p class="src">地図：dataofjapan/land（国土数値情報をもとに作成）。山脈・川などの線は学習用に形を簡略化しています。イラストはすべてオリジナルです。<br>データ最終更新：${esc(R.meta?.updated || '-')}</p>
  </div>`;
}

function renderPanel() {
  hideTip();
  if (state.mode === 'map') panelBody.innerHTML = state.selected ? prefCard(state.selected) : homeCard();
  else if (state.mode === 'rank') panelBody.innerHTML = rankPanel();
  else if (state.mode === 'pop') panelBody.innerHTML = popPanel();
  else panelBody.innerHTML = aboutPanel();
  bindPanel();
}

function bindPanel() {
  panelBody.querySelectorAll('[data-pref]').forEach((b) => (b.onclick = () => openPref(+b.dataset.pref)));
  panelBody.querySelectorAll('[data-item]').forEach((b) => (b.onclick = () => { setMode('rank'); selectItem(b.dataset.item); }));
  panelBody.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => { state.rankCat = b.dataset.cat; renderPanel(); }));
  panelBody.querySelectorAll('[data-metric]').forEach((b) => (b.onclick = () => { state.popMetric = b.dataset.metric; paint(); renderPanel(); }));
  panelBody.querySelectorAll('[data-heritage]').forEach((b) => (b.onclick = () => openFeature('heritage', H.sites.find((s) => s.name === b.dataset.heritage))));
  panelBody.querySelectorAll('[data-feat]').forEach((b) => (b.onclick = () => openFeature(b.dataset.feat, FEATURE_SETS[b.dataset.feat].find((x) => x.name === b.dataset.name))));
  panelBody.querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => { state.selected = null; paint(); renderPanel(); }));
}

function selectItem(id) {
  const it = itemById.get(id);
  if (!it) return;
  state.rankItem = id;
  state.rankCat = it.cat;
  state.selected = null;
  paint();
  renderPanel();
  expandPanel();
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.modes button').forEach((b) => b.setAttribute('aria-selected', b.dataset.mode === mode));
  if (mode === 'rank' && !state.rankItem && items.length) state.rankItem = items.find((it) => it.cat === state.rankCat)?.id || items[0].id;
  state.selected = null;
  paint();
  renderPanel();
}
document.querySelectorAll('.modes button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));

// ───────────────────────── 起動 ─────────────────────────
renderToolbar();
applyLayers();
paint();
renderPanel();
