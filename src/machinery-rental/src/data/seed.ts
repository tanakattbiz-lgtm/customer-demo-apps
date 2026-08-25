import { addDays, format, subDays } from "date-fns";

/* =========================================================
   デモ用ダミーデータ
   ※ 実在の企業・人物・個人情報は一切含みません
   ========================================================= */

export type CategoryId =
  | "mini-excavator"
  | "excavator"
  | "large-excavator"
  | "wheel-loader"
  | "bulldozer"
  | "crusher"
  | "carrier"
  | "aerial"
  | "attachment"
  | "small";

export type ArtKind =
  | "excavator"
  | "loader"
  | "dozer"
  | "crusher"
  | "carrier"
  | "aerial"
  | "attachment"
  | "small";

export type Category = {
  id: CategoryId;
  label: string;
  short: string;
  art: ArtKind;
  desc: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "mini-excavator",
    label: "ミニ油圧ショベル",
    short: "ミニショベル",
    art: "excavator",
    desc: "0.8〜3.5t クラス。住宅地・狭所の掘削や外構工事に。後方超小旋回モデルを常時在庫。",
  },
  {
    id: "excavator",
    label: "油圧ショベル(小中型)",
    short: "ショベル",
    art: "excavator",
    desc: "4〜13t クラス。土木工事の主力機。ICT マシンコントロール対応機を多数用意。",
  },
  {
    id: "large-excavator",
    label: "大型油圧ショベル",
    short: "大型ショベル",
    art: "excavator",
    desc: "20t 超クラス。造成・法面・大規模土工に。輸送手配までワンストップで対応。",
  },
  {
    id: "wheel-loader",
    label: "ホイールローダ",
    short: "ローダ",
    art: "loader",
    desc: "積込・除雪・ヤード整備に。除雪仕様(プラウ・スノーバケット)は冬季の予約受付。",
  },
  {
    id: "bulldozer",
    label: "ブルドーザ",
    short: "ドーザ",
    art: "dozer",
    desc: "敷均し・整地・押土に。インテリジェント マシンコントロール搭載機を選択可能。",
  },
  {
    id: "crusher",
    label: "環境リサイクル機械",
    short: "リサイクル",
    art: "crusher",
    desc: "自走式破砕機・木材破砕機・スケルトンバケット。現場内再資源化でダンプ台数を削減。",
  },
  {
    id: "carrier",
    label: "運搬機械",
    short: "運搬",
    art: "carrier",
    desc: "クローラダンプ・ホイールキャリア。不整地の土砂運搬、山間部工事に。",
  },
  {
    id: "aerial",
    label: "高所作業車",
    short: "高所",
    art: "aerial",
    desc: "自走式・トラック式。屋内点検から橋梁・鉄骨作業まで作業床高さ別に選定。",
  },
  {
    id: "attachment",
    label: "アタッチメント",
    short: "アタッチ",
    art: "attachment",
    desc: "油圧ブレーカ・圧砕機・フォーク・草刈。母機に合わせた配管確認まで実施。",
  },
  {
    id: "small",
    label: "小物・発電機",
    short: "小物",
    art: "small",
    desc: "発電機・コンプレッサ・転圧機・投光器。当日出しにも柔軟に対応。",
  },
];

export type Branch = {
  id: string;
  name: string;
  area: string;
  tel: string;
  hours: string;
  x: number; // 拠点マップ上の相対座標(%)
  y: number;
};

export const BRANCHES: Branch[] = [
  { id: "yonago", name: "米子営業所", area: "鳥取県西部", tel: "0859-00-0000", hours: "8:00-17:30", x: 47, y: 40 },
  { id: "tottori", name: "鳥取営業所", area: "鳥取県東部", tel: "0857-00-0000", hours: "8:00-17:30", x: 81, y: 27 },
  { id: "kurayoshi", name: "倉吉営業所", area: "鳥取県中部", tel: "0858-00-0000", hours: "8:00-17:30", x: 65, y: 33 },
  { id: "matsue", name: "松江営業所", area: "島根県東部", tel: "0852-00-0000", hours: "8:00-17:30", x: 35, y: 43 },
  { id: "izumo", name: "出雲営業所", area: "島根県中部", tel: "0853-00-0000", hours: "8:00-17:30", x: 22, y: 46 },
  { id: "hamada", name: "浜田営業所", area: "島根県西部", tel: "0855-00-0000", hours: "8:00-17:30", x: 8, y: 51 },
];

export type Spec = { label: string; value: string };

export type Machine = {
  id: string;
  name: string;
  model: string;
  category: CategoryId;
  art: ArtKind;
  classLabel: string;
  weightT: number;
  power: string;
  summary: string;
  specs: Spec[];
  tags: string[];
  ict: boolean;
  eco: boolean;
  popular: boolean;
  dayRate: number;
  monthRate: number;
  /** 営業所ごとの空き台数 */
  stock: Record<string, number>;
  rating: number;
  reviews: number;
};

const stock = (...v: number[]): Record<string, number> =>
  Object.fromEntries(BRANCHES.map((b, i) => [b.id, v[i] ?? 0]));

