#!/usr/bin/env python3
"""
政府統計（e-Stat）のExcelから都道府県ランキング（1〜10位）を作り、
src/data/rankings.json を書き出す。

使い方:
  pip install pandas openpyxl xlrd
  python3 scripts/update_stats.py            # ダウンロードして作り直す
  python3 scripts/update_stats.py --cache .stats-cache   # ダウンロード済みファイルを使う

新しい年のデータが出たら、下の SOURCES の statInfId / year / published を
新しい表のものに差し替えて実行する（statInfId は e-Stat の表ページのURLに出ている12桁の番号）。
"""
import argparse, json, os, re, sys, urllib.request, datetime
import pandas as pd

PREFS = ["北海道","青森","岩手","宮城","秋田","山形","福島","茨城","栃木","群馬","埼玉","千葉","東京","神奈川","新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知","三重","滋賀","京都","大阪","兵庫","奈良","和歌山","鳥取","島根","岡山","広島","山口","徳島","香川","愛媛","高知","福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄"]
CODE = {p: i + 1 for i, p in enumerate(PREFS)}
ESTAT = "https://www.e-stat.go.jp/stat-search/file-download?statInfId={}&fileKind=0"

# ───────────── 統計ごとの共通情報 ─────────────
S = {
  "sakumotsu7": dict(year="2025年産", source="農林水産省「令和7年産 作物統計」", sourceUrl="https://www.maff.go.jp/j/tokei/kouhyou/sakumotu/", nextUpdate="毎年（翌年の春〜夏に確報）"),
  "yasai6": dict(year="2024年産", source="農林水産省「令和6年産 野菜生産出荷統計」", sourceUrl="https://www.maff.go.jp/j/tokei/kouhyou/sakumotu/sakkyou_yasai/", published="2026-06", nextUpdate="毎年（翌々年の春〜夏に確報）"),
  "kaju6": dict(year="2024年産", source="農林水産省「令和6年産 果樹生産出荷統計」", sourceUrl="https://www.maff.go.jp/j/tokei/kouhyou/sakumotu/sakkyou_kazyu/", published="2025-12", nextUpdate="毎年（翌年12月ごろに確報）"),
  "chikusan8": dict(year="2026年2月1日現在", source="農林水産省「畜産統計（令和8年2月1日現在）」", sourceUrl="https://www.maff.go.jp/j/tokei/kouhyou/tikusan/", published="2026-07", nextUpdate="毎年（7月ごろ）"),
  "gyogyo6": dict(year="2024年", source="農林水産省「令和6年 漁業・養殖業生産統計」", sourceUrl="https://www.maff.go.jp/j/tokei/kouhyou/kaimen_gyosei/", published="2026-02", nextUpdate="毎年（翌々年2〜3月ごろに確報）"),
  "keizai25": dict(year="2024年", source="経済産業省「2025年経済構造実態調査 製造業事業所調査」（2024年実績）", sourceUrl="https://www.meti.go.jp/statistics/tyo/kkj/", published="2026-07", nextUpdate="毎年（7月ごろ）"),
}

