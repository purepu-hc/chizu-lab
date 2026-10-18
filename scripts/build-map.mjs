// 都道府県の地図データ（dataofjapan/land の japan.topojson）を
// アプリ用に分割・軽量化して src/data/map.json に書き出す。
// 使い方: node scripts/build-map.mjs <japan.topojson のパス>
import fs from 'node:fs';
import * as topojsonClient from 'topojson-client';
import * as topojsonServer from 'topojson-server';
import * as simplify from 'topojson-simplify';

const src = process.argv[2];
if (!src) throw new Error('japan.topojson のパスを指定してください');
const topo = JSON.parse(fs.readFileSync(src, 'utf8'));
const fc = topojsonClient.feature(topo, topo.objects.japan);

// ポリゴンの重心のおおよその位置で「本土」「南西諸島（インセット）」「小笠原（インセット）」に振り分ける
function centroid(ring) {
  let x = 0, y = 0;
  for (const [lon, lat] of ring) { x += lon; y += lat; }
  return [x / ring.length, y / ring.length];
}
function partOf([lon, lat]) {
  if (lon > 140.5 && lat < 30) return lat < 25.5 ? 'drop' : 'ogasawara'; // 沖ノ鳥島・南鳥島は除外
  if (lat < 30 && lon < 131.5) return 'ryukyu'; // トカラ列島〜奄美〜沖縄
  if (lat < 32.5 && lon > 139 && lon < 141) return 'drop'; // 伊豆諸島南部の小島（鳥島など）は省略
  return 'main';
}

const out = [];
for (const f of fc.features) {
  const code = f.properties.id;
  const name = f.properties.nam_ja;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const parts = {};
  for (const p of polys) {
    const part = partOf(centroid(p[0]));
    if (part === 'drop') continue;
    (parts[part] ||= []).push(p);
  }
  for (const [part, coords] of Object.entries(parts)) {
    out.push({
      type: 'Feature',
      properties: { code, name, part },
      geometry: { type: 'MultiPolygon', coordinates: coords },
    });
  }
}

let t = topojsonServer.topology({ p: { type: 'FeatureCollection', features: out } }, 1e4);
t = simplify.presimplify(t);
t = simplify.simplify(t, simplify.quantile(t, 0.6));
t = simplify.filter(t, simplify.filterWeight(t, simplify.quantile(t, 0.2)));
// 間引いた結果をGeoJSONに戻し、座標を丸めて再度トポロジー化（重み情報を捨てる）
const simplified = topojsonClient.feature(t, t.objects.p);
const round = (c) => (typeof c[0] === 'number' ? [Math.round(c[0] * 1000) / 1000, Math.round(c[1] * 1000) / 1000] : c.map(round));
for (const f of simplified.features) f.geometry.coordinates = round(f.geometry.coordinates);
simplified.features = simplified.features.filter((f) => f.geometry.coordinates.length);
t = topojsonServer.topology({ p: simplified }, 1e4);
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/map.json', JSON.stringify(t));
console.log('features:', out.length, 'bytes:', JSON.stringify(t).length);
