import { format, subDays } from "date-fns";

/* =========================================================
   デモ用ダミーデータ
   ・元サイトの情報構成(レンタル4分類 / ICT建機 / カタログ /
     会社概要 / お知らせ / 採用 / 約款)をそのまま踏襲する
   ・実在の企業名・人物・所在地・電話番号は使用しない
   ========================================================= */

/* ---------------------------------------------------------
   1. レンタル(元サイトの 4 分類)
   --------------------------------------------------------- */
export type RentalCategoryId = "standard" | "industry" | "attachment" | "tool";

export type ArtKind =
  | "excavator-mini"
  | "excavator"
  | "excavator-large"
  | "excavator-long"
  | "loader"
  | "dozer"
  | "carrier"
  | "crusher"
  | "roller"
  | "breaker"
  | "pulverizer"
  | "mower"
  | "grapple"
  | "bucket"
  | "generator"
  | "plate"
  | "light";

export type RentalCategory = {
  id: RentalCategoryId;
  label: string;
  en: string;
  lead: string;
  desc: string;
  art: ArtKind;
};

export const RENTAL_CATEGORIES: RentalCategory[] = [
  {
    id: "standard",
    label: "標準仕様車",
    en: "Standard",
    lead: "土木・建築の現場を支える主力機",
    desc: "油圧ショベル、ホイールローダ、ブルドーザ、運搬機械、転圧機械。0.5t の電動マイクロショベルから 30t クラスまで、現場規模に合わせて選定します。",
    art: "excavator",
  },
  {
    id: "industry",
    label: "業種別仕様車",
    en: "By industry",
    lead: "業種ごとの作業に最適化した仕様",
    desc: "解体・林業・産業廃棄物・除雪・農畜産・環境リサイクル。各業種の作業内容に合わせ、ガードや専用装置を備えた仕様車をご用意しています。",
    art: "crusher",
  },
  {
    id: "attachment",
    label: "アタッチメント",
    en: "Attachment",
    lead: "母機の性能を引き出す装着機器",
    desc: "圧砕具、ブレーカ、油圧フォーク、狭幅バケット、法面バケット、草刈機。母機側の配管仕様を確認したうえで手配します。",
    art: "breaker",
  },
  {
    id: "tool",
    label: "小物商品",
    en: "Tools",
    lead: "現場を動かす発電・転圧・照明",
    desc: "プレート、ランマー、発電機、パワーユニット、溶接機、投光機、高圧洗浄機。急な入用にも最寄りの営業所から迅速にお届けします。",
    art: "generator",
  },
];

export type Spec = { label: string; value: string };

export type Machine = {
  id: string;
  name: string;
  model: string;
  category: RentalCategoryId;
  /** カテゴリ内の中分類(例: 油圧ショベル) */
  group: string;
  /** 一覧に出す代表スペック */
  headline: string;
  summary: string;
  specs: Spec[];
  tags: string[];
  art: ArtKind;
  ict?: boolean;
  electric?: boolean;
  isNew?: boolean;
};