# ───────────── 品目一覧 ─────────────
# col: Excelの列番号（0始まり）。scale: 値に掛ける倍率。
ITEMS = [
  # 米・麦・豆・いも
  dict(id="rice", cat="grain", name="米（水稲）", icon="rice", unit="t", src="sakumotsu7", sid="000040420282", col=23, measure="収穫量（子実用）", published="2026-03",
       memo="新潟・北海道・秋田が「米どころ」。東北・北陸は冬の雪どけ水が豊かで、単作（1年に1回）の米づくり。"),
  dict(id="wheat", cat="grain", name="小麦", icon="wheat", unit="t", src="sakumotsu7", sid="000040440435", col=3, measure="収穫量", published="2026-03",
       memo="北海道が圧倒的。九州（福岡・佐賀）では米のあとに麦をつくる二毛作。"),
  dict(id="soy", cat="grain", name="大豆", icon="soy", unit="t", src="sakumotsu7", sid="000040469076", col=3, measure="収穫量", published="2026-06",
       memo="国内で使う大豆の多くは輸入。"),
  dict(id="soba", cat="grain", name="そば", icon="soba", unit="t", src="sakumotsu7", sid="000040469080", col=3, measure="収穫量", published="2026-06"),
  dict(id="sweetpotato", cat="grain", name="さつまいも（かんしょ）", icon="potato", unit="t", src="sakumotsu7", sid="000040469082", col=3, measure="収穫量", published="2026-06",
       memo="水はけのよいシラス台地（鹿児島・宮崎）でさかん。茨城は干しいもで有名。"),
  dict(id="potato", cat="veg", name="じゃがいも（ばれいしょ）", icon="potato", unit="t", src="yasai6", sid="000040389439", col=4, measure="収穫量",
       memo="北海道（十勝平野など）が全国の大半。輪作で畑の地力を保つ。"),
  # 野菜
  dict(id="cabbage", cat="veg", name="キャベツ", icon="cabbage", unit="t", src="yasai6", sid="000040389452", col=4, measure="収穫量",
       memo="群馬（嬬恋村）は夏に高原の涼しさを生かす抑制栽培。愛知（渥美半島）は冬キャベツ。"),
  dict(id="lettuce", cat="veg", name="レタス", icon="lettuce", unit="t", src="yasai6", sid="000040389466", col=4, measure="収穫量",
       memo="長野（野辺山原など）の夏の高原野菜（抑制栽培）。冬〜春は茨城・長崎・静岡など暖かい地域から。"),
  dict(id="hakusai", cat="veg", name="はくさい", icon="hakusai", unit="t", src="yasai6", sid="000040389447", col=4, measure="収穫量"),
  dict(id="onion", cat="veg", name="たまねぎ", icon="onion", unit="t", src="yasai6", sid="000040389479", col=4, measure="収穫量",
       memo="北海道（北見）、佐賀、兵庫（淡路島）が三大産地。"),
  dict(id="daikon", cat="veg", name="だいこん", icon="daikon", unit="t", src="yasai6", sid="000040389428", col=4, measure="収穫量"),
  dict(id="carrot", cat="veg", name="にんじん", icon="carrot", unit="t", src="yasai6", sid="000040389433", col=4, measure="収穫量"),
  dict(id="negi", cat="veg", name="ねぎ", icon="negi", unit="t", src="yasai6", sid="000040389474", col=4, measure="収穫量"),
  dict(id="spinach", cat="veg", name="ほうれんそう", icon="spinach", unit="t", src="yasai6", sid="000040389457", col=4, measure="収穫量",
       memo="大都市の近くで新鮮なうちに出荷する近郊農業の代表。"),
  dict(id="tomato", cat="veg", name="トマト", icon="tomato", unit="t", src="yasai6", sid="000040389488", col=4, measure="収穫量",
       memo="熊本（八代平野）は冬〜春の施設栽培。"),
  dict(id="cucumber", cat="veg", name="きゅうり", icon="cucumber", unit="t", src="yasai6", sid="000040389481", col=4, measure="収穫量",
       memo="宮崎・高知は暖かい冬を生かした促成栽培。"),
  dict(id="eggplant", cat="veg", name="なす", icon="eggplant", unit="t", src="yasai6", sid="000040389485", col=4, measure="収穫量",
       memo="高知平野の促成栽培が有名。"),
  dict(id="pepper", cat="veg", name="ピーマン", icon="pepper", unit="t", src="yasai6", sid="000040389494", col=4, measure="収穫量",
       memo="茨城（近郊）と宮崎・高知（促成）が上位。"),
  dict(id="pumpkin", cat="veg", name="かぼちゃ", icon="pumpkin", unit="t", src="yasai6", sid="000040389484", col=4, measure="収穫量"),
  dict(id="corn", cat="veg", name="スイートコーン", icon="corn", unit="t", src="yasai6", sid="000040389500", col=4, measure="収穫量"),
  dict(id="garlic", cat="veg", name="にんにく", icon="garlic", unit="t", src="yasai6", sid="000040389480", col=4, measure="収穫量"),
  dict(id="ginger", cat="veg", name="しょうが", icon="ginger", unit="t", src="yasai6", sid="000040389506", col=4, measure="収穫量"),
  dict(id="renkon", cat="veg", name="れんこん", icon="renkon", unit="t", src="yasai6", sid="000040389438", col=4, measure="収穫量",
       memo="茨城（霞ヶ浦のまわり）の湿地でさかん。"),
  dict(id="strawberry", cat="veg", name="いちご", icon="strawberry", unit="t", src="yasai6", sid="000040389507", col=4, measure="収穫量",
       memo="いちご・メロン・すいかは統計上「野菜」に入る。"),
  dict(id="melon", cat="veg", name="メロン", icon="melon", unit="t", src="yasai6", sid="000040389508", col=4, measure="収穫量"),
  dict(id="watermelon", cat="veg", name="すいか", icon="watermelon", unit="t", src="yasai6", sid="000040389510", col=4, measure="収穫量"),
  # 果物
  dict(id="mikan", cat="fruit", name="みかん", icon="mikan", unit="t", src="kaju6", sid="000040387931", col=6, measure="収穫量",
       memo="暖かく日当たりのよい斜面でつくる。和歌山・愛媛・静岡が上位の常連。"),
  dict(id="apple", cat="fruit", name="りんご", icon="apple", unit="t", src="kaju6", sid="000040387936", col=6, measure="収穫量",
       memo="すずしい気候の果物。青森（津軽平野）と長野で全国の大半。"),
  dict(id="grape", cat="fruit", name="ぶどう", icon="grape", unit="t", src="kaju6", sid="000040387945", col=6, measure="収穫量",
       memo="甲府盆地の扇状地は水はけがよく、ぶどう・ももに向く。"),
  dict(id="peach", cat="fruit", name="もも", icon="peach", unit="t", src="kaju6", sid="000040387941", col=6, measure="収穫量"),
  dict(id="pear", cat="fruit", name="日本なし", icon="pear", unit="t", src="kaju6", sid="000040387937", col=6, measure="収穫量"),
  dict(id="lapear", cat="fruit", name="西洋なし", icon="lapear", unit="t", src="kaju6", sid="000040387938", col=6, measure="収穫量"),
  dict(id="cherry", cat="fruit", name="さくらんぼ（おうとう）", icon="cherry", unit="t", src="kaju6", sid="000040387943", col=6, measure="収穫量",
       memo="山形盆地が一大産地。"),
  dict(id="ume", cat="fruit", name="うめ", icon="ume", unit="t", src="kaju6", sid="000040387944", col=6, measure="収穫量"),
  dict(id="kaki", cat="fruit", name="かき（柿）", icon="kaki", unit="t", src="kaju6", sid="000040387939", col=6, measure="収穫量"),
  dict(id="biwa", cat="fruit", name="びわ", icon="biwa", unit="t", src="kaju6", sid="000040387940", col=6, measure="収穫量"),
  dict(id="chestnut", cat="fruit", name="くり", icon="chestnut", unit="t", src="kaju6", sid="000040387946", col=6, measure="収穫量"),
  dict(id="kiwi", cat="fruit", name="キウイフルーツ", icon="kiwi", unit="t", src="kaju6", sid="000040387948", col=6, measure="収穫量"),
  # 工芸作物
  dict(id="tea", cat="crop", name="茶（荒茶）", icon="tea", unit="t", src="sakumotsu7", sid="000040469085", col=6, measure="荒茶生産量（主産県）", published="2026-06",
       memo="水はけのよい台地（静岡の牧ノ原、鹿児島のシラス台地）でさかん。最近は鹿児島が静岡を上回る年が続いている。"),
  dict(id="konnyaku", cat="crop", name="こんにゃくいも", icon="konnyaku", unit="t", src="sakumotsu7", sid="000040469087", col=4, measure="収穫量", published="2026-06",
       memo="群馬が全国の大半を占める。"),
  dict(id="sugarcane", cat="crop", name="さとうきび", icon="sugarcane", unit="t", src="sakumotsu7", sid="000040495187", col=10, measure="収穫量（2県のみ）", published="2026-08",
       memo="暖かい沖縄・鹿児島（南西諸島）だけでつくられる。北海道の「てんさい」も砂糖の原料。"),
  # 畜産
  dict(id="dairy", cat="livestock", name="乳用牛", icon="dairy", unit="頭", src="chikusan8", sid="000040464905", sheet="乳 (1)", col=5, measure="飼養頭数",
       memo="北海道（根釧台地など）の酪農が全国の半分以上。"),
  dict(id="beef", cat="livestock", name="肉用牛", icon="cow", unit="頭", src="chikusan8", sid="000040464905", sheet="肉 (1)", col=6, measure="飼養頭数"),
  dict(id="pig", cat="livestock", name="豚", icon="pig", unit="頭", src="chikusan8", sid="000040464905", sheet="豚 (1)", col=6, measure="飼養頭数"),
  dict(id="layer", cat="livestock", name="採卵鶏（たまご）", icon="egg", unit="千羽", src="chikusan8", sid="000040464905", sheet="採卵鶏 (1)", col=7, measure="飼養羽数"),
  dict(id="broiler", cat="livestock", name="ブロイラー（肉用の鶏）", icon="chicken", unit="千羽", src="chikusan8", sid="000040464905", sheet="ブロイラー (1)", col=3, measure="飼養羽数",
       memo="南九州（鹿児島・宮崎）と岩手でさかん。"),
  # 水産
  dict(id="catch", cat="fish", name="漁獲量（海面漁業）", icon="fish", unit="t", src="gyogyo6", sid="000040415921", col=2, measure="海面漁業の漁獲量", first=True,
       memo="北海道が断トツ。銚子（千葉）・焼津（静岡）・八戸（青森）などの漁港が有名。"),
  dict(id="scallop", cat="fish", name="ほたて（養殖）", icon="scallop", unit="t", src="gyogyo6", sid="000040416347", col=17, measure="海面養殖の収獲量",
       memo="陸奥湾（青森）・サロマ湖（北海道）など。"),
  dict(id="oyster", cat="fish", name="かき（養殖）", icon="oyster", unit="t", src="gyogyo6", sid="000040416347", col=18, measure="海面養殖の収獲量",
       memo="広島湾が一大産地。"),
  dict(id="nori", cat="fish", name="のり（養殖）", icon="nori", unit="t", src="gyogyo6", sid="000040416347", col=26, measure="海面養殖の収獲量",
       memo="有明海（佐賀・福岡・熊本）と瀬戸内海（兵庫など）でさかん。"),
  dict(id="wakame", cat="fish", name="わかめ（養殖）", icon="wakame", unit="t", src="gyogyo6", sid="000040416347", col=25, measure="海面養殖の収獲量",
       memo="三陸海岸（岩手・宮城）のリアス海岸で養殖。"),
  dict(id="buri", cat="fish", name="ぶり類（養殖）", icon="fish", unit="t", src="gyogyo6", sid="000040416347", col=5, measure="海面養殖の収獲量"),
  dict(id="madai", cat="fish", name="まだい（養殖）", icon="madai", unit="t", src="gyogyo6", sid="000040416347", col=11, measure="海面養殖の収獲量",
       memo="宇和海（愛媛）のリアス海岸でさかん。"),
  dict(id="pearl", cat="fish", name="真珠（養殖）", icon="pearl", unit="kg", src="gyogyo6", sid="000040416347", col=34, measure="海面養殖の収獲量",
       memo="英虞湾（三重・志摩半島）で御木本幸吉が養殖に成功。"),
  dict(id="eel", cat="fish", name="うなぎ（養殖）", icon="eel", unit="t", src="gyogyo6", sid="000040416356", col=8, measure="内水面養殖の収獲量",
       memo="浜名湖（静岡）が養殖発祥の地。今は鹿児島・愛知・宮崎などが中心。"),
]
# 工業（製造品出荷額等）：経済構造実態調査 第1表（産業中分類コード）
MFG_SID = "000040480531"
MFG = [
  dict(id="mfg_total", ic="00", name="製造品出荷額等（合計）", icon="factory",
       memo="自動車工業のさかんな愛知が1位。中京工業地帯は出荷額が日本一の工業地帯。"),
  dict(id="mfg_car", ic="31", name="輸送用機械（自動車など）", icon="car",
       memo="豊田市（愛知）・浜松市（静岡）・太田市（群馬）などの自動車・オートバイ工場。"),
  dict(id="mfg_chem", ic="16", name="化学工業", icon="chemical",
       memo="石油化学コンビナートのある京葉・瀬戸内などでさかん。"),
  dict(id="mfg_steel", ic="22", name="鉄鋼業", icon="steel",
       memo="原料の鉄鉱石・石炭を船で運ぶため、臨海部に製鉄所がある。"),
  dict(id="mfg_oil", ic="17", name="石油製品・石炭製品", icon="oil"),
  dict(id="mfg_food", ic="09", name="食料品", icon="food",
       memo="原料の農産物・水産物が多い北海道が上位。"),
  dict(id="mfg_elec", ic="28", name="電子部品・デバイス", icon="chip"),
  dict(id="mfg_textile", ic="11", name="繊維工業", icon="textile"),
  dict(id="mfg_paper", ic="14", name="パルプ・紙・紙加工品", icon="paper",
       memo="富士市（静岡）は富士山の豊かな地下水を使う製紙業で有名。"),
  dict(id="mfg_print", ic="15", name="印刷", icon="print",
       memo="情報が集まる東京とその周辺でさかん（京浜工業地帯の特色）。"),
]