export const MACHINES: Machine[] = [
  {
    id: "mx-008",
    name: "ミニ油圧ショベル 0.8t",
    model: "MX-08MR",
    category: "mini-excavator",
    art: "excavator",
    classLabel: "0.8t クラス",
    weightT: 0.85,
    power: "10.2 kW",
    summary: "軽トラ積載可能。庭まわり・水道配管の掘削など狭小地の定番機。",
    specs: [
      { label: "運転質量", value: "0.85 t" },
      { label: "バケット容量", value: "0.022 m³" },
      { label: "全幅", value: "700 mm(可変脚)" },
      { label: "最大掘削深さ", value: "1,720 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["狭所", "軽トラ積載", "可変脚"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 8800,
    monthRate: 92000,
    stock: stock(4, 3, 2, 5, 3, 2),
    rating: 4.6,
    reviews: 38,
  },
  {
    id: "mx-020",
    name: "ミニ油圧ショベル 2t",
    model: "MX-20MR",
    category: "mini-excavator",
    art: "excavator",
    classLabel: "2.0t クラス",
    weightT: 2.1,
    power: "14.7 kW",
    summary: "外構・造園で最も出番の多いクラス。ゴムクローラで舗装面を傷めません。",
    specs: [
      { label: "運転質量", value: "2.1 t" },
      { label: "バケット容量", value: "0.06 m³" },
      { label: "全幅", value: "1,300 mm" },
      { label: "最大掘削深さ", value: "2,540 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["後方超小旋回", "ゴムクローラ", "配管付"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 11000,
    monthRate: 118000,
    stock: stock(6, 4, 3, 6, 4, 3),
    rating: 4.7,
    reviews: 64,
  },
  {
    id: "mx-030",
    name: "ミニ油圧ショベル 3t",
    model: "MX-30MR",
    category: "mini-excavator",
    art: "excavator",
    classLabel: "3.0t クラス",
    weightT: 3.2,
    power: "17.4 kW",
    summary: "2t と 4t の中間。プレート・ブレーカとの組み合わせ需要が高いクラス。",
    specs: [
      { label: "運転質量", value: "3.2 t" },
      { label: "バケット容量", value: "0.09 m³" },
      { label: "全幅", value: "1,550 mm" },
      { label: "最大掘削深さ", value: "3,080 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["後方超小旋回", "2ndライン配管", "人気"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 13200,
    monthRate: 138000,
    stock: stock(5, 3, 2, 4, 3, 2),
    rating: 4.8,
    reviews: 91,
  },
  {
    id: "mx-035c",
    name: "ミニ油圧ショベル 3.5t(クローラ幅広)",
    model: "MX-35W",
    category: "mini-excavator",
    art: "excavator",
    classLabel: "3.5t クラス",
    weightT: 3.6,
    power: "18.2 kW",
    summary: "接地圧を抑えた幅広クローラ仕様。軟弱地盤・農地の工事に。",
    specs: [
      { label: "運転質量", value: "3.6 t" },
      { label: "バケット容量", value: "0.11 m³" },
      { label: "接地圧", value: "26 kPa" },
      { label: "最大掘削深さ", value: "3,240 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["軟弱地盤", "幅広クローラ"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 14300,
    monthRate: 148000,
    stock: stock(2, 1, 1, 2, 2, 1),
    rating: 4.4,
    reviews: 21,
  },
  {
    id: "ex-050",
    name: "油圧ショベル 5t",
    model: "EX-50",
    category: "excavator",
    art: "excavator",
    classLabel: "5t クラス",
    weightT: 5.2,
    power: "28.5 kW",
    summary: "上下水道・側溝施工の主力機。キャブ仕様で長時間作業も快適です。",
    specs: [
      { label: "運転質量", value: "5.2 t" },
      { label: "バケット容量", value: "0.16 m³" },
      { label: "全幅", value: "1,960 mm" },
      { label: "最大掘削深さ", value: "3,680 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["キャブ", "配管付", "オフセット可"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 17600,
    monthRate: 182000,
    stock: stock(3, 2, 2, 3, 2, 1),
    rating: 4.5,
    reviews: 44,
  },
  {
    id: "ex-080i",
    name: "ICT 油圧ショベル 8t",
    model: "EX-80i",
    category: "excavator",
    art: "excavator",
    classLabel: "8t クラス",
    weightT: 8.4,
    power: "48 kW",
    summary: "マシンコントロール標準搭載。3D 設計データ通りに自動で仕上げ、丁張り作業を削減。",
    specs: [
      { label: "運転質量", value: "8.4 t" },
      { label: "バケット容量", value: "0.28 m³" },
      { label: "ICT 機能", value: "3D マシンコントロール" },
      { label: "測位", value: "GNSS 2 周波 / 補正情報対応" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["ICT", "3D-MC", "丁張り不要"],
    ict: true,
    eco: true,
    popular: true,
    dayRate: 28600,
    monthRate: 296000,
    stock: stock(2, 1, 1, 2, 1, 1),
    rating: 4.9,
    reviews: 57,
  },
  {
    id: "ex-120",
    name: "油圧ショベル 12t",
    model: "EX-120",
    category: "excavator",
    art: "excavator",
    classLabel: "12t クラス",
    weightT: 12.6,
    power: "68 kW",
    summary: "掘削力と機動性のバランス型。河川改修や造成の中核を担うクラス。",
    specs: [
      { label: "運転質量", value: "12.6 t" },
      { label: "バケット容量", value: "0.45 m³" },
      { label: "全幅", value: "2,490 mm" },
      { label: "最大掘削深さ", value: "5,140 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["2ndライン配管", "クイックカプラ"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 30800,
    monthRate: 318000,
    stock: stock(3, 2, 1, 3, 2, 1),
    rating: 4.6,
    reviews: 33,
  },
  {
    id: "ex-135i",
    name: "ICT 油圧ショベル 13t",
    model: "EX-135i",
    category: "excavator",
    art: "excavator",
    classLabel: "13t クラス",
    weightT: 13.4,
    power: "72 kW",
    summary: "法面整形の仕上がりが安定。出来形の自動記録で書類作成の手間も削減。",
    specs: [
      { label: "運転質量", value: "13.4 t" },
      { label: "バケット容量", value: "0.5 m³" },
      { label: "ICT 機能", value: "3D マシンコントロール / 出来形計測" },
      { label: "測位", value: "GNSS 2 周波 / 補正情報対応" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["ICT", "法面整形", "出来形計測"],
    ict: true,
    eco: true,
    popular: true,
    dayRate: 39600,
    monthRate: 408000,
    stock: stock(2, 1, 0, 2, 1, 0),
    rating: 4.9,
    reviews: 48,
  },
  {
    id: "ex-200",
    name: "大型油圧ショベル 20t",
    model: "EX-200",
    category: "large-excavator",
    art: "excavator",
    classLabel: "20t クラス",
    weightT: 20.4,
    power: "103 kW",
    summary: "土工の標準機。大量掘削・積込に。輸送(セルフ・重機回送)まで手配可能。",
    specs: [
      { label: "運転質量", value: "20.4 t" },
      { label: "バケット容量", value: "0.8 m³" },
      { label: "全幅", value: "2,800 mm" },
      { label: "最大掘削深さ", value: "6,620 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["大量掘削", "輸送手配可"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 46200,
    monthRate: 462000,
    stock: stock(3, 1, 1, 2, 2, 1),
    rating: 4.7,
    reviews: 52,
  },
  {
    id: "ex-210i",
    name: "ICT 大型油圧ショベル 21t",
    model: "EX-210i",
    category: "large-excavator",
    art: "excavator",
    classLabel: "21t クラス",
    weightT: 21.2,
    power: "116 kW",
    summary: "大規模造成の生産性を底上げ。オペレータの熟練度差を吸収します。",
    specs: [
      { label: "運転質量", value: "21.2 t" },
      { label: "バケット容量", value: "0.8 m³" },
      { label: "ICT 機能", value: "3D マシンコントロール" },
      { label: "施工履歴", value: "クラウド自動アップロード" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["ICT", "3D-MC", "施工履歴"],
    ict: true,
    eco: true,
    popular: true,
    dayRate: 57200,
    monthRate: 572000,
    stock: stock(2, 1, 0, 1, 1, 0),
    rating: 4.9,
    reviews: 29,
  },
  {
    id: "ex-300",
    name: "大型油圧ショベル 30t",
    model: "EX-300",
    category: "large-excavator",
    art: "excavator",
    classLabel: "30t クラス",
    weightT: 31.5,
    power: "180 kW",
    summary: "採石場・大規模土工向け。稼働台数が限られるため早めのご予約を推奨します。",
    specs: [
      { label: "運転質量", value: "31.5 t" },
      { label: "バケット容量", value: "1.4 m³" },
      { label: "全幅", value: "3,190 mm" },
      { label: "最大掘削深さ", value: "7,380 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["採石", "大規模土工"],
    ict: false,
    eco: false,
    popular: false,
    dayRate: 79200,
    monthRate: 792000,
    stock: stock(1, 0, 0, 1, 1, 0),
    rating: 4.5,
    reviews: 12,
  },
  {
    id: "wl-30",
    name: "ホイールローダ 0.3m³",
    model: "WL-30",
    category: "wheel-loader",
    art: "loader",
    classLabel: "0.3 m³ クラス",
    weightT: 2.8,
    power: "26 kW",
    summary: "小回り重視の小型ローダ。畜産・堆肥切返し・小規模除雪にも。",
    specs: [
      { label: "運転質量", value: "2.8 t" },
      { label: "バケット容量", value: "0.3 m³" },
      { label: "最大荷重", value: "600 kg" },
      { label: "全幅", value: "1,340 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["小回り", "畜産", "除雪可"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 15400,
    monthRate: 158000,
    stock: stock(3, 2, 2, 3, 2, 2),
    rating: 4.4,
    reviews: 26,
  },
  {
    id: "wl-13",
    name: "ホイールローダ 1.3m³",
    model: "WL-130",
    category: "wheel-loader",
    art: "loader",
    classLabel: "1.3 m³ クラス",
    weightT: 8.9,
    power: "72 kW",
    summary: "ヤード整備・骨材積込の定番。冬季は除雪仕様への換装も承ります。",
    specs: [
      { label: "運転質量", value: "8.9 t" },
      { label: "バケット容量", value: "1.3 m³" },
      { label: "最大荷重", value: "2,400 kg" },
      { label: "全幅", value: "2,150 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["積込", "ヤード整備", "除雪換装可"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 30800,
    monthRate: 316000,
    stock: stock(3, 2, 1, 3, 2, 1),
    rating: 4.7,
    reviews: 41,
  },
  {
    id: "wl-snow",
    name: "ホイールローダ 除雪仕様",
    model: "WL-130S",
    category: "wheel-loader",
    art: "loader",
    classLabel: "除雪仕様",
    weightT: 9.2,
    power: "72 kW",
    summary: "スノープラウ + スノーバケット装着済。11月からの冬季予約を受付中。",
    specs: [
      { label: "運転質量", value: "9.2 t" },
      { label: "プラウ幅", value: "2,700 mm" },
      { label: "スノーバケット", value: "2.0 m³" },
      { label: "装備", value: "回転灯・熱線ミラー・スタッドレス" },
      { label: "貸出期間", value: "12月〜3月(季節契約)" },
    ],
    tags: ["除雪", "季節契約", "冬季予約"],
    ict: false,
    eco: false,
    popular: false,
    dayRate: 35200,
    monthRate: 352000,
    stock: stock(2, 2, 1, 2, 1, 1),
    rating: 4.6,
    reviews: 18,
  },
  {
    id: "bd-40",
    name: "ブルドーザ 4t",
    model: "BD-40",
    category: "bulldozer",
    art: "dozer",
    classLabel: "4t クラス",
    weightT: 4.4,
    power: "40 kW",
    summary: "小規模造成・敷均しに。湿地仕様の選択も可能です。",
    specs: [
      { label: "運転質量", value: "4.4 t" },
      { label: "ブレード容量", value: "0.85 m³" },
      { label: "接地圧", value: "28 kPa" },
      { label: "全幅", value: "2,050 mm" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["敷均し", "湿地仕様選択可"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 26400,
    monthRate: 272000,
    stock: stock(2, 1, 1, 2, 1, 1),
    rating: 4.3,
    reviews: 15,
  },
  {
    id: "bd-16i",
    name: "ICT ブルドーザ 16t",
    model: "BD-160i",
    category: "bulldozer",
    art: "dozer",
    classLabel: "16t クラス",
    weightT: 16.8,
    power: "108 kW",
    summary: "排土板が自動で設計面に追従。粗掘削から仕上げまで一台で完結します。",
    specs: [
      { label: "運転質量", value: "16.8 t" },
      { label: "ブレード容量", value: "3.1 m³" },
      { label: "ICT 機能", value: "インテリジェント マシンコントロール" },
      { label: "対応データ", value: "LandXML / TIN" },
      { label: "排出ガス規制", value: "第4次基準適合" },
    ],
    tags: ["ICT", "自動整地", "仕上げ精度"],
    ict: true,
    eco: true,
    popular: true,
    dayRate: 63800,
    monthRate: 638000,
    stock: stock(1, 1, 0, 1, 1, 0),
    rating: 4.8,
    reviews: 22,
  },
  {
    id: "cr-jaw",
    name: "自走式ジョークラッシャ",
    model: "RC-J60",
    category: "crusher",
    art: "crusher",
    classLabel: "処理能力 60t/h",
    weightT: 21.5,
    power: "119 kW",
    summary: "現場内でコンクリート殻を再生砕石に。搬出ダンプ台数と処分費を大幅に削減。",
    specs: [
      { label: "処理能力", value: "最大 60 t/h" },
      { label: "投入口", value: "760 × 480 mm" },
      { label: "運転質量", value: "21.5 t" },
      { label: "排出粒度", value: "40〜130 mm(可変)" },
      { label: "付帯", value: "磁選機・散水装置" },
    ],
    tags: ["現場内再資源化", "CO2削減", "処分費削減"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 92400,
    monthRate: 880000,
    stock: stock(1, 0, 0, 1, 1, 0),
    rating: 4.7,
    reviews: 14,
  },
  {
    id: "cr-wood",
    name: "自走式木材破砕機",
    model: "RC-W35",
    category: "crusher",
    art: "crusher",
    classLabel: "処理能力 35t/h",
    weightT: 15.2,
    power: "96 kW",
    summary: "伐採木・剪定枝をチップ化。バイオマス燃料・堆肥原料としての活用に。",
    specs: [
      { label: "処理能力", value: "最大 35 t/h" },
      { label: "投入口", value: "1,100 × 600 mm" },
      { label: "運転質量", value: "15.2 t" },
      { label: "チップサイズ", value: "30〜80 mm" },
      { label: "付帯", value: "リモコン操作対応" },
    ],
    tags: ["伐採木", "バイオマス", "リモコン"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 79200,
    monthRate: 748000,
    stock: stock(1, 0, 0, 1, 0, 1),
    rating: 4.5,
    reviews: 9,
  },
  {
    id: "cr-screen",
    name: "自走式スクリーン(篩機)",
    model: "RC-S45",
    category: "crusher",
    art: "crusher",
    classLabel: "処理能力 45t/h",
    weightT: 12.4,
    power: "62 kW",
    summary: "掘削土の分級・良質土の選別に。クラッシャと組み合わせて一連処理が可能。",
    specs: [
      { label: "処理能力", value: "最大 45 t/h" },
      { label: "スクリーン", value: "2 デッキ / 網目交換式" },
      { label: "運転質量", value: "12.4 t" },
      { label: "排出", value: "3 山同時排出" },
      { label: "付帯", value: "ホッパ増設可" },
    ],
    tags: ["分級", "良質土選別"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 61600,
    monthRate: 594000,
    stock: stock(1, 0, 1, 1, 0, 0),
    rating: 4.4,
    reviews: 7,
  },
  {
    id: "ca-15",
    name: "クローラダンプ 1.5t",
    model: "CD-15",
    category: "carrier",
    art: "carrier",
    classLabel: "積載 1.5t",
    weightT: 1.9,
    power: "13 kW",
    summary: "不整地・軟弱地の土砂運搬に。急傾斜地の造林作業でも実績多数。",
    specs: [
      { label: "最大積載量", value: "1,500 kg" },
      { label: "荷台容量", value: "0.9 m³" },
      { label: "登坂能力", value: "25°" },
      { label: "全幅", value: "1,180 mm" },
      { label: "ダンプ方式", value: "後方 / 三転(選択可)" },
    ],
    tags: ["不整地", "急傾斜", "三転選択可"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 12100,
    monthRate: 126000,
    stock: stock(4, 3, 2, 4, 3, 2),
    rating: 4.5,
    reviews: 30,
  },
  {
    id: "ca-40",
    name: "クローラキャリア 4t",
    model: "CD-40",
    category: "carrier",
    art: "carrier",
    classLabel: "積載 4t",
    weightT: 4.8,
    power: "42 kW",
    summary: "山間部の資材運搬・砂防工事に。接地圧が低く軟弱地でも安定走行。",
    specs: [
      { label: "最大積載量", value: "4,000 kg" },
      { label: "荷台容量", value: "2.6 m³" },
      { label: "接地圧", value: "24 kPa" },
      { label: "全幅", value: "1,880 mm" },
      { label: "登坂能力", value: "28°" },
    ],
    tags: ["砂防", "山間部", "低接地圧"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 24200,
    monthRate: 248000,
    stock: stock(2, 1, 1, 2, 1, 1),
    rating: 4.6,
    reviews: 16,
  },
  {
    id: "av-12",
    name: "自走式高所作業車 12m",
    model: "AW-120",
    category: "aerial",
    art: "aerial",
    classLabel: "作業床高さ 12m",
    weightT: 6.6,
    power: "電動 / ディーゼル",
    summary: "屋外の設備点検・外壁作業に。ブーム型で障害物越えの位置決めが容易。",
    specs: [
      { label: "作業床高さ", value: "12.0 m" },
      { label: "最大積載", value: "230 kg" },
      { label: "水平移動距離", value: "6.7 m" },
      { label: "駆動", value: "ディーゼル 4WD" },
      { label: "全幅", value: "1,750 mm" },
    ],
    tags: ["屋外", "ブーム型", "4WD"],
    ict: false,
    eco: false,
    popular: false,
    dayRate: 22000,
    monthRate: 224000,
    stock: stock(2, 2, 1, 2, 1, 1),
    rating: 4.4,
    reviews: 24,
  },
  {
    id: "av-08e",
    name: "電動シザースリフト 8m",
    model: "AW-080E",
    category: "aerial",
    art: "aerial",
    classLabel: "作業床高さ 8m",
    weightT: 2.3,
    power: "バッテリー電動",
    summary: "排ガスゼロ・低騒音。工場や体育館など屋内作業に最適です。",
    specs: [
      { label: "作業床高さ", value: "7.8 m" },
      { label: "最大積載", value: "230 kg" },
      { label: "駆動", value: "バッテリー電動" },
      { label: "全幅", value: "810 mm" },
      { label: "連続稼働", value: "約 8 時間" },
    ],
    tags: ["屋内", "電動", "低騒音"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 13200,
    monthRate: 136000,
    stock: stock(3, 2, 2, 3, 2, 1),
    rating: 4.7,
    reviews: 35,
  },
  {
    id: "at-breaker",
    name: "油圧ブレーカ(3〜13t 母機用)",
    model: "AT-BR700",
    category: "attachment",
    art: "attachment",
    classLabel: "母機 3〜13t",
    weightT: 0.55,
    power: "—",
    summary: "コンクリート・岩盤の破砕に。母機側の配管仕様を事前確認のうえ手配します。",
    specs: [
      { label: "本体質量", value: "550 kg" },
      { label: "適合母機", value: "3〜13 t" },
      { label: "打撃数", value: "500〜1,000 min⁻¹" },
      { label: "作動油量", value: "60〜100 L/min" },
      { label: "付属", value: "ロッド 2 種 / 防振ブラケット" },
    ],
    tags: ["破砕", "配管確認込み"],
    ict: false,
    eco: false,
    popular: true,
    dayRate: 8800,
    monthRate: 88000,
    stock: stock(5, 3, 3, 5, 3, 2),
    rating: 4.6,
    reviews: 47,
  },
  {
    id: "at-crusher",
    name: "小割圧砕機",
    model: "AT-CR300",
    category: "attachment",
    art: "attachment",
    classLabel: "母機 10〜20t",
    weightT: 0.98,
    power: "—",
    summary: "解体現場の二次破砕・鉄筋切断に。粉じんを抑えた低騒音施工が可能。",
    specs: [
      { label: "本体質量", value: "980 kg" },
      { label: "適合母機", value: "10〜20 t" },
      { label: "最大開口", value: "560 mm" },
      { label: "破砕力", value: "480 kN" },
      { label: "旋回", value: "360° 油圧回転" },
    ],
    tags: ["解体", "低騒音", "360°回転"],
    ict: false,
    eco: false,
    popular: false,
    dayRate: 12100,
    monthRate: 121000,
    stock: stock(2, 1, 1, 2, 1, 1),
    rating: 4.5,
    reviews: 19,
  },
  {
    id: "at-fork",
    name: "フォークグラップル",
    model: "AT-GR250",
    category: "attachment",
    art: "attachment",
    classLabel: "母機 5〜13t",
    weightT: 0.42,
    power: "—",
    summary: "伐採木・廃材の掴み作業に。開口幅が広く、かさばる資材の積込も効率的。",
    specs: [
      { label: "本体質量", value: "420 kg" },
      { label: "適合母機", value: "5〜13 t" },
      { label: "最大開口", value: "1,450 mm" },
      { label: "爪本数", value: "4 本 / 2 本(選択)" },
      { label: "旋回", value: "360° 油圧回転" },
    ],
    tags: ["伐採木", "廃材積込"],
    ict: false,
    eco: false,
    popular: false,
    dayRate: 7700,
    monthRate: 77000,
    stock: stock(3, 2, 2, 3, 2, 1),
    rating: 4.3,
    reviews: 12,
  },
  {
    id: "at-mower",
    name: "油圧草刈アタッチメント",
    model: "AT-MW150",
    category: "attachment",
    art: "attachment",
    classLabel: "母機 3〜8t",
    weightT: 0.31,
    power: "—",
    summary: "法面・河川敷の草刈に。人力作業を機械化し、暑熱下の負担を軽減します。",
    specs: [
      { label: "本体質量", value: "310 kg" },
      { label: "適合母機", value: "3〜8 t" },
      { label: "刈幅", value: "1,500 mm" },
      { label: "刈刃", value: "フリーナイフ式" },
      { label: "作動油量", value: "45〜70 L/min" },
    ],
    tags: ["法面", "河川敷", "省人化"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 8800,
    monthRate: 88000,
    stock: stock(2, 2, 1, 2, 1, 1),
    rating: 4.4,
    reviews: 11,
  },
  {
    id: "sm-gen25",
    name: "発電機 25kVA",
    model: "SG-25",
    category: "small",
    art: "small",
    classLabel: "25 kVA",
    weightT: 0.72,
    power: "25 kVA",
    summary: "現場事務所・照明・小型溶接機の電源に。防音型で住宅地でも使用可。",
    specs: [
      { label: "定格出力", value: "25 kVA" },
      { label: "出力電圧", value: "三相 200V / 単相 100V" },
      { label: "騒音値", value: "65 dB(7m)" },
      { label: "燃料タンク", value: "60 L(連続 10 時間)" },
      { label: "牽引", value: "トレーラ仕様あり" },
    ],
    tags: ["防音型", "当日出し可"],
    ict: false,
    eco: true,
    popular: true,
    dayRate: 5500,
    monthRate: 56000,
    stock: stock(6, 4, 4, 6, 4, 3),
    rating: 4.6,
    reviews: 58,
  },
  {
    id: "sm-comp",
    name: "エンジンコンプレッサ 3.7m³",
    model: "SC-37",
    category: "small",
    art: "small",
    classLabel: "3.7 m³/min",
    weightT: 0.78,
    power: "24 kW",
    summary: "削岩機・エアツールの動力源に。防音キャノピー標準装備。",
    specs: [
      { label: "吐出空気量", value: "3.7 m³/min" },
      { label: "使用圧力", value: "0.69 MPa" },
      { label: "騒音値", value: "68 dB(7m)" },
      { label: "燃料タンク", value: "55 L" },
      { label: "付属", value: "エアホース 20m × 2" },
    ],
    tags: ["防音型", "エアツール"],
    ict: false,
    eco: false,
    popular: false,
    dayRate: 5500,
    monthRate: 54000,
    stock: stock(4, 3, 2, 4, 2, 2),
    rating: 4.3,
    reviews: 22,
  },
  {
    id: "sm-plate",
    name: "振動プレート 60kg",
    model: "SP-60",
    category: "small",
    art: "small",
    classLabel: "60 kg",
    weightT: 0.06,
    power: "3.1 kW",
    summary: "路盤・埋戻しの転圧に。軽量で一人でも扱いやすいサイズ。",
    specs: [
      { label: "機械質量", value: "60 kg" },
      { label: "起振力", value: "10.5 kN" },
      { label: "プレート寸法", value: "500 × 350 mm" },
      { label: "燃料", value: "ガソリン" },
      { label: "付属", value: "散水タンク" },
    ],
    tags: ["転圧", "軽量", "当日出し可"],
    ict: false,
    eco: false,
    popular: true,
    dayRate: 3300,
    monthRate: 33000,
    stock: stock(8, 6, 5, 8, 5, 4),
    rating: 4.5,
    reviews: 71,
  },
  {
    id: "sm-roller",
    name: "ハンドガイドローラ 0.8t",
    model: "SR-08",
    category: "small",
    art: "small",
    classLabel: "0.8t",
    weightT: 0.82,
    power: "8.2 kW",
    summary: "アスファルト舗装の仕上げ転圧に。散水装置付きで付着を防ぎます。",
    specs: [
      { label: "運転質量", value: "0.82 t" },
      { label: "転圧幅", value: "650 mm" },
      { label: "起振力", value: "16 kN" },
      { label: "散水", value: "60 L タンク" },
      { label: "燃料", value: "ディーゼル" },
    ],
    tags: ["舗装", "散水付"],
    ict: false,
    eco: false,
    popular: false,
    dayRate: 6600,
    monthRate: 66000,
    stock: stock(3, 2, 2, 3, 2, 1),
    rating: 4.4,
    reviews: 18,
  },
  {
    id: "sm-light",
    name: "バルーン投光機",
    model: "SL-BL2",
    category: "small",
    art: "small",
    classLabel: "LED 400W",
    weightT: 0.09,
    power: "400 W",
    summary: "夜間工事のグレアを抑える全方向照明。近隣への光害配慮が必要な現場に。",
    specs: [
      { label: "光源", value: "LED 400 W" },
      { label: "照射範囲", value: "半径 約 25 m" },
      { label: "設置高さ", value: "最大 4.0 m" },
      { label: "電源", value: "単相 100V" },
      { label: "収納", value: "専用ケース付" },
    ],
    tags: ["夜間工事", "光害配慮", "LED"],
    ict: false,
    eco: true,
    popular: false,
    dayRate: 4400,
    monthRate: 44000,
    stock: stock(4, 3, 2, 4, 2, 2),
    rating: 4.5,
    reviews: 26,
  },
];

/* --------------------- オプション --------------------- */
export type OptionItem = {
  id: string;
  label: string;
  desc: string;
  price: number;
  unit: "一式" | "1日" | "1回";
  recommended?: boolean;
};

export const OPTIONS: OptionItem[] = [
  {
    id: "transport",
    label: "現場までの往復輸送",
    desc: "回送車で現場に直接お届け・引取り。積込積下ろしも当社で行います。",
    price: 33000,
    unit: "一式",
    recommended: true,
  },
  {
    id: "insurance",
    label: "機械補償プラン",
    desc: "レンタル中の破損・盗難の自己負担を軽減。免責額 5 万円。",
    price: 1100,
    unit: "1日",
    recommended: true,
  },
  {
    id: "fuel",
    label: "燃料満タン返し免除",
    desc: "返却時の給油が不要になります。給油の手間と立替精算をカット。",
    price: 8800,
    unit: "一式",
  },
  {
    id: "ictsupport",
    label: "ICT 現場立会サポート",
    desc: "初期設定・キャリブレーション・オペレータ講習を現地で実施(半日)。",
    price: 55000,
    unit: "1回",
    recommended: true,
  },
  {
    id: "operator",
    label: "オペレータ手配",
    desc: "有資格オペレータを手配します(8 時間/日、残業別途)。",
    price: 44000,
    unit: "1日",
  },
  {
    id: "night",
    label: "夜間・休日引取り対応",
    desc: "営業時間外の引取りに対応。急な工程変更にも柔軟に。",
    price: 16500,
    unit: "1回",
  },
];

/* --------------------- お知らせ --------------------- */
export type NewsItem = {
  id: string;
  date: string;
  category: "お知らせ" | "新商品" | "ICT" | "採用" | "イベント";
  title: string;
  body: string;
};

const d = (n: number) => format(subDays(new Date(), n), "yyyy-MM-dd");

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    date: d(3),
    category: "ICT",
    title: "ICT 建機の Web 空き状況照会をリニューアルしました",
    body: "オンラインで各営業所の在庫と空き予定日を確認できるようになりました。仮予約からそのままお見積り依頼まで進めます。",
  },
  {
    id: "n2",
    date: d(9),
    category: "新商品",
    title: "電動シザースリフト 8m を全営業所に追加導入",
    body: "排ガスゼロ・低騒音で屋内作業に最適な電動モデルを増車しました。工場・倉庫・体育館の改修工事にご活用ください。",
  },
  {
    id: "n3",
    date: d(16),
    category: "イベント",
    title: "ICT 建機デモンストレーション実演会を開催します",
    body: "3D マシンコントロール搭載機を実際に操作いただける体験会です。丁張り作業の削減効果をその場でご確認いただけます。",
  },
  {
    id: "n4",
    date: d(24),
    category: "お知らせ",
    title: "夏季休業期間中の緊急対応窓口について",
    body: "休業期間中も現場トラブルに備え、24 時間の緊急連絡窓口を設置しています。故障・不具合はこちらへご連絡ください。",
  },
  {
    id: "n5",
    date: d(38),
    category: "採用",
    title: "整備スタッフ・営業スタッフを募集しています",
    body: "完全週休二日制、資格取得支援制度あり。未経験からの整備士育成にも力を入れています。",
  },
  {
    id: "n6",
    date: d(51),
    category: "ICT",
    title: "レトロフィット キット装着機のレンタルを開始",
    body: "既存の油圧ショベルに後付けで 3D マシンガイダンスを追加。ICT 施工を低コストで始められます。",
  },
];

/* --------------------- 導入事例 --------------------- */
export type CaseStudy = {
  id: string;
  client: string;
  industry: string;
  title: string;
  problem: string;
  solution: string;
  metricLabel: string;
  metricValue: string;
  sub: string;
  art: ArtKind;
};

export const CASES: CaseStudy[] = [
  {
    id: "c1",
    client: "○○建設 株式会社",
    industry: "総合建設業 / 社員 48 名",
    title: "ICT 油圧ショベルで丁張り作業をほぼゼロに",
    problem: "河川改修工事で丁張り設置に毎回 2 名 × 半日を要し、若手だけでは施工精度がばらついていた。",
    solution: "3D マシンコントロール搭載機をレンタルし、初期設定と講習を当社スタッフが現場で実施。",
    metricLabel: "丁張り工数",
    metricValue: "-82%",
    sub: "仕上がり精度のばらつきも解消",
    art: "excavator",
  },
  {
    id: "c2",
    client: "株式会社 ○○興業",
    industry: "解体・産廃業 / 社員 22 名",
    title: "現場内破砕でダンプ搬出を 3 分の 1 に",
    problem: "解体で出るコンクリート殻の搬出費・処分費が工事原価を圧迫していた。",
    solution: "自走式ジョークラッシャを 2 か月レンタルし、再生砕石として現場内で路盤に再利用。",
    metricLabel: "搬出ダンプ台数",
    metricValue: "-67%",
    sub: "処分費と CO2 排出を同時に削減",
    art: "crusher",
  },
  {
    id: "c3",
    client: "○○土木 有限会社",
    industry: "土木工事業 / 社員 15 名",
    title: "繁忙期だけ増車、閑散期は返却で固定費を圧縮",
    problem: "自社保有機の稼働率が年間で偏り、閑散期も維持費と車検費用が発生していた。",
    solution: "自社保有を主力 2 台に絞り、繁忙期の増車をすべてレンタルへ切替。",
    metricLabel: "機械関連コスト",
    metricValue: "-24%",
    sub: "整備・車検の管理工数もゼロに",
    art: "loader",
  },
  {
    id: "c4",
    client: "○○緑地 株式会社",
    industry: "造園・維持管理 / 社員 31 名",
    title: "草刈アタッチメントで法面作業を機械化",
    problem: "夏場の法面草刈を人力で行っており、熱中症リスクと人員確保が課題だった。",
    solution: "既存ミニショベルに油圧草刈アタッチメントを装着。配管改造も当社で手配。",
    metricLabel: "作業人日",
    metricValue: "-55%",
    sub: "暑熱下の人力作業を大幅に削減",
    art: "attachment",
  },
];

/* --------------------- 強み --------------------- */
export const STRENGTHS = [
  {
    id: "s1",
    title: "山陰 6 拠点、最短当日お届け",
    body: "鳥取・島根の全域をカバー。急な増車や機械トラブルにも、最寄り拠点から即日で代替機を手配します。",
    stat: "6",
    statUnit: "営業所",
  },
  {
    id: "s2",
    title: "ICT 建機を「使えるまで」支援",
    body: "貸すだけで終わりません。初期設定・キャリブレーション・オペレータ講習まで現場で伴走します。",
    stat: "38",
    statUnit: "台の ICT 建機",
  },
  {
    id: "s3",
    title: "自社整備工場で品質を担保",
    body: "返却のたびに整備士が全数点検。稼働データを基にした予防整備で、現場での故障を未然に防ぎます。",
    stat: "99.2",
    statUnit: "% 稼働率",
  },
  {
    id: "s4",
    title: "現場内再資源化でコストを削減",
    body: "破砕機・篩機で発生土やコンクリート殻を現場で再利用。搬出費・処分費・CO2 を同時に抑えます。",
    stat: "-31",
    statUnit: "% 搬出費",
  },
];

/* --------------------- ICT 稼働データ --------------------- */
export const ICT_UTILIZATION = Array.from({ length: 12 }, (_, i) => {
  const base = [62, 65, 71, 78, 74, 69, 66, 70, 76, 83, 88, 84];
  return {
    month: `${((new Date().getMonth() + i) % 12) + 1}月`,
    稼働率: base[i],
    ICT機: Math.round(base[i] * 0.92 + 6),
  };
});

export const ICT_EFFECT = [
  { name: "丁張り工数", 従来: 100, ICT施工: 18 },
  { name: "施工日数", 従来: 100, ICT施工: 64 },
  { name: "手戻り", 従来: 100, ICT施工: 27 },
  { name: "書類作成", 従来: 100, ICT施工: 41 },
];

export const FLEET_MIX = [
  { name: "油圧ショベル", value: 186 },
  { name: "ホイールローダ", value: 74 },
  { name: "運搬・ドーザ", value: 58 },
  { name: "環境リサイクル", value: 21 },
  { name: "高所・小物", value: 143 },
];

/* --------------------- 会社概要 --------------------- */
export const COMPANY_FACTS: Spec[] = [
  { label: "商号", value: "○○レンタル 株式会社" },
  { label: "設立", value: "1993 年 4 月" },
  { label: "資本金", value: "5,000 万円" },
  { label: "従業員数", value: "86 名(2026 年 4 月現在)" },
  { label: "事業内容", value: "建設機械・産業機械のレンタル / ICT 施工支援 / 機械整備" },
  { label: "拠点", value: "山陰 6 営業所・整備工場 2 拠点" },
  { label: "許可・登録", value: "特定建設業許可 / 産業廃棄物収集運搬業許可" },
  { label: "認証", value: "ISO 9001・ISO 14001(本社および全営業所)" },
];

export const HISTORY = [
  { year: "1993", text: "系列会社のリース事業部より独立し、建設機械レンタル事業を開始。" },
  { year: "1998", text: "山陰全域をカバーする 4 営業所体制へ。自社整備工場を開設。" },
  { year: "2007", text: "環境リサイクル機械のレンタルを開始。現場内再資源化の提案を本格化。" },
  { year: "2016", text: "ICT 建機の導入を開始。県内初の 3D マシンコントロール実演会を開催。" },
  { year: "2021", text: "テレマティクスによる稼働監視・予防整備の運用を全社展開。" },
  { year: "2024", text: "レトロフィット キット搭載機の運用を開始。ICT 施工の裾野を拡大。" },
  { year: "2026", text: "オンライン在庫照会・見積シミュレーターを公開(本デモ)。" },
];

export const FAQS = [
  {
    q: "個人でもレンタルできますか?",
    a: "はい、可能です。運転免許証などの本人確認書類をご提示ください。小型車両系建設機械にあたる機種は、資格をお持ちの方に限りお貸出しします。",
  },
  {
    q: "最短でいつから借りられますか?",
    a: "在庫のある機種は最短で当日お渡しが可能です。輸送を伴う場合は前日までのご連絡をお願いしています。オンライン仮予約なら空き状況をその場で確認できます。",
  },
  {
    q: "レンタル中に故障したらどうなりますか?",
    a: "24 時間の緊急窓口へご連絡ください。整備士が現地へ急行し、復旧に時間を要する場合は代替機を手配します。通常使用による故障の修理費はいただきません。",
  },
  {
    q: "ICT 建機を初めて使うのですが大丈夫でしょうか?",
    a: "ご安心ください。初期設定・キャリブレーション・オペレータ講習を現場で実施する「ICT 現場立会サポート」をご用意しています。導入現場の 7 割が初回利用のお客様です。",
  },
  {
    q: "料金はどのように決まりますか?",
    a: "基本料金(日極・月極)+ オプション + 輸送費で構成されます。長期になるほど 1 日あたりの単価は下がります。見積シミュレーターで概算をその場で確認できます。",
  },
  {
    q: "土日祝の引き渡し・引き取りは可能ですか?",
    a: "「夜間・休日引取り対応」オプションで承ります。工程変更が生じやすい現場では、あらかじめお付けいただくケースが多くなっています。",
  },
];

/* --------------------- 稼働中の機械(テレマティクス風) --------------------- */
export const LIVE_UNITS = [
  { id: "U-1042", model: "EX-135i", site: "県道拡幅工事(中部)", hours: 4.8, fuel: 62, status: "稼働中" },
  { id: "U-0871", model: "EX-210i", site: "工業団地造成(西部)", hours: 6.2, fuel: 44, status: "稼働中" },
  { id: "U-1180", model: "BD-160i", site: "河川堤防補強(東部)", hours: 3.1, fuel: 78, status: "稼働中" },
  { id: "U-0665", model: "WL-130", site: "砕石ヤード", hours: 5.4, fuel: 31, status: "要給油" },
  { id: "U-1301", model: "RC-J60", site: "解体現場(松江)", hours: 2.7, fuel: 88, status: "稼働中" },
  { id: "U-0912", model: "EX-80i", site: "上水道布設(米子)", hours: 0, fuel: 95, status: "待機" },
];

/* --------------------- 空き状況(擬似) --------------------- */
/** 機種 × 日付の在庫を決定的に生成(リロードしても同じ結果) */
export function availabilityFor(machineId: string, branchId: string, dayOffset: number): number {
  const base = MACHINES.find((m) => m.id === machineId)?.stock[branchId] ?? 0;
  if (base === 0) return 0;
  let h = 0;
  const key = `${machineId}|${branchId}|${dayOffset}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 9973;
  const busy = h % (base + 2);
  return Math.max(0, base - busy);
}

export const nextAvailableDate = (machineId: string, branchId: string): Date | null => {
  for (let i = 0; i < 30; i++) {
    if (availabilityFor(machineId, branchId, i) > 0) return addDays(new Date(), i);
  }
  return null;
};
