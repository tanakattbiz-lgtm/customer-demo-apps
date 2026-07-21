import { subDays, subHours } from "date-fns";

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------
export type MenuTag =
  | "ガラスコーティング"
  | "セラミックコーティング"
  | "ポリマー加工"
  | "ホイールコーティング"
  | "ウィンドウ撥水"
  | "ヘッドライト磨き"
  | "プロテクションフィルム"
  | "水垢・鉄粉除去"
  | "ルームクリーニング";

export type RegionKey =
  | "hokkaido-tohoku"
  | "kanto"
  | "chubu"
  | "kansai"
  | "chugoku-shikoku"
  | "kyushu";

export interface Menu {
  tag: MenuTag;
  name: string;
  price: number; // 目安料金(税込)
  duration: string; // 施工目安
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1..5
  car: string; // 車種
  menu: MenuTag;
  body: string;
  createdAt: string; // ISO
  helpful: number;
}

export interface Gallery {
  id: string;
  title: string;
  hue: number; // 施工事例サムネの色相
}

export interface Shop {
  id: string;
  name: string;
  region: RegionKey;
  pref: string;
  city: string;
  station: string;
  catch: string;
  tags: MenuTag[];
  menus: Menu[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  hue: number; // メインビジュアルの色相
  established: number; // 創業年
  hours: string;
  holiday: string;
  badges: string[];
  isPromoted: boolean;
  isNew: boolean;
  gallery: Gallery[];
  reviews: Review[];
}

export interface Application {
  id: string;
  shopName: string;
  region: RegionKey;
  pref: string;
  contact: string;
  menus: MenuTag[];
  plan: "free" | "standard" | "premium";
  message: string;
  createdAt: string;
  status: "審査中";
}

export interface AppData {
  shops: Shop[];
  applications: Application[];
  bookmarks: string[];
}

// ---------------------------------------------------------------------------
// マスタ
// ---------------------------------------------------------------------------
export const REGIONS: { key: RegionKey; label: string }[] = [
  { key: "hokkaido-tohoku", label: "北海道・東北" },
  { key: "kanto", label: "関東" },
  { key: "chubu", label: "中部" },
  { key: "kansai", label: "関西" },
  { key: "chugoku-shikoku", label: "中国・四国" },
  { key: "kyushu", label: "九州・沖縄" },
];

export const ALL_TAGS: MenuTag[] = [
  "ガラスコーティング",
  "セラミックコーティング",
  "ポリマー加工",
  "ホイールコーティング",
  "ウィンドウ撥水",
  "ヘッドライト磨き",
  "プロテクションフィルム",
  "水垢・鉄粉除去",
  "ルームクリーニング",
];

// ---------------------------------------------------------------------------
// レビュー生成
// ---------------------------------------------------------------------------
const REVIEW_AUTHORS = [
  "たかし",
  "MR2乗り",
  "coating_love",
  "週末ドライバー",
  "ゆうすけ",
  "白のアクア",
  "haruka.n",
  "ミニバン一家",
  "kenji_86",
  "湾岸ナイト",
  "sana",
  "黒革シート",
  "旧車おやじ",
  "yoko1201",
  "ターボ好き",
];
const CARS = [
  "トヨタ アルファード",
  "ホンダ シビック",
  "日産 スカイライン",
  "マツダ CX-5",
  "スバル レヴォーグ",
  "トヨタ プリウス",
  "レクサス RX",
  "スズキ ジムニー",
  "BMW 3シリーズ",
  "トヨタ ランドクルーザー",
  "ホンダ フリード",
  "日産 ノート",
];
const REVIEW_BODIES = [
  "施工前に下地の状態を丁寧に説明してくれました。仕上がりの艶が想像以上で、水はけも見違えるようです。",
  "納車直後に依頼。ムラなく均一で、ボディが一段深い色に見えます。予約から施工までの対応も丁寧でした。",
  "洗車キズが気になっていましたが、磨き後は照明の映り込みまで綺麗になりました。長く付き合いたい工房です。",
  "料金は決して安くはないですが、下処理の工程数を見て納得。メンテナンスの案内も具体的で安心でした。",
  "雨の翌日でも汚れがサッと落ちるようになりました。撥水の持ちも良く、洗車が楽になったのが一番の効果です。",
  "駐車場の環境や普段の使い方までヒアリングした上でプランを提案してくれました。押し売り感が全くない点も好印象。",
  "ホイールまでコーティングしてもらい、ブレーキダストがこびりつかなくなりました。細部の作業が丁寧です。",
  "写真で見るより実車の艶がすごい。完成後に施工箇所を一緒に確認しながら説明してくれるのが良かったです。",
];

let rc = 0;
function makeReviews(shopSeed: number, tags: MenuTag[], count: number): Review[] {
  const n = Math.min(count, 4);
  const out: Review[] = [];
  for (let i = 0; i < n; i++) {
    const k = (shopSeed * 7 + i * 13) % REVIEW_BODIES.length;
    const rating = i === 0 ? 5 : ((shopSeed + i) % 5 >= 3 ? 5 : 4);
    out.push({
      id: `rv_seed_${rc++}`,
      author: REVIEW_AUTHORS[(shopSeed * 3 + i * 5) % REVIEW_AUTHORS.length],
      rating,
      car: CARS[(shopSeed * 2 + i * 3) % CARS.length],
      menu: tags[i % tags.length],
      body: REVIEW_BODIES[k],
      createdAt: subDays(subHours(new Date(), i * 9 + 2), i * 11 + shopSeed).toISOString(),
      helpful: ((shopSeed * 5 + i * 7) % 22) + 1,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// メニュー定義(タグ→標準メニュー)
// ---------------------------------------------------------------------------
const MENU_DEF: Record<MenuTag, { name: string; price: number; duration: string }> = {
  "ガラスコーティング": { name: "ガラス被膜コーティング（Sサイズ）", price: 44000, duration: "約1日" },
  "セラミックコーティング": { name: "セラミックプロ 9H", price: 132000, duration: "2〜3日" },
  "ポリマー加工": { name: "ポリマーシーラント", price: 19800, duration: "約3時間" },
  "ホイールコーティング": { name: "ホイールコーティング（4本）", price: 16500, duration: "約2時間" },
  "ウィンドウ撥水": { name: "フロント撥水加工", price: 6600, duration: "約1時間" },
  "ヘッドライト磨き": { name: "ヘッドライト研磨＋保護", price: 11000, duration: "約1.5時間" },
  "プロテクションフィルム": { name: "PPF フロント一式", price: 88000, duration: "2〜4日" },
  "水垢・鉄粉除去": { name: "下地クリーニング（鉄粉・水垢）", price: 13200, duration: "約2時間" },
  "ルームクリーニング": { name: "室内クリーニング（一台）", price: 22000, duration: "約3時間" },
};

const GALLERY_TITLES = [
  "純白ボディの艶出し施工",
  "輸入車セラミック9H",
  "ミニバン親水コート",
  "ヘッドライト黄ばみ除去",
  "ホイール4本コート",
  "旧車のレストア磨き",
  "ブラックボディ鏡面仕上げ",
  "PPF部分施工",
];

// ---------------------------------------------------------------------------
// 店舗マスタ(サンプルデータ:実在企業ではない架空のダミー)
// ---------------------------------------------------------------------------
type ShopSeed = {
  name: string;
  region: RegionKey;
  pref: string;
  city: string;
  station: string;
  catch: string;
  tags: MenuTag[];
  rating: number;
  reviewCount: number;
  hue: number;
  established: number;
  hours: string;
  holiday: string;
  badges: string[];
  promoted?: boolean;
  isNew?: boolean;
};

const SHOP_SEEDS: ShopSeed[] = [
  {
    name: "グロスファクトリー 横浜",
    region: "kanto", pref: "神奈川県", city: "横浜市港北区", station: "新横浜駅 車8分",
    catch: "国産・輸入車問わず年間800台超。下地処理に定評のある鏡面仕上げ専門店。",
    tags: ["ガラスコーティング", "セラミックコーティング", "水垢・鉄粉除去", "ホイールコーティング"],
    rating: 4.8, reviewCount: 214, hue: 232, established: 2011,
    hours: "10:00〜19:00", holiday: "水曜", badges: ["口コミ人気", "実績多数"], promoted: true,
  },
  {
    name: "カーケアスタジオ AQUA 名古屋",
    region: "chubu", pref: "愛知県", city: "名古屋市中川区", station: "高畑駅 車6分",
    catch: "親水×撥水の使い分けを相談できる。洗車のしやすさで選ぶならここ。",
    tags: ["ガラスコーティング", "ウィンドウ撥水", "ポリマー加工", "ヘッドライト磨き"],
    rating: 4.7, reviewCount: 168, hue: 205, established: 2015,
    hours: "9:30〜18:30", holiday: "火曜", badges: ["女性に人気"], promoted: true,
  },
  {
    name: "ディテールラボ 大阪本店",
    region: "kansai", pref: "大阪府", city: "大阪市西淀川区", station: "御幣島駅 車5分",
    catch: "セラミックコーティングの認定施工店。輸入車・新車の預かり施工に対応。",
    tags: ["セラミックコーティング", "プロテクションフィルム", "ガラスコーティング"],
    rating: 4.9, reviewCount: 302, hue: 250, established: 2009,
    hours: "10:00〜20:00", holiday: "不定休", badges: ["最高評価", "認定施工店"], promoted: true,
  },
  {
    name: "コーティングプロ 札幌",
    region: "hokkaido-tohoku", pref: "北海道", city: "札幌市白石区", station: "南郷7丁目駅 車4分",
    catch: "融雪剤・凍結対策に強い北国仕様の下地処理。冬前の予約が多い人気店。",
    tags: ["ガラスコーティング", "水垢・鉄粉除去", "ホイールコーティング"],
    rating: 4.6, reviewCount: 121, hue: 220, established: 2013,
    hours: "9:00〜18:00", holiday: "日曜", badges: ["地域No.1"],
  },
  {
    name: "シャインワークス 仙台",
    region: "hokkaido-tohoku", pref: "宮城県", city: "仙台市宮城野区", station: "陸前原ノ町駅 車7分",
    catch: "1台ずつ丁寧に。作業風景を写真で共有してくれる透明性の高い工房。",
    tags: ["ポリマー加工", "ウィンドウ撥水", "ルームクリーニング"],
    rating: 4.5, reviewCount: 78, hue: 210, established: 2018,
    hours: "10:00〜19:00", holiday: "木曜", badges: [],
  },
  {
    name: "ミラーフィニッシュ 東京世田谷",
    region: "kanto", pref: "東京都", city: "世田谷区喜多見", station: "喜多見駅 徒歩10分",
    catch: "黒・濃色車の磨きに特化。ディテーリングコンテスト入賞歴あり。",
    tags: ["セラミックコーティング", "水垢・鉄粉除去", "ヘッドライト磨き"],
    rating: 4.8, reviewCount: 156, hue: 240, established: 2016,
    hours: "10:00〜19:00", holiday: "水曜・木曜", badges: ["磨きの匠"],
  },
  {
    name: "アクアシールド さいたま",
    region: "kanto", pref: "埼玉県", city: "さいたま市見沼区", station: "七里駅 車5分",
    catch: "ファミリーカー・ミニバンの施工実績多数。キッズスペース完備。",
    tags: ["ガラスコーティング", "ルームクリーニング", "ウィンドウ撥水"],
    rating: 4.4, reviewCount: 64, hue: 200, established: 2019,
    hours: "9:30〜18:00", holiday: "火曜", badges: ["家族連れ歓迎"], isNew: true,
  },
  {
    name: "ポリッシュガレージ 千葉",
    region: "kanto", pref: "千葉県", city: "千葉市稲毛区", station: "稲毛駅 車6分",
    catch: "旧車・絶版車の塗装磨きに強い。オーナーはレストア出身。",
    tags: ["ポリマー加工", "水垢・鉄粉除去", "ヘッドライト磨き"],
    rating: 4.6, reviewCount: 92, hue: 245, established: 2012,
    hours: "10:00〜18:30", holiday: "月曜", badges: ["旧車対応"],
  },
  {
    name: "ラスターケア 静岡",
    region: "chubu", pref: "静岡県", city: "浜松市中央区", station: "天竜川駅 車8分",
    catch: "海沿いの塩害対策コートが得意。ボディ下部の防錆まで相談可。",
    tags: ["ガラスコーティング", "ホイールコーティング", "水垢・鉄粉除去"],
    rating: 4.5, reviewCount: 57, hue: 195, established: 2017,
    hours: "9:00〜18:00", holiday: "日曜", badges: [],
  },
  {
    name: "ノーブルコート 金沢",
    region: "chubu", pref: "石川県", city: "金沢市泉本町", station: "西泉駅 車6分",
    catch: "少数完全予約制。1台に時間をかける高品質施工がリピーターに好評。",
    tags: ["セラミックコーティング", "ガラスコーティング", "ルームクリーニング"],
    rating: 4.9, reviewCount: 88, hue: 255, established: 2014,
    hours: "完全予約制", holiday: "不定休", badges: ["完全予約制"],
  },
  {
    name: "ブルーミラー 京都",
    region: "kansai", pref: "京都府", city: "京都市伏見区", station: "竹田駅 車5分",
    catch: "施工後3年の無料メンテ点検付き。長く乗る人向けのプランが充実。",
    tags: ["ガラスコーティング", "ウィンドウ撥水", "ホイールコーティング"],
    rating: 4.7, reviewCount: 134, hue: 228, established: 2015,
    hours: "10:00〜19:00", holiday: "水曜", badges: ["アフター充実"],
  },
  {
    name: "ヴェールコーティング 神戸",
    region: "kansai", pref: "兵庫県", city: "神戸市東灘区", station: "住吉駅 車4分",
    catch: "輸入車ディーラー出身スタッフ在籍。デリケートな塗装も安心して任せられる。",
    tags: ["セラミックコーティング", "プロテクションフィルム", "水垢・鉄粉除去"],
    rating: 4.8, reviewCount: 176, hue: 238, established: 2013,
    hours: "10:00〜20:00", holiday: "火曜", badges: ["輸入車得意"],
  },
  {
    name: "クリアラボ 広島",
    region: "chugoku-shikoku", pref: "広島県", city: "広島市西区", station: "横川駅 車7分",
    catch: "コストと品質のバランス重視。まず一台試したい人に選ばれる街の実力店。",
    tags: ["ポリマー加工", "ガラスコーティング", "ウィンドウ撥水"],
    rating: 4.4, reviewCount: 61, hue: 215, established: 2018,
    hours: "9:30〜18:30", holiday: "木曜", badges: ["コスパ重視"], isNew: true,
  },
  {
    name: "サンシャインディテール 高松",
    region: "chugoku-shikoku", pref: "香川県", city: "高松市国分寺町", station: "端岡駅 車6分",
    catch: "室内クリーニングとセットの丸ごとリフレッシュが人気。",
    tags: ["ルームクリーニング", "ガラスコーティング", "ヘッドライト磨き"],
    rating: 4.5, reviewCount: 49, hue: 190, established: 2019,
    hours: "10:00〜18:00", holiday: "水曜", badges: [],
  },
  {
    name: "グラスフィニッシュ 福岡",
    region: "kyushu", pref: "福岡県", city: "福岡市博多区", station: "竹下駅 車5分",
    catch: "九州最大級の施工ブース。台数をこなす体制で短納期に対応。",
    tags: ["ガラスコーティング", "セラミックコーティング", "ホイールコーティング", "水垢・鉄粉除去"],
    rating: 4.7, reviewCount: 198, hue: 233, established: 2010,
    hours: "9:00〜20:00", holiday: "不定休", badges: ["短納期対応"], promoted: true,
  },
  {
    name: "リフレクト 熊本",
    region: "kyushu", pref: "熊本県", city: "熊本市東区", station: "健軍町駅 車6分",
    catch: "施工前後の光沢を数値で計測して見せてくれる、根拠のある提案が魅力。",
    tags: ["ガラスコーティング", "ポリマー加工", "ヘッドライト磨き"],
    rating: 4.6, reviewCount: 73, hue: 225, established: 2016,
    hours: "10:00〜19:00", holiday: "火曜", badges: ["光沢計測"],
  },
  {
    name: "アークガラスコート 東京立川",
    region: "kanto", pref: "東京都", city: "立川市栄町", station: "立川駅 車8分",
    catch: "法人・社用車のまとめ施工に対応。見積りから納車まで一括管理。",
    tags: ["ポリマー加工", "ガラスコーティング", "ルームクリーニング"],
    rating: 4.3, reviewCount: 52, hue: 248, established: 2017,
    hours: "9:00〜18:00", holiday: "日曜", badges: ["法人対応"],
  },
  {
    name: "シルキーコート 神戸三宮",
    region: "kansai", pref: "兵庫県", city: "神戸市中央区", station: "三宮駅 車5分",
    catch: "駅近で預けやすい。代車完備で施工中も生活に支障が出にくい。",
    tags: ["ガラスコーティング", "ウィンドウ撥水", "ホイールコーティング"],
    rating: 4.5, reviewCount: 84, hue: 218, established: 2018,
    hours: "10:00〜20:00", holiday: "水曜", badges: ["代車あり"], isNew: true,
  },
];

// ---------------------------------------------------------------------------
// シード構築
// ---------------------------------------------------------------------------
export function buildSeed(): AppData {
  rc = 0;
  const shops: Shop[] = SHOP_SEEDS.map((s, i) => {
    const menus: Menu[] = s.tags.map((tag) => ({ tag, ...MENU_DEF[tag] }));
    const priceFrom = Math.min(...menus.map((m) => m.price));
    const gallery: Gallery[] = Array.from({ length: 4 }, (_, g) => ({
      id: `gl_${i}_${g}`,
      title: GALLERY_TITLES[(i + g) % GALLERY_TITLES.length],
      hue: (s.hue + g * 12 - 18 + 360) % 360,
    }));
    return {
      id: `shop_${i + 1}`,
      name: s.name,
      region: s.region,
      pref: s.pref,
      city: s.city,
      station: s.station,
      catch: s.catch,
      tags: s.tags,
      menus,
      rating: s.rating,
      reviewCount: s.reviewCount,
      priceFrom,
      hue: s.hue,
      established: s.established,
      hours: s.hours,
      holiday: s.holiday,
      badges: s.badges,
      isPromoted: !!s.promoted,
      isNew: !!s.isNew,
      gallery,
      reviews: makeReviews(i + 1, s.tags, 4),
    };
  });

  return { shops, applications: [], bookmarks: [] };
}