def norm(s):
    s = re.sub(r"[\s　]", "", str(s))
    if s != "北海道":
        s = re.sub(r"(都|道|府|県)$", "", s)
    return s

def num(v):
    if isinstance(v, (int, float)) and v == v:
        return float(v)
    s = str(v).replace(",", "").strip()
    try:
        return float(s)
    except ValueError:
        return None

def name_of(row):
    for v in row:
        if isinstance(v, str) and v.strip():
            return norm(v)
    return None

def fetch(sid, cache):
    path = os.path.join(cache, sid + ".xls")
    if not os.path.exists(path):
        print("  download", sid, file=sys.stderr)
        with urllib.request.urlopen(ESTAT.format(sid), timeout=120) as r:
            data = r.read()
        if data[:5] in (b"<!DOC", b"<html"):
            raise RuntimeError(f"{sid}: ファイルを取得できませんでした（statInfIdを確認）")
        with open(path, "wb") as f:
            f.write(data)
    return path

def read(path, sheet=0):
    try:
        xs = pd.read_excel(path, sheet_name=None, header=None)
    except Exception:
        xs = pd.read_excel(path, sheet_name=None, header=None, engine="xlrd")
    return list(xs.values())[sheet] if isinstance(sheet, int) else xs[sheet]

def extract(df, col, first=False):
    rows = df.values.tolist()
    total = None
    for r in rows:
        if name_of(r[:3]) in ("全国", "全国計"):
            total = num(r[col]); break
    hk = [i for i, r in enumerate(rows) if name_of(r[:3]) == "北海道"]
    st = 0 if (first or len(hk) < 2) else hk[1]
    vals = {}
    for r in rows[st:]:
        n = name_of(r[:3])
        if n in CODE and n not in vals:
            v = num(r[col])
            if v is not None and v > 0:
                vals[n] = v
    return vals, total