export const MACHINES: Machine[] = [
  /* ============ 標準仕様車 ============ */
  {
    id: "me-005",
    name: "電動マイクロショベル 0.5t",
    model: "MX-05E",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 0.5t / バッテリー電動",
    summary:
      "排出ガスゼロ・低騒音。屋内解体や夜間の住宅地工事など、エンジン機を持ち込めない現場に対応します。",
    specs: [
      { label: "運転質量", value: "0.52 t" },
      { label: "バケット容量", value: "0.014 m³" },
      { label: "全幅", value: "690 mm" },
      { label: "動力", value: "リチウムイオンバッテリー" },
      { label: "連続稼働", value: "約 4 時間(急速充電対応)" },
    ],
    tags: ["電動", "屋内作業", "低騒音"],
    art: "excavator-mini",
    electric: true,
    isNew: true,
  },
  {
    id: "mx-008",
    name: "ミニ油圧ショベル 0.8t",
    model: "MX-08MR",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 0.85t / 可変脚",
    summary: "軽トラックに積載可能。庭まわりや配管の掘削など、狭小地の作業に適した最小クラスです。",
    specs: [
      { label: "運転質量", value: "0.85 t" },
      { label: "バケット容量", value: "0.022 m³" },
      { label: "全幅", value: "700 mm(可変脚)" },
      { label: "最大掘削深さ", value: "1,720 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["狭所", "軽トラ積載", "可変脚"],
    art: "excavator-mini",
  },
  {
    id: "mx-020",
    name: "ミニ油圧ショベル 2t",
    model: "MX-20MR",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 2.1t / 後方超小旋回",
    summary: "外構・造園で最も稼働の多いクラス。ゴムクローラのため舗装面を傷めません。",
    specs: [
      { label: "運転質量", value: "2.1 t" },
      { label: "バケット容量", value: "0.06 m³" },
      { label: "全幅", value: "1,300 mm" },
      { label: "最大掘削深さ", value: "2,540 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["後方超小旋回", "ゴムクローラ", "配管付"],
    art: "excavator-mini",
  },
  {
    id: "mx-030",
    name: "ミニ油圧ショベル 3t",
    model: "MX-30MR",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 3.2t / 2ndライン配管",
    summary: "ブレーカやプレートとの組み合わせ需要が高いクラス。上下水道工事の主力機です。",
    specs: [
      { label: "運転質量", value: "3.2 t" },
      { label: "バケット容量", value: "0.09 m³" },
      { label: "全幅", value: "1,550 mm" },
      { label: "最大掘削深さ", value: "3,080 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["後方超小旋回", "2ndライン配管"],
    art: "excavator-mini",
  },
  {
    id: "ex-050",
    name: "油圧ショベル 5t",
    model: "EX-50",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 5.2t / キャブ仕様",
    summary: "上下水道・側溝施工の標準機。空調付きキャブ仕様で長時間作業の負担を軽減します。",
    specs: [
      { label: "運転質量", value: "5.2 t" },
      { label: "バケット容量", value: "0.16 m³" },
      { label: "全幅", value: "1,960 mm" },
      { label: "最大掘削深さ", value: "3,680 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["キャブ", "オフセット可"],
    art: "excavator",
  },
  {
    id: "ex-080i",
    name: "ICT 油圧ショベル 8t",
    model: "EX-80i",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 8.4t / 3D マシンコントロール",
    summary:
      "設計データどおりにバケットが自動で仕上げます。丁張り作業を減らし、オペレータの熟練度差を吸収します。",
    specs: [
      { label: "運転質量", value: "8.4 t" },
      { label: "バケット容量", value: "0.28 m³" },
      { label: "ICT 機能", value: "3D マシンコントロール" },
      { label: "測位", value: "GNSS 2 周波 / 補正情報対応" },
      { label: "対応データ", value: "LandXML / TIN" },
    ],
    tags: ["ICT", "3D-MC", "丁張り削減"],
    art: "excavator",
    ict: true,
  },
  {
    id: "ex-120",
    name: "油圧ショベル 12t",
    model: "EX-120",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 12.6t / バケット 0.45m³",
    summary: "掘削力と機動性のバランス型。河川改修や造成工事の中核を担うクラスです。",
    specs: [
      { label: "運転質量", value: "12.6 t" },
      { label: "バケット容量", value: "0.45 m³" },
      { label: "全幅", value: "2,490 mm" },
      { label: "最大掘削深さ", value: "5,140 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["2ndライン配管", "クイックカプラ"],
    art: "excavator",
  },
  {
    id: "ex-200i",
    name: "ICT 油圧ショベル 20t",
    model: "EX-200i",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 20.4t / 3D マシンコントロール",
    summary:
      "大規模造成の生産性を底上げする主力 ICT 機。施工履歴をクラウドへ自動記録し、出来形管理にも活用できます。",
    specs: [
      { label: "運転質量", value: "20.4 t" },
      { label: "バケット容量", value: "0.8 m³" },
      { label: "ICT 機能", value: "3D マシンコントロール" },
      { label: "施工履歴", value: "クラウド自動アップロード" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["ICT", "3D-MC", "施工履歴"],
    art: "excavator-large",
    ict: true,
  },
  {
    id: "ex-300",
    name: "大型油圧ショベル 30t",
    model: "EX-300",
    category: "standard",
    group: "油圧ショベル",
    headline: "運転質量 31.5t / バケット 1.4m³",
    summary: "採石場や大規模土工向けのクラス。台数に限りがあるため、早めのご相談をお願いしています。",
    specs: [
      { label: "運転質量", value: "31.5 t" },
      { label: "バケット容量", value: "1.4 m³" },
      { label: "全幅", value: "3,190 mm" },
      { label: "最大掘削深さ", value: "7,380 mm" },
      { label: "輸送", value: "回送手配可" },
    ],
    tags: ["採石", "大規模土工"],
    art: "excavator-large",
  },
  {
    id: "wl-030",
    name: "ホイールローダ 0.3m³",
    model: "WL-30",
    category: "standard",
    group: "ホイールローダ",
    headline: "運転質量 2.8t / バケット 0.3m³",
    summary: "小回りの利く小型ローダ。構内のヤード整備や小規模除雪にも使われています。",
    specs: [
      { label: "運転質量", value: "2.8 t" },
      { label: "バケット容量", value: "0.3 m³" },
      { label: "最大荷重", value: "600 kg" },
      { label: "全幅", value: "1,340 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["小回り", "構内作業"],
    art: "loader",
  },
  {
    id: "wl-130",
    name: "ホイールローダ 1.3m³",
    model: "WL-130",
    category: "standard",
    group: "ホイールローダ",
    headline: "運転質量 8.9t / バケット 1.3m³",
    summary: "骨材積込とヤード整備の定番機。冬季は除雪仕様への換装も承ります。",
    specs: [
      { label: "運転質量", value: "8.9 t" },
      { label: "バケット容量", value: "1.3 m³" },
      { label: "最大荷重", value: "2,400 kg" },
      { label: "全幅", value: "2,150 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["積込", "除雪換装可"],
    art: "loader",
  },
  {
    id: "bd-040",
    name: "ブルドーザ 4t",
    model: "BD-40",
    category: "standard",
    group: "ブルドーザ",
    headline: "運転質量 4.4t / 湿地仕様選択可",
    summary: "小規模造成の敷均し・整地に。接地圧の低い湿地仕様もお選びいただけます。",
    specs: [
      { label: "運転質量", value: "4.4 t" },
      { label: "ブレード容量", value: "0.85 m³" },
      { label: "接地圧", value: "28 kPa" },
      { label: "全幅", value: "2,050 mm" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["敷均し", "湿地仕様選択可"],
    art: "dozer",
  },
  {
    id: "bd-160i",
    name: "ICT ブルドーザ 16t",
    model: "BD-160i",
    category: "standard",
    group: "ブルドーザ",
    headline: "運転質量 16.8t / 自動整地",
    summary:
      "排土板が設計面に自動追従します。粗掘削から仕上げまで一台で完結し、仕上がりが安定します。",
    specs: [
      { label: "運転質量", value: "16.8 t" },
      { label: "ブレード容量", value: "3.1 m³" },
      { label: "ICT 機能", value: "インテリジェント マシンコントロール" },
      { label: "対応データ", value: "LandXML / TIN" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["ICT", "自動整地", "仕上げ精度"],
    art: "dozer",
    ict: true,
  },
  {
    id: "cd-015",
    name: "クローラダンプ 1.5t",
    model: "CD-15",
    category: "standard",
    group: "運搬機械",
    headline: "最大積載 1,500kg / 登坂 25°",
    summary: "不整地・軟弱地の土砂運搬に。急傾斜地での造林作業にも用いられています。",
    specs: [
      { label: "最大積載量", value: "1,500 kg" },
      { label: "荷台容量", value: "0.9 m³" },
      { label: "登坂能力", value: "25°" },
      { label: "全幅", value: "1,180 mm" },
      { label: "ダンプ方式", value: "後方 / 三転(選択可)" },
    ],
    tags: ["不整地", "急傾斜"],
    art: "carrier",
  },
  {
    id: "cd-040",
    name: "クローラキャリア 4t",
    model: "CD-40",
    category: "standard",
    group: "運搬機械",
    headline: "最大積載 4,000kg / 接地圧 24kPa",
    summary: "山間部の資材運搬や砂防工事に。接地圧が低く、軟弱地でも安定して走行します。",
    specs: [
      { label: "最大積載量", value: "4,000 kg" },
      { label: "荷台容量", value: "2.6 m³" },
      { label: "接地圧", value: "24 kPa" },
      { label: "全幅", value: "1,880 mm" },
      { label: "登坂能力", value: "28°" },
    ],
    tags: ["砂防", "山間部"],
    art: "carrier",
  },
  {
    id: "vr-008",
    name: "ハンドガイドローラ 0.8t",
    model: "VR-08",
    category: "standard",
    group: "転圧機械",
    headline: "運転質量 0.82t / 転圧幅 650mm",
    summary: "アスファルト舗装の仕上げ転圧に。散水装置付きで合材の付着を防ぎます。",
    specs: [
      { label: "運転質量", value: "0.82 t" },
      { label: "転圧幅", value: "650 mm" },
      { label: "起振力", value: "16 kN" },
      { label: "散水", value: "60 L タンク" },
      { label: "燃料", value: "ディーゼル" },
    ],
    tags: ["舗装", "散水付"],
    art: "roller",
  },
  {
    id: "cr-035",
    name: "コンバインドローラ 3.5t",
    model: "CR-35",
    category: "standard",
    group: "転圧機械",
    headline: "運転質量 3.5t / 転圧幅 1,300mm",
    summary: "鉄輪とタイヤを併せ持つ複合型。舗装の初期転圧から仕上げまで対応します。",
    specs: [
      { label: "運転質量", value: "3.5 t" },
      { label: "転圧幅", value: "1,300 mm" },
      { label: "起振力", value: "45 kN" },
      { label: "散水", value: "300 L タンク" },
      { label: "排出ガス規制", value: "第 4 次基準適合" },
    ],
    tags: ["舗装", "複合型"],
    art: "roller",
  },

  /* ============ 業種別仕様車 ============ */
  {
    id: "in-dm13",
    name: "解体仕様 油圧ショベル 13t",
    model: "EX-135D",
    category: "industry",
    group: "解体仕様",
    headline: "ガード・飛散防止仕様 / 圧砕機装着可",
    summary:
      "運転席ガードと飛散防止カバーを標準装備。圧砕機やブレーカを装着し、解体工事の主力として使用できます。",
    specs: [
      { label: "運転質量", value: "13.8 t" },
      { label: "装備", value: "FOPS/OPG レベル 2 ガード" },
      { label: "配管", value: "解体用 2ndライン標準" },
      { label: "付帯", value: "散水ノズル・防塵フィルタ" },
      { label: "適合装着機", value: "圧砕機 / ブレーカ" },
    ],
    tags: ["解体", "ガード付", "粉じん対策"],
    art: "excavator",
  },
  {
    id: "in-lr20",
    name: "解体仕様 ロングリーチ 20t",
    model: "EX-200LR",
    category: "industry",
    group: "解体仕様",
    headline: "最大作業高さ 15m / 高所解体",
    summary: "中層建物の高所解体に対応するロングフロント仕様。足場を組まずに上部から解体を進められます。",
    specs: [
      { label: "運転質量", value: "22.4 t" },
      { label: "最大作業高さ", value: "15.0 m" },
      { label: "装備", value: "チルトキャブ・カメラ 3 台" },
      { label: "配管", value: "解体用 2ndライン標準" },
      { label: "輸送", value: "分解輸送に対応" },
    ],
    tags: ["高所解体", "ロングリーチ"],
    art: "excavator-long",
  },
  {
    id: "in-fr07",
    name: "林業仕様 グラップル付ショベル 7t",
    model: "EX-70F",
    category: "industry",
    group: "林業仕様",
    headline: "全周ガード / グラップル標準装着",
    summary:
      "伐採木の集積・積込に。全周をガードで保護し、山林の傾斜地でも安全に作業できる仕様です。",
    specs: [
      { label: "運転質量", value: "7.6 t" },
      { label: "装備", value: "全周ガード・ワイドクローラ" },
      { label: "装着機", value: "グラップル(360° 回転)" },
      { label: "接地圧", value: "31 kPa" },
      { label: "用途", value: "伐採木集積 / 作業道開設" },
    ],
    tags: ["林業", "グラップル", "全周ガード"],
    art: "excavator",
  },
  {
    id: "in-mg12",
    name: "産廃仕様 マグネット付ショベル 12t",
    model: "EX-120M",
    category: "industry",
    group: "産業廃棄物仕様",
    headline: "リフティングマグネット / 選別作業向け",
    summary: "スクラップヤードでの鉄材選別・積込に。発電機とマグネットを一体で搭載しています。",
    specs: [
      { label: "運転質量", value: "13.2 t" },
      { label: "装着機", value: "リフティングマグネット φ900" },
      { label: "電源", value: "車載発電機 15 kW" },
      { label: "装備", value: "耐熱ガード・防塵仕様" },
      { label: "用途", value: "鉄スクラップ選別 / 積込" },
    ],
    tags: ["産廃", "マグネット", "選別"],
    art: "excavator-large",
  },
  {
    id: "in-sn13",
    name: "除雪仕様 ホイールローダ",
    model: "WL-130S",
    category: "industry",
    group: "除雪仕様",
    headline: "スノープラウ 2,700mm / 冬季契約",
    summary:
      "プラウとスノーバケットを装着済み。駐車場・構内・道路の除雪に、12 月〜3 月の季節契約でお貸出しします。",
    specs: [
      { label: "運転質量", value: "9.2 t" },
      { label: "プラウ幅", value: "2,700 mm" },
      { label: "スノーバケット", value: "2.0 m³" },
      { label: "装備", value: "回転灯・熱線ミラー・スタッドレス" },
      { label: "貸出期間", value: "12 月〜3 月(季節契約)" },
    ],
    tags: ["除雪", "季節契約"],
    art: "loader",
  },
  {
    id: "in-rt10",
    name: "小型ロータリ除雪機",
    model: "SR-10",
    category: "industry",
    group: "除雪仕様",
    headline: "除雪幅 1,000mm / 投雪距離 12m",
    summary: "歩道や構内通路など、ローダの入れない狭い場所の除雪に使用します。",
    specs: [
      { label: "機械質量", value: "0.42 t" },
      { label: "除雪幅", value: "1,000 mm" },
      { label: "投雪距離", value: "最大 12 m" },
      { label: "出力", value: "9.5 kW" },
      { label: "駆動", value: "クローラ式" },
    ],
    tags: ["除雪", "歩道", "狭所"],
    art: "plate",
  },
  {
    id: "in-ag03",
    name: "農業・畜産仕様 ホイールローダ",
    model: "WL-30A",
    category: "industry",
    group: "農業・畜産仕様",
    headline: "堆肥バケット / 高排出仕様",
    summary: "堆肥の切返しや飼料の運搬に。排出高さを確保した高ダンプ仕様のバケットを装着しています。",
    specs: [
      { label: "運転質量", value: "3.1 t" },
      { label: "バケット", value: "堆肥用 0.6 m³(高ダンプ)" },
      { label: "最大排出高さ", value: "2,650 mm" },
      { label: "装備", value: "防錆処理・洗浄口" },
      { label: "用途", value: "堆肥切返し / 飼料運搬" },
    ],
    tags: ["畜産", "堆肥", "高ダンプ"],
    art: "loader",
  },
  {
    id: "in-jc60",
    name: "自走式ジョークラッシャ",
    model: "RC-J60",
    category: "industry",
    group: "環境リサイクル",
    headline: "処理能力 60t/h / 現場内再資源化",
    summary:
      "コンクリート殻を現場内で再生砕石に変えます。搬出ダンプの台数と処分費を大きく減らせます。",
    specs: [
      { label: "処理能力", value: "最大 60 t/h" },
      { label: "投入口", value: "760 × 480 mm" },
      { label: "運転質量", value: "21.5 t" },
      { label: "排出粒度", value: "40〜130 mm(可変)" },
      { label: "付帯", value: "磁選機・散水装置" },
    ],
    tags: ["再資源化", "処分費削減", "CO2削減"],
    art: "crusher",
  },
  {
    id: "in-wc35",
    name: "自走式木材破砕機",
    model: "RC-W35",
    category: "industry",
    group: "環境リサイクル",
    headline: "処理能力 35t/h / チップ化",
    summary: "伐採木や剪定枝をチップ化します。バイオマス燃料や堆肥原料としての活用にご利用ください。",
    specs: [
      { label: "処理能力", value: "最大 35 t/h" },
      { label: "投入口", value: "1,100 × 600 mm" },
      { label: "運転質量", value: "15.2 t" },
      { label: "チップサイズ", value: "30〜80 mm" },
      { label: "操作", value: "有線リモコン対応" },
    ],
    tags: ["伐採木", "バイオマス"],
    art: "crusher",
  },
  {
    id: "in-sc45",
    name: "自走式スクリーン(篩機)",
    model: "RC-S45",
    category: "industry",
    group: "環境リサイクル",
    headline: "処理能力 45t/h / 3山同時排出",
    summary: "掘削土の分級や良質土の選別に。クラッシャと組み合わせれば一連の処理が現場内で完結します。",
    specs: [
      { label: "処理能力", value: "最大 45 t/h" },
      { label: "スクリーン", value: "2 デッキ / 網目交換式" },
      { label: "運転質量", value: "12.4 t" },
      { label: "排出", value: "3 山同時排出" },
      { label: "付帯", value: "ホッパ増設可" },
    ],
    tags: ["分級", "良質土選別"],
    art: "crusher",
  },

  /* ============ アタッチメント ============ */
  {
    id: "at-br700",
    name: "油圧ブレーカ",
    model: "AT-BR700",
    category: "attachment",
    group: "圧砕・破砕",
    headline: "適合母機 3〜13t / 本体 550kg",
    summary: "コンクリートや岩盤の破砕に。母機側の配管仕様を事前に確認したうえで手配します。",
    specs: [
      { label: "本体質量", value: "550 kg" },
      { label: "適合母機", value: "3〜13 t" },
      { label: "打撃数", value: "500〜1,000 min⁻¹" },
      { label: "作動油量", value: "60〜100 L/min" },
      { label: "付属", value: "ロッド 2 種 / 防振ブラケット" },
    ],
    tags: ["破砕", "配管確認込み"],
    art: "breaker",
  },
  {
    id: "at-cr300",
    name: "小割圧砕機",
    model: "AT-CR300",
    category: "attachment",
    group: "圧砕・破砕",
    headline: "適合母機 10〜20t / 最大開口 560mm",
    summary: "解体現場の二次破砕と鉄筋切断に。粉じんと騒音を抑えた施工が可能です。",
    specs: [
      { label: "本体質量", value: "980 kg" },
      { label: "適合母機", value: "10〜20 t" },
      { label: "最大開口", value: "560 mm" },
      { label: "破砕力", value: "480 kN" },
      { label: "旋回", value: "360° 油圧回転" },
    ],
    tags: ["解体", "低騒音", "360°回転"],
    art: "pulverizer",
  },
  {
    id: "at-cr600",
    name: "大割圧砕機",
    model: "AT-CR600",
    category: "attachment",
    group: "圧砕・破砕",
    headline: "適合母機 20〜30t / 最大開口 900mm",
    summary: "躯体の一次破砕用。厚い壁やスラブを効率よく解体できる大型クラスです。",
    specs: [
      { label: "本体質量", value: "2,150 kg" },
      { label: "適合母機", value: "20〜30 t" },
      { label: "最大開口", value: "900 mm" },
      { label: "破砕力", value: "1,050 kN" },
      { label: "旋回", value: "360° 油圧回転" },
    ],
    tags: ["一次破砕", "大型"],
    art: "pulverizer",
  },
  {
    id: "at-gr250",
    name: "油圧フォーク(グラップル)",
    model: "AT-GR250",
    category: "attachment",
    group: "掴み・積込",
    headline: "適合母機 5〜13t / 最大開口 1,450mm",
    summary: "伐採木や解体廃材の掴み作業に。開口幅が広く、かさばる資材の積込も効率的です。",
    specs: [
      { label: "本体質量", value: "420 kg" },
      { label: "適合母機", value: "5〜13 t" },
      { label: "最大開口", value: "1,450 mm" },
      { label: "爪本数", value: "4 本 / 2 本(選択)" },
      { label: "旋回", value: "360° 油圧回転" },
    ],
    tags: ["伐採木", "廃材積込"],
    art: "grapple",
  },
  {
    id: "at-nb400",
    name: "狭幅バケット",
    model: "AT-NB400",
    category: "attachment",
    group: "バケット",
    headline: "幅 400mm / 管路掘削向け",
    summary: "配管や電線管の布設に用いる細幅バケット。掘削断面を最小限に抑え、埋戻し量を減らせます。",
    specs: [
      { label: "バケット幅", value: "400 mm" },
      { label: "容量", value: "0.06 m³" },
      { label: "適合母機", value: "3〜8 t" },
      { label: "爪", value: "4 本(交換式)" },
      { label: "他サイズ", value: "300 / 450 / 600 mm" },
    ],
    tags: ["管路", "狭幅", "埋戻し削減"],
    art: "bucket",
  },
  {
    id: "at-sb180",
    name: "法面バケット",
    model: "AT-SB180",
    category: "attachment",
    group: "バケット",
    headline: "幅 1,800mm / チルト機構付",
    summary: "法面の整形や河川護岸の仕上げに。油圧チルトで角度を調整しながら平滑に仕上げられます。",
    specs: [
      { label: "バケット幅", value: "1,800 mm" },
      { label: "チルト角", value: "左右 45°" },
      { label: "適合母機", value: "7〜13 t" },
      { label: "本体質量", value: "460 kg" },
      { label: "用途", value: "法面整形 / 河川護岸" },
    ],
    tags: ["法面整形", "チルト"],
    art: "bucket",
  },
  {
    id: "at-mw150",
    name: "草刈アタッチメント",
    model: "AT-MW150",
    category: "attachment",
    group: "維持管理",
    headline: "刈幅 1,500mm / 適合母機 3〜8t",
    summary: "法面や河川敷の草刈に。人力作業を機械化し、暑熱下での作業負担を軽減します。",
    specs: [
      { label: "本体質量", value: "310 kg" },
      { label: "適合母機", value: "3〜8 t" },
      { label: "刈幅", value: "1,500 mm" },
      { label: "刈刃", value: "フリーナイフ式" },
      { label: "作動油量", value: "45〜70 L/min" },
    ],
    tags: ["法面", "河川敷", "省人化"],
    art: "mower",
  },

  /* ============ 小物商品 ============ */
  {
    id: "tl-pl60",
    name: "振動プレート 60kg",
    model: "SP-60",
    category: "tool",
    group: "転圧",
    headline: "機械質量 60kg / 起振力 10.5kN",
    summary: "路盤や埋戻しの転圧に。軽量で取り回しがよく、一人でも扱えるサイズです。",
    specs: [
      { label: "機械質量", value: "60 kg" },
      { label: "起振力", value: "10.5 kN" },
      { label: "プレート寸法", value: "500 × 350 mm" },
      { label: "燃料", value: "ガソリン" },
      { label: "付属", value: "散水タンク" },
    ],
    tags: ["転圧", "軽量"],
    art: "plate",
  },
  {
    id: "tl-rm80",
    name: "ランマー 80kg",
    model: "SR-80",
    category: "tool",
    group: "転圧",
    headline: "機械質量 80kg / 打撃力 14kN",
    summary: "管路の埋戻しなど、狭い箇所の締固めに。プレートが入らない場所で活躍します。",
    specs: [
      { label: "機械質量", value: "80 kg" },
      { label: "打撃力", value: "14 kN" },
      { label: "接地寸法", value: "330 × 280 mm" },
      { label: "燃料", value: "ガソリン" },
      { label: "用途", value: "管路埋戻し / 狭所転圧" },
    ],
    tags: ["転圧", "狭所"],
    art: "plate",
  },
  {
    id: "tl-gn25",
    name: "発電機 25kVA",
    model: "SG-25",
    category: "tool",
    group: "発電・電源",
    headline: "定格 25kVA / 防音型",
    summary: "現場事務所や照明、小型溶接機の電源に。防音型のため住宅地の現場でも使用できます。",
    specs: [
      { label: "定格出力", value: "25 kVA" },
      { label: "出力電圧", value: "三相 200V / 単相 100V" },
      { label: "騒音値", value: "65 dB(7 m)" },
      { label: "燃料タンク", value: "60 L(連続 10 時間)" },
      { label: "牽引", value: "トレーラ仕様あり" },
    ],
    tags: ["防音型", "三相200V"],
    art: "generator",
  },
  {
    id: "tl-gn45",
    name: "発電機 45kVA",
    model: "SG-45",
    category: "tool",
    group: "発電・電源",
    headline: "定格 45kVA / 防音型",
    summary: "大型照明や複数のエアツールを同時に使う現場向け。仮設電源としてもご利用いただけます。",
    specs: [
      { label: "定格出力", value: "45 kVA" },
      { label: "出力電圧", value: "三相 200V / 単相 100V" },
      { label: "騒音値", value: "68 dB(7 m)" },
      { label: "燃料タンク", value: "130 L" },
      { label: "牽引", value: "トレーラ仕様あり" },
    ],
    tags: ["防音型", "仮設電源"],
    art: "generator",
  },
  {
    id: "tl-cp37",
    name: "エンジンコンプレッサ 3.7m³",
    model: "SC-37",
    category: "tool",
    group: "発電・電源",
    headline: "吐出 3.7m³/min / 防音キャノピー",
    summary: "削岩機やエアツールの動力源に。防音キャノピーを標準装備しています。",
    specs: [
      { label: "吐出空気量", value: "3.7 m³/min" },
      { label: "使用圧力", value: "0.69 MPa" },
      { label: "騒音値", value: "68 dB(7 m)" },
      { label: "燃料タンク", value: "55 L" },
      { label: "付属", value: "エアホース 20 m × 2" },
    ],
    tags: ["エアツール", "防音型"],
    art: "generator",
  },
  {
    id: "tl-pu30",
    name: "パワーユニット 30kW",
    model: "PU-30",
    category: "tool",
    group: "発電・電源",
    headline: "吐出量 60L/min / 油圧工具用",
    summary: "油圧カッターやブレーカなど、手持ち油圧工具の動力源としてご利用いただけます。",
    specs: [
      { label: "出力", value: "30 kW" },
      { label: "吐出量", value: "60 L/min" },
      { label: "使用圧力", value: "17.5 MPa" },
      { label: "燃料", value: "ディーゼル" },
      { label: "付属", value: "油圧ホース 10 m × 2" },
    ],
    tags: ["油圧工具", "動力源"],
    art: "generator",
  },
  {
    id: "tl-wd190",
    name: "エンジン溶接機 190A",
    model: "SW-190",
    category: "tool",
    group: "溶接・洗浄",
    headline: "定格 190A / 発電機兼用",
    summary: "電源のない現場での溶接に。単相 100V の発電機としても使用できます。",
    specs: [
      { label: "定格電流", value: "190 A" },
      { label: "発電出力", value: "単相 100V / 3.0 kVA" },
      { label: "燃料", value: "ガソリン" },
      { label: "騒音値", value: "70 dB(7 m)" },
      { label: "付属", value: "溶接ケーブル 20 m" },
    ],
    tags: ["溶接", "発電兼用"],
    art: "generator",
  },
  {
    id: "tl-hw150",
    name: "高圧洗浄機 150kgf",
    model: "HW-150",
    category: "tool",
    group: "溶接・洗浄",
    headline: "吐出圧 150kgf/cm² / エンジン式",
    summary: "重機や現場設備の洗浄、構造物の下地処理に。温水仕様もご用意しています。",
    specs: [
      { label: "吐出圧力", value: "150 kgf/cm²" },
      { label: "吐出水量", value: "18 L/min" },
      { label: "駆動", value: "ガソリンエンジン" },
      { label: "付属", value: "高圧ホース 20 m・ガン" },
      { label: "仕様", value: "温水仕様あり" },
    ],
    tags: ["洗浄", "下地処理"],
    art: "generator",
  },
  {
    id: "tl-lt400",
    name: "バルーン投光機 LED400W",
    model: "SL-BL2",
    category: "tool",
    group: "照明",
    headline: "LED 400W / 照射半径 25m",
    summary: "夜間工事のグレアを抑える全方向照明。近隣への光害配慮が必要な現場に適しています。",
    specs: [
      { label: "光源", value: "LED 400 W" },
      { label: "照射範囲", value: "半径 約 25 m" },
      { label: "設置高さ", value: "最大 4.0 m" },
      { label: "電源", value: "単相 100V" },
      { label: "収納", value: "専用ケース付" },
    ],
    tags: ["夜間工事", "光害配慮"],
    art: "light",
  },
  {
    id: "tl-lt2000",
    name: "投光機 メタルハライド 2kW",
    model: "SL-MH2",
    category: "tool",
    group: "照明",
    headline: "2kW × 2灯 / 昇降ポール 4m",
    summary: "広範囲を明るく照らす標準的な投光機。トンネルや大規模現場の夜間作業に使用します。",
    specs: [
      { label: "光源", value: "メタルハライド 2 kW × 2 灯" },
      { label: "ポール高さ", value: "最大 4.0 m" },
      { label: "電源", value: "単相 200V" },
      { label: "台車", value: "キャスター付" },
      { label: "用途", value: "夜間工事 / トンネル" },
    ],
    tags: ["夜間工事", "広範囲"],
    art: "light",
  },
];

/* ---------------------------------------------------------
   2. ICT 建機
   --------------------------------------------------------- */
export const ICT_FEATURES = [
  {
    id: "mc",
    title: "マシンコントロール",
    en: "Machine Control",
    body: "3D 設計データに沿って、バケットや排土板を機械が自動で制御します。設計面を超えて掘りすぎることがなく、仕上がりが安定します。",
  },
  {
    id: "mg",
    title: "マシンガイダンス",
    en: "Machine Guidance",
    body: "現在の刃先位置と設計面との差を運転席のモニタに表示します。操作は人が行うため、既存の作業手順を大きく変えずに導入できます。",
  },
  {
    id: "retro",
    title: "レトロフィット",
    en: "Retrofit",
    body: "お手持ちの油圧ショベルに後付けキットを装着し、ICT 施工を始められます。新車を導入する前に、まず一台から試したいお客様に適しています。",
  },
  {
    id: "survey",
    title: "3 次元測量支援",
    en: "3D Survey",
    body: "スマートフォンや小型 UAV を用いた 3 次元測量に対応します。設計データをお持ちでない場合の作成支援も承ります。",
  },
];

export const ICT_EFFECT = [
  { name: "丁張り工数", conventional: 100, ict: 18 },
  { name: "施工日数", conventional: 100, ict: 64 },
  { name: "手戻り", conventional: 100, ict: 27 },
  { name: "出来形書類作成", conventional: 100, ict: 41 },
];

export const ICT_FLOW = [
  {
    step: "01",
    title: "現場のご相談",
    body: "工種・工期・設計データの有無を伺い、適した機種と進め方をご提案します。",
  },
  {
    step: "02",
    title: "設計データの準備",
    body: "LandXML などの 3D データを機械に投入できる形式に整えます。データ作成からの支援も可能です。",
  },
  {
    step: "03",
    title: "納品・現地調整",
    body: "納品時に基準点合わせと精度確認を現地で実施し、その場で使える状態にしてお渡しします。",
  },
  {
    step: "04",
    title: "オペレータ講習",
    body: "実機を用いた講習を現場で行います。初めての方でもその日から施工に入れます。",
  },
  {
    step: "05",
    title: "施工中のフォロー",
    body: "施工中の疑問や不具合にも担当が対応します。必要に応じて再度現場に伺います。",
  },
];

/* ---------------------------------------------------------
   3. オンラインカタログ
   --------------------------------------------------------- */
export type CatalogItem = {
  id: string;
  title: string;
  category: string;
  pages: number;
  updated: string;
  size: string;
  desc: string;
  art: ArtKind;
};

const dm = (n: number) => format(subDays(new Date(), n), "yyyy-MM-dd");

export const CATALOGS: CatalogItem[] = [
  {
    id: "cat-standard",
    title: "標準仕様車 総合カタログ",
    category: "レンタル",
    pages: 32,
    updated: dm(21),
    size: "8.4 MB",
    desc: "油圧ショベル・ホイールローダ・ブルドーザ・運搬機械・転圧機械の主要諸元と外形寸法をまとめています。",
    art: "excavator",
  },
  {
    id: "cat-industry",
    title: "業種別仕様車カタログ",
    category: "レンタル",
    pages: 20,
    updated: dm(35),
    size: "6.1 MB",
    desc: "解体・林業・産業廃棄物・除雪・農畜産・環境リサイクルの各仕様車を業種別に掲載しています。",
    art: "crusher",
  },
  {
    id: "cat-attachment",
    title: "アタッチメント一覧",
    category: "レンタル",
    pages: 16,
    updated: dm(48),
    size: "4.7 MB",
    desc: "圧砕具・ブレーカ・油圧フォーク・各種バケットの適合母機と必要作動油量の一覧です。",
    art: "breaker",
  },
  {
    id: "cat-tool",
    title: "小物商品カタログ",
    category: "レンタル",
    pages: 24,
    updated: dm(52),
    size: "5.3 MB",
    desc: "発電機・コンプレッサ・転圧機・溶接機・投光機など、小物商品の全ラインナップです。",
    art: "generator",
  },
  {
    id: "cat-ict",
    title: "ICT 建機のご案内",
    category: "ICT 建機",
    pages: 12,
    updated: dm(9),
    size: "3.8 MB",
    desc: "マシンコントロール・マシンガイダンス・レトロフィットの違いと、導入までの流れを解説しています。",
    art: "dozer",
  },
  {
    id: "cat-safety",
    title: "安全作業の手引き",
    category: "その他",
    pages: 8,
    updated: dm(66),
    size: "2.2 MB",
    desc: "始業前点検の手順、資格の要否、現場での注意事項をまとめた小冊子です。",
    art: "loader",
  },
];

/* ---------------------------------------------------------
   4. お知らせ
   --------------------------------------------------------- */
export type NewsCategory = "お知らせ" | "新商品" | "ICT建機" | "イベント" | "採用";

export type NewsItem = {
  id: string;
  date: string;
  category: NewsCategory;
  title: string;
  lead: string;
  body: string[];
};

export const NEWS: NewsItem[] = [
  {
    id: "n-2026-08-01",
    date: dm(4),
    category: "新商品",
    title: "電動マイクロショベルのレンタルを開始しました",
    lead: "排出ガスゼロ・低騒音の 0.5t クラス電動ショベルを全営業所に配備しました。",
    body: [
      "このたび、バッテリー駆動の電動マイクロショベル(0.5t クラス)のレンタルを開始しました。エンジン機を持ち込めない屋内解体や、早朝・夜間の住宅地工事でご活用いただけます。",
      "排出ガスが出ないため換気設備の負担が小さく、稼働音も大幅に低減されています。急速充電に対応しており、休憩時間を利用した充電で一日の作業を通していただけます。",
      "実機は各営業所に配備しています。ご覧になりたい場合は、最寄りの営業所までお気軽にお問い合わせください。",
    ],
  },
  {
    id: "n-2026-07-02",
    date: dm(12),
    category: "イベント",
    title: "ICT 建機の現場見学・体験会を開催します",
    lead: "実際の施工現場で、マシンコントロール搭載機を操作いただける体験会です。",
    body: [
      "ICT 建機を導入したいものの、実際の使用感が分からないというお声を多くいただいております。そこで、稼働中の現場をお借りして、見学と操作体験の場をご用意しました。",
      "当日は 3D マシンコントロール搭載の油圧ショベルとブルドーザの 2 機種をご用意し、丁張りを設置しない状態での法面整形をご覧いただきます。スマートフォンを用いた 3 次元測量のデモンストレーションも行います。",
      "参加は無料です。ご希望の方は、お問い合わせフォームまたは最寄りの営業所へご連絡ください。",
    ],
  },
  {
    id: "n-2026-06-01",
    date: dm(26),
    category: "ICT建機",
    title: "レトロフィットキット装着機の運用を開始しました",
    lead: "既存の油圧ショベルに後付けで 3D マシンガイダンスを追加できます。",
    body: [
      "お手持ちの油圧ショベルに後付けするレトロフィットキットの運用を開始しました。新たに ICT 建機を導入することなく、既存の機械で ICT 施工を始められます。",
      "取付と撤去は当社が行い、キットのみの月単位レンタルにも対応します。まず一台から試したいというお客様に多くご利用いただいております。",
      "対応可能な母機の型式には条件があります。お手持ちの機械でご利用いただけるかは、担当までお問い合わせください。",
    ],
  },
  {
    id: "n-2026-05-01",
    date: dm(44),
    category: "お知らせ",
    title: "オンラインカタログを刷新しました",
    lead: "標準仕様車・業種別仕様車・アタッチメント・小物商品の各カタログを更新しました。",
    body: [
      "ウェブサイトのオンラインカタログを刷新し、掲載機種と諸元を最新の内容に更新しました。外形寸法図と適合母機の一覧を拡充しています。",
      "各カタログはウェブ上でご覧いただけるほか、PDF としてダウンロードいただけます。現場での打ち合わせにもご活用ください。",
    ],
  },
  {
    id: "n-2026-04-01",
    date: dm(58),
    category: "採用",
    title: "整備スタッフ・営業スタッフを募集しています",
    lead: "完全週休二日制、資格取得支援制度あり。未経験からの育成にも力を入れています。",
    body: [
      "事業拡大にともない、整備スタッフおよび営業スタッフを募集しています。整備士資格の取得支援制度があり、未経験の方も先輩社員のもとで一から技術を身につけていただけます。",
      "2025 年 4 月より完全週休二日制へ移行しました。転勤はなく、山陰の現場が仕事場です。地元で長く働きたい方をお待ちしています。",
      "詳しい募集要項は採用情報のページをご覧ください。",
    ],
  },
  {
    id: "n-2026-03-01",
    date: dm(72),
    category: "お知らせ",
    title: "完全週休二日制への移行について",
    lead: "2025 年 4 月 1 日より、土曜・日曜・祝日を休業日とさせていただいております。",
    body: [
      "かねてよりご案内しておりました通り、2025 年 4 月 1 日より完全週休二日制へ移行し、土曜・日曜・祝日を休業日とさせていただいております。",
      "休業日の機械の引き渡し・引き取りにつきましては、事前にご相談いただければ可能な限り対応いたします。また、レンタル中の機械の故障・トラブルにつきましては、休業日も緊急連絡窓口にて 24 時間受け付けております。",
      "お客様にはご不便をおかけいたしますが、社員が健康に長く働ける環境づくりのための取り組みですので、何卒ご理解を賜りますようお願い申し上げます。",
    ],
  },
  {
    id: "n-2026-02-01",
    date: dm(96),
    category: "ICT建機",
    title: "ICT 建機の保有台数が 38 台になりました",
    lead: "山陰地域の ICT 施工需要にお応えするため、計画的に増車を進めています。",
    body: [
      "公共工事における ICT 施工の適用拡大にともない、当社の ICT 建機の保有台数が 38 台となりました。油圧ショベル、ブルドーザともに複数クラスをご用意しています。",
      "繁忙期には台数が逼迫することがございます。工期が決まりましたら、お早めにご相談いただけますと確実にご用意できます。",
    ],
  },
  {
    id: "n-2026-01-01",
    date: dm(118),
    category: "お知らせ",
    title: "年始のご挨拶",
    lead: "本年も変わらぬご愛顧を賜りますようお願い申し上げます。",
    body: [
      "旧年中は格別のご高配を賜り、厚く御礼申し上げます。",
      "私どもは創業以来、「お客様、地域の皆様、そして社員の幸せを一番に」を掲げ、山陰の現場とともに歩んでまいりました。機械をお貸しして終わりではなく、その機械が現場で確かに働くところまでを私どもの仕事と考えております。",
      "本年も、地域の皆様の事業の一助となれるよう努めてまいります。何卒よろしくお願い申し上げます。",
    ],
  },
];

/* ---------------------------------------------------------
   5. 営業拠点(山陰両県 8 拠点)
   --------------------------------------------------------- */
export type Branch = {
  id: string;
  name: string;
  pref: "鳥取県" | "島根県";
  area: string;
  address: string;
  tel: string;
  fax: string;
  hours: string;
  isHq?: boolean;
  hasWorkshop?: boolean;
  /** 拠点図の相対座標(%) */
  x: number;
  y: number;
};

export const BRANCHES: Branch[] = [
  {
    id: "yonago",
    name: "本社・米子営業所",
    pref: "鳥取県",
    area: "鳥取県西部",
    address: "鳥取県米子市○○町 0-0",
    tel: "0859-00-0000",
    fax: "0859-00-0001",
    hours: "8:00 - 17:30",
    isHq: true,
    hasWorkshop: true,
    x: 47,
    y: 40,
  },
  {
    id: "tottori",
    name: "鳥取営業所",
    pref: "鳥取県",
    area: "鳥取県東部",
    address: "鳥取県鳥取市○○ 0-0",
    tel: "0857-00-0000",
    fax: "0857-00-0001",
    hours: "8:00 - 17:30",
    x: 84,
    y: 26,
  },
  {
    id: "kurayoshi",
    name: "倉吉営業所",
    pref: "鳥取県",
    area: "鳥取県中部",
    address: "鳥取県倉吉市○○町 0-0",
    tel: "0858-00-0000",
    fax: "0858-00-0001",
    hours: "8:00 - 17:30",
    x: 66,
    y: 32,
  },
  {
    id: "matsue",
    name: "松江営業所",
    pref: "島根県",
    area: "島根県東部",
    address: "島根県松江市○○町 0-0",
    tel: "0852-00-0000",
    fax: "0852-00-0001",
    hours: "8:00 - 17:30",
    hasWorkshop: true,
    x: 35,
    y: 43,
  },
  {
    id: "izumo",
    name: "出雲営業所",
    pref: "島根県",
    area: "島根県中部",
    address: "島根県出雲市○○町 0-0",
    tel: "0853-00-0000",
    fax: "0853-00-0001",
    hours: "8:00 - 17:30",
    x: 24,
    y: 45,
  },
  {
    id: "unnan",
    name: "雲南営業所",
    pref: "島根県",
    area: "島根県南東部",
    address: "島根県雲南市○○町 0-0",
    tel: "0854-00-0000",
    fax: "0854-00-0001",
    hours: "8:00 - 17:30",
    x: 33,
    y: 55,
  },
  {
    id: "hamada",
    name: "浜田営業所",
    pref: "島根県",
    area: "島根県西部",
    address: "島根県浜田市○○町 0-0",
    tel: "0855-00-0000",
    fax: "0855-00-0001",
    hours: "8:00 - 17:30",
    x: 12,
    y: 52,
  },
  {
    id: "masuda",
    name: "益田営業所",
    pref: "島根県",
    area: "島根県西部",
    address: "島根県益田市○○町 0-0",
    tel: "0856-00-0000",
    fax: "0856-00-0001",
    hours: "8:00 - 17:30",
    x: 4,
    y: 60,
  },
];

/* ---------------------------------------------------------
   6. 会社概要
   --------------------------------------------------------- */
export const COMPANY_FACTS: Spec[] = [
  { label: "商号", value: "○○レンタル株式会社" },
  { label: "設立", value: "1993 年 4 月" },
  { label: "資本金", value: "5,000 万円" },
  { label: "代表者", value: "代表取締役社長 ○○ ○○" },
  { label: "従業員数", value: "86 名(2026 年 4 月現在)" },
  {
    label: "事業内容",
    value: "建設機械・産業機械のレンタル / ICT 施工支援 / 機械の整備・修理",
  },
  { label: "拠点", value: "山陰両県 8 営業所(うち整備工場 2 拠点)" },
  { label: "保有機械", value: "482 台(2026 年 4 月現在)" },
  {
    label: "許可・登録",
    value: "特定建設業許可 / 産業廃棄物収集運搬業許可 / 計量証明事業登録",
  },
  { label: "認証", value: "ISO 9001・ISO 14001(本社および全営業所)" },
  { label: "取引銀行", value: "地方銀行 3 行・信用金庫 1 庫" },
];

export const PHILOSOPHY = {
  slogan: "お客様、地域の皆様、そして社員の幸せを一番に。",
  body: [
    "私たちは 1993 年、系列会社のリース事業部から独立して事業を始めました。建設機械を貸し出す会社としてではなく、山陰という地域の仕事が滞りなく進むための会社でありたい。その考えは、創業から変わっていません。",
    "機械をお届けした時点で、私たちの仕事は終わりません。その機械が現場で確かに働き、工期どおりに工事が終わる。そこまでを見届けてはじめて、お客様の「満足」に届いたと考えています。",
  ],
  pillars: [
    {
      title: "お客様の満足",
      body: "機械の手配だけでなく、機種選定の相談、現場での設定、トラブル時の即応まで。現場が止まらないことを最優先に考えます。",
    },
    {
      title: "地域への貢献",
      body: "山陰両県 8 拠点。災害時の復旧支援や地域の維持管理工事にも、地元企業として責任を持って対応します。",
    },
    {
      title: "社員の幸せ",
      body: "完全週休二日制、資格取得支援、転勤なし。社員が健康に長く働けることが、結果としてお客様への品質につながると考えています。",
    },
  ],
};

export const HISTORY = [
  {
    year: "1993",
    text: "系列会社のリース事業部より独立し、建設機械レンタル事業を開始。米子に本社を置く。",
  },
  { year: "1996", text: "松江営業所を開設。島根県東部での営業を本格化。" },
  { year: "1998", text: "本社に自社整備工場を開設。返却機の全数点検体制を確立。" },
  { year: "2003", text: "鳥取・倉吉・出雲の各営業所を開設し、山陰両県 6 拠点体制へ。" },
  { year: "2007", text: "環境リサイクル機械のレンタルを開始。現場内再資源化の提案を本格化。" },
  { year: "2011", text: "ISO 9001・ISO 14001 認証を全事業所で取得。" },
  { year: "2014", text: "雲南・浜田・益田の各営業所を開設し、現在の 8 拠点体制となる。" },
  { year: "2016", text: "ICT 建機の導入を開始。県内で初となる 3D マシンコントロール実演会を開催。" },
  { year: "2021", text: "テレマティクスによる稼働監視と予防整備の運用を全社展開。" },
  { year: "2024", text: "レトロフィットキット搭載機の運用を開始し、ICT 施工の裾野を拡大。" },
  { year: "2025", text: "完全週休二日制へ移行。" },
  { year: "2026", text: "コーポレートサイトを刷新(本デモ)。" },
];

export const COMPANY_NUMBERS = [
  { value: 33, unit: "年", label: "山陰での事業年数", note: "1993 年創業" },
  { value: 8, unit: "拠点", label: "営業所数", note: "鳥取県 3・島根県 5" },
  { value: 482, unit: "台", label: "保有機械台数", note: "うち ICT 建機 38 台" },
  { value: 1240, unit: "社", label: "お取引先", note: "山陰両県を中心に" },
];

/* ---------------------------------------------------------
   7. 採用情報
   --------------------------------------------------------- */
export const JOBS = [
  {
    id: "job-service",
    title: "整備スタッフ",
    type: "正社員 / 未経験可",
    place: "本社(米子)・松江営業所",
    body: "返却された機械の点検・整備・修理を担当します。油圧ショベルを中心に、故障診断から部品交換まで幅広く扱います。",
    duties: [
      "返却機の全数点検と整備記録の作成",
      "故障診断・部品交換・油圧機器の修理",
      "現場での緊急対応(先輩社員と同行)",
      "ICT 建機のキャリブレーション補助",
    ],
    welcome: ["自動車整備士資格をお持ちの方", "機械いじりが好きな方", "普通自動車免許(必須)"],
  },
  {
    id: "job-sales",
    title: "営業スタッフ",
    type: "正社員 / 未経験可",
    place: "各営業所",
    body: "建設会社様を訪問し、工事内容に応じた機種のご提案と手配を行います。飛び込み営業はなく、既存のお客様との関係づくりが中心です。",
    duties: [
      "担当エリアのお客様訪問とご提案",
      "機種選定の相談対応・見積作成",
      "配車手配と納品日程の調整",
      "ICT 施工の導入提案",
    ],
    welcome: ["建設業界の経験をお持ちの方", "人と話すことが好きな方", "普通自動車免許(必須)"],
  },
  {
    id: "job-driver",
    title: "回送ドライバー",
    type: "正社員 / 経験者優遇",
    place: "本社(米子)",
    body: "重機回送車での機械の運搬と、現場での積込・積下ろしを担当します。山陰全域が担当エリアです。",
    duties: [
      "重機回送車による機械の運搬",
      "現場での積込・積下ろしと立会",
      "運搬前の外観点検",
      "車両の日常点検",
    ],
    welcome: [
      "大型自動車免許をお持ちの方",
      "けん引免許・移動式クレーン資格をお持ちの方",
      "取得費用は会社が全額補助します",
    ],
  },
];

export const BENEFITS = [
  { title: "完全週休二日制", body: "土曜・日曜・祝日休み。2025 年 4 月より移行しました。" },
  { title: "資格取得支援", body: "整備士・車両系建設機械・大型免許などの受験費用を全額補助します。" },
  { title: "転勤なし", body: "山陰の現場が仕事場です。地元で腰を据えて働けます。" },
  { title: "平均勤続 14 年", body: "長く働ける環境づくりを続けています。" },
  { title: "各種社会保険完備", body: "健康保険・厚生年金・雇用保険・労災保険。" },
  { title: "退職金制度", body: "中小企業退職金共済に加入しています。" },
];

/* ---------------------------------------------------------
   8. よくあるご質問
   --------------------------------------------------------- */
export const FAQS = [
  {
    q: "個人でもレンタルできますか。",
    a: "はい、可能です。運転免許証などの本人確認書類をご提示ください。なお、小型車両系建設機械にあたる機種は、必要な資格をお持ちの方に限りお貸出ししております。",
  },
  {
    q: "最短でいつから借りられますか。",
    a: "在庫のある機種は最短で当日のお渡しが可能です。現場への輸送をご希望の場合は、前日までにご連絡いただけますと確実に手配できます。",
  },
  {
    q: "レンタル料金を教えてください。",
    a: "機種・期間・輸送距離により異なるため、お見積りにてご案内しております。お問い合わせフォームまたは最寄りの営業所へ、機種と使用期間をお知らせください。当日中を目安にご回答します。",
  },
  {
    q: "レンタル中に故障したらどうなりますか。",
    a: "24 時間の緊急連絡窓口へご連絡ください。整備士が現地へ向かい、復旧に時間を要する場合は代替機を手配します。通常のご使用による故障については、修理費をご負担いただくことはありません。",
  },
  {
    q: "ICT 建機を初めて使うのですが、大丈夫でしょうか。",
    a: "ご安心ください。初期設定・キャリブレーション・オペレータ講習を現場で行う立会サポートをご用意しています。ご導入いただいた現場の約 7 割が、初めて ICT 施工に取り組まれるお客様です。",
  },
  {
    q: "土日祝の引き渡し・引き取りは可能ですか。",
    a: "2025 年 4 月より土曜・日曜・祝日を休業日としておりますが、事前にご相談いただければ可能な限り対応いたします。工程変更が生じやすい現場では、あらかじめご相談いただくことをおすすめします。",
  },
  {
    q: "アタッチメントだけを借りることはできますか。",
    a: "可能です。ただし母機側の配管仕様により装着できない場合がありますので、母機の型式をお知らせください。配管の追加工事が必要な場合も、あわせてご相談いただけます。",
  },
  {
    q: "長期で借りる場合の契約はどうなりますか。",
    a: "月単位の契約となり、期間に応じた料金でご案内します。1 年を超える長期のご利用については、リース契約も含めてご提案いたしますので担当までご相談ください。",
  },
];

/* ---------------------------------------------------------
   9. レンタル基本約款(抜粋)
   --------------------------------------------------------- */
export const TERMS = [
  {
    article: "第 1 条",
    title: "適用範囲",
    body: "本約款は、当社がお客様に建設機械等をレンタルする場合の基本的な事項を定めるものです。本約款に定めのない事項については、個別のレンタル契約書および関係法令の定めるところによります。",
  },
  {
    article: "第 2 条",
    title: "契約の成立",
    body: "レンタル契約は、お客様からのお申込みに対して当社が承諾したときに成立します。当社は、機械の在庫状況その他やむを得ない事由により、お申込みをお受けできない場合があります。",
  },
  {
    article: "第 3 条",
    title: "レンタル期間",
    body: "レンタル期間は、機械を当社が引き渡した日から、お客様が当社に返還した日までとします。期間の延長を希望される場合は、あらかじめ当社にご連絡ください。",
  },
  {
    article: "第 4 条",
    title: "使用上の注意",
    body: "お客様は、機械を善良な管理者の注意をもって、その本来の用途および使用方法に従って使用するものとします。法令で定められた資格を要する機械については、有資格者が操作してください。",
  },
  {
    article: "第 5 条",
    title: "点検および整備",
    body: "お客様は、レンタル期間中、関係法令に基づく始業前点検を実施してください。異常を認めた場合は直ちに使用を中止し、当社へご連絡ください。",
  },
  {
    article: "第 6 条",
    title: "故障および修理",
    body: "通常の使用による故障の修理費用は当社が負担します。ただし、お客様の故意または過失、用途外の使用、無資格者による操作に起因する故障については、この限りではありません。",
  },
  {
    article: "第 7 条",
    title: "返還",
    body: "お客様は、レンタル期間の満了時に、機械を引渡し時と同等の状態で当社に返還するものとします。付属品および取扱説明書も併せてご返還ください。",
  },
  {
    article: "第 8 条",
    title: "禁止事項",
    body: "お客様は、当社の書面による承諾なく、機械の転貸、譲渡、担保提供、改造、および所在地の変更を行うことはできません。",
  },
];

/* ---------------------------------------------------------
   10. 「満足」で終わらせないための取り組み(強み)
   --------------------------------------------------------- */
export const STRENGTHS = [
  {
    no: "01",
    title: "最寄りの拠点から、最短当日",
    body: "山陰両県 8 拠点。急な増車や機械のトラブルにも、最寄りの営業所から即日で代替機を手配します。地域を絞っているからこそ実現できる距離です。",
    metric: "8",
    metricUnit: "営業所",
  },
  {
    no: "02",
    title: "自社整備工場で品質を担保",
    body: "返却のたびに整備士が全数点検を行います。稼働データに基づく予防整備により、現場での突発的な故障を未然に防ぎます。",
    metric: "99.2",
    metricUnit: "% 稼働率",
  },
  {
    no: "03",
    title: "ICT 建機を「使えるまで」支援",
    body: "お貸しして終わりにはしません。設計データの準備、現地でのキャリブレーション、オペレータ講習まで、担当者が現場に入って伴走します。",
    metric: "38",
    metricUnit: "台の ICT 建機",
  },
  {
    no: "04",
    title: "24 時間の緊急対応窓口",
    body: "レンタル中の故障・トラブルは、休業日を含め 24 時間受け付けています。現場が止まる時間を最小限に抑えます。",
    metric: "24",
    metricUnit: "時間受付",
  },
];