def ranking(vals, total, scale=1):
    top = sorted(vals.items(), key=lambda kv: -kv[1])[:10]
    out = []
    for n, v in top:
        e = {"pref": CODE[n], "value": round(v * scale, 1) if scale != 1 else int(round(v))}
        if total:
            e["share"] = round(v / total * 100, 1)
        out.append(e)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=".stats-cache")
    ap.add_argument("--out", default="src/data/rankings.json")
    a = ap.parse_args()
    os.makedirs(a.cache, exist_ok=True)
    items, problems = [], []
    for it in ITEMS:
        src = S[it["src"]]
        df = read(fetch(it["sid"], a.cache), it.get("sheet", 0))
        vals, total = extract(df, it["col"], it.get("first", False))
        if total and len(vals) >= 40:
            ssum = sum(vals.values())
            if abs(ssum - total) / total > 0.05:
                problems.append(f"{it['name']}: 県の合計 {ssum:.0f} と全国 {total:.0f} が合いません")
        if not vals:
            problems.append(f"{it['name']}: 値を読み取れませんでした"); continue
        rec = {k: it[k] for k in ("id", "cat", "name", "icon", "unit", "measure") if k in it}
        rec.update(year=src["year"], source=src["source"], sourceUrl=src["sourceUrl"],
                   published=it.get("published", src.get("published", "")), nextUpdate=src["nextUpdate"],
                   statInfId=it["sid"])
        if it.get("memo"): rec["memo"] = it["memo"]
        if total: rec["total"] = int(round(total))
        rec["ranks"] = ranking(vals, total)
        items.append(rec)
    # 工業
    df = read(fetch(MFG_SID, a.cache), "第１表")
    df = df.iloc[9:, :]
    latest = max(int(y) for y in df[2].dropna().astype(str) if str(y).isdigit())
    src = S["keizai25"]
    for m in MFG:
        sub = df[(df[2].astype(str) == str(latest)) & (df[3].astype(str).str.zfill(2) == m["ic"])]
        vals, total = {}, None
        for _, r in sub.iterrows():
            pc = str(r[5]).zfill(2)
            v = num(r[11])
            if pc == "00": total = v
            elif pc.isdigit() and 1 <= int(pc) <= 47 and v:
                vals[PREFS[int(pc) - 1]] = v
        rec = dict(id=m["id"], cat="industry", name=m["name"], icon=m["icon"], unit="億円", measure="製造品出荷額等",
                   year=f"{latest}年", source=src["source"], sourceUrl=src["sourceUrl"], published=src["published"],
                   nextUpdate=src["nextUpdate"], statInfId=MFG_SID)
        if m.get("memo"): rec["memo"] = m["memo"]
        if total: rec["total"] = int(round(total / 100))
        rec["ranks"] = [{"pref": CODE[n], "value": int(round(v / 100)), **({"share": round(v / total * 100, 1)} if total else {})}
                        for n, v in sorted(vals.items(), key=lambda kv: -kv[1])[:10]]
        items.append(rec)
    out = {
        "meta": {"updated": datetime.date.today().isoformat()},
        "categories": [
            {"id": "grain", "name": "米・麦・豆・いも"}, {"id": "veg", "name": "野菜"}, {"id": "fruit", "name": "果物"},
            {"id": "crop", "name": "茶など"}, {"id": "livestock", "name": "畜産"}, {"id": "fish", "name": "水産"},
            {"id": "industry", "name": "工業"},
        ],
        "items": items,
    }
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"{len(items)}品目を書き出しました → {a.out}")
    for p in problems:
        print("⚠", p)
    return 1 if problems else 0

if __name__ == "__main__":
    sys.exit(main())
