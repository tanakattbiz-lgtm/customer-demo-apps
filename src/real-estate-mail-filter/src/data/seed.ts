import { subDays, subHours, subMinutes } from "date-fns";

/** 抽出された物件情報(本文 or 添付PDF から AI が読み取った想定) */
export type Extracted = {
  pref: string;
  city: string;
  structure: string;
  builtYear: number;
  /** 万円 */
  price: number;
  /** 表面利回り(%) */
  yieldPct: number;
  /** 建物面積(㎡) */
  areaSqm: number;
  /** 抽出元 */
  source: "本文" | "添付PDF";
};

export type Mail = {
  id: string;
  from: string;
  fromAddr: string;
  subject: string;
  body: string;
  attachment: string | null;
  /** 受信からの経過(分) */
  agoMinutes: number;
  /** 不動産物件情報メールか(1段目の判定結果) */
  isProperty: boolean;
  /** 1段目の判定確信度 0〜1 */
  confidence: number;
  /** 1段目の判定根拠 */
  classifyReason: string;
  /** 物件メールのみ。2段目の条件照合に使う抽出項目 */
  extracted: Extracted | null;
};

const H = 60;
const D = 24 * 60;

/** 物件メールを組み立てるヘルパー */
function property(
  id: string,
  from: string,
  fromAddr: string,
  agoMinutes: number,
  ex: Extracted,
  opts: { subject: string; confidence: number; reason: string; attachment: string | null },
): Mail {
  const age = 2026 - ex.builtYear;
  const body =
    `いつもお世話になっております。${from}の担当より新着の売却物件をご案内いたします。\n\n` +
    `【物件概要】\n` +
    `所在地　：${ex.pref}${ex.city}\n` +
    `構造規模：${ex.structure} / 建物面積 ${ex.areaSqm.toLocaleString()}㎡\n` +
    `築年月　：${ex.builtYear}年築(築${age}年)\n` +
    `価格　　：${ex.price.toLocaleString()}万円\n` +
    `表面利回：${ex.yieldPct.toFixed(2)}%\n\n` +
    (opts.attachment
      ? `詳細は添付の販売図面(${opts.attachment})をご確認ください。\n\n`
      : `詳細資料は追ってお送りいたします。\n\n`) +
    `ご興味がございましたら折り返しご連絡いただけますと幸いです。\n${from}`;

  return {
    id,
    from,
    fromAddr,
    subject: opts.subject,
    body,
    attachment: opts.attachment,
    agoMinutes,
    isProperty: true,
    confidence: opts.confidence,
    classifyReason: opts.reason,
    extracted: ex,
  };
}

/** 通常業務メール(仕分け対象外)を組み立てるヘルパー */
function normal(
  id: string,
  from: string,
  fromAddr: string,
  agoMinutes: number,
  subject: string,
  body: string,
  attachment: string | null,
  reason: string,
  confidence = 0.96,
): Mail {
  return {
    id,
    from,
    fromAddr,
    subject,
    body,
    attachment,
    agoMinutes,
    isProperty: false,
    confidence,
    classifyReason: reason,
    extracted: null,
  };
}

/**
 * 受信メール(ダミー)。
 * 実運用では Gmail の受信トレイをそのまま読み込む想定。
 * 物件情報メールと通常業務メールが混在している状態を再現している。
 */
export const MAILS: Mail[] = [
  property(
    "m-01",
    "アーバンリンク住販",
    "bukken@urbanlink-jusan.example.co.jp",
    38,
    { pref: "愛知県", city: "名古屋市中区栄3丁目", structure: "RC造", builtYear: 2009, price: 28800, yieldPct: 6.82, areaSqm: 842, source: "添付PDF" },
    { subject: "【新着】名古屋市中区 一棟マンション 2.88億 利回6.82%", confidence: 0.98, reason: "件名の「一棟マンション/利回」、本文の物件概要表、添付の販売図面を検出", attachment: "販売図面_栄3丁目マンション.pdf" },
  ),
  property(
    "m-02",
    "中京不動産流通センター",
    "info@chukyo-ryutsu.example.jp",
    2 * H + 12,
    { pref: "愛知県", city: "名古屋市千種区今池2丁目", structure: "RC造", builtYear: 2001, price: 19600, yieldPct: 7.14, areaSqm: 613, source: "本文" },
    { subject: "収益物件のご紹介(千種区・RC・満室稼働中)", confidence: 0.97, reason: "本文に所在地・構造・築年・利回りの物件概要が記載", attachment: null },
  ),
  property(
    "m-03",
    "東海アセットパートナーズ",
    "sales@tokai-asset.example.co.jp",
    3 * H + 40,
    { pref: "愛知県", city: "豊田市西町4丁目", structure: "RC造", builtYear: 1997, price: 12400, yieldPct: 8.05, areaSqm: 528, source: "添付PDF" },
    { subject: "【物件情報】豊田市 一棟マンション 販売図面添付", confidence: 0.98, reason: "添付PDF(販売図面)から物件概要表を読み取り", attachment: "販売図面_豊田市西町.pdf" },
  ),
  normal(
    "m-04",
    "○○管理サービス",
    "billing@kanri-service.example.jp",
    4 * H + 5,
    "【ご請求】7月分 建物管理費のご請求書送付の件",
    "いつもお世話になっております。\n7月分の建物管理費請求書を添付にてお送りいたします。\nお支払期日は月末となっております。ご確認のほどよろしくお願いいたします。",
    "請求書_2026年07月分.pdf",
    "請求・支払に関する業務メール。物件概要(所在地/構造/築年)の記載なし",
  ),
  property(
    "m-05",
    "名岐リアルエステート",
    "bukken@meigi-re.example.co.jp",
    5 * H + 22,
    { pref: "岐阜県", city: "岐阜市加納栄町通", structure: "RC造", builtYear: 2012, price: 9800, yieldPct: 7.9, areaSqm: 402, source: "本文" },
    { subject: "岐阜市 RC一棟 9,800万円 利回7.90%", confidence: 0.96, reason: "本文に物件概要表を検出。所在地は岐阜県と抽出", attachment: null },
  ),
  property(
    "m-06",
    "アーバンリンク住販",
    "bukken@urbanlink-jusan.example.co.jp",
    6 * H + 50,
    { pref: "愛知県", city: "名古屋市昭和区御器所通", structure: "鉄骨造", builtYear: 2015, price: 8600, yieldPct: 6.4, areaSqm: 318, source: "添付PDF" },
    { subject: "【新着】昭和区 一棟アパート S造 8,600万", confidence: 0.97, reason: "添付販売図面より構造「鉄骨造(S造)」を抽出", attachment: "販売図面_御器所通.pdf" },
  ),
  property(
    "m-07",
    "尾張不動産販売",
    "info@owari-fudosan.example.jp",
    8 * H + 15,
    { pref: "愛知県", city: "一宮市栄2丁目", structure: "RC造", builtYear: 1988, price: 7200, yieldPct: 9.6, areaSqm: 466, source: "本文" },
    { subject: "一宮市 一棟マンション 高利回り9.60%のご案内", confidence: 0.95, reason: "本文に物件概要表を検出。築年は1988年と抽出", attachment: null },
  ),
  normal(
    "m-05b",
    "○○税理士事務所",
    "contact@zeirishi-office.example.jp",
    9 * H + 30,
    "6月度 試算表送付のご案内",
    "お世話になっております。\n6月度の試算表がまとまりましたので送付いたします。\n次回の打ち合わせは来週水曜日を予定しております。ご都合いかがでしょうか。",
    "試算表_2026年06月.pdf",
    "会計・税務に関する業務メール。不動産物件情報の要素なし",
  ),
  property(
    "m-08",
    "東海アセットパートナーズ",
    "sales@tokai-asset.example.co.jp",
    11 * H,
    { pref: "愛知県", city: "岡崎市明大寺町", structure: "RC造", builtYear: 2004, price: 15400, yieldPct: 7.35, areaSqm: 588, source: "添付PDF" },
    { subject: "岡崎市 収益一棟 販売資料送付の件", confidence: 0.98, reason: "添付PDF(販売図面)の物件概要表から全項目を抽出", attachment: "販売図面_岡崎市明大寺.pdf" },
  ),
  property(
    "m-09",
    "セントラル不動産投資",
    "bukken@central-toshi.example.co.jp",
    13 * H + 20,
    { pref: "三重県", city: "四日市市諏訪栄町", structure: "SRC造", builtYear: 1999, price: 11200, yieldPct: 8.4, areaSqm: 704, source: "本文" },
    { subject: "【四日市】SRC一棟 1.12億 利回8.40%", confidence: 0.96, reason: "本文に物件概要表を検出。構造「SRC造」と抽出", attachment: null },
  ),
  property(
    "m-10",
    "中京不動産流通センター",
    "info@chukyo-ryutsu.example.jp",
    16 * H + 45,
    { pref: "愛知県", city: "名古屋市北区志賀町", structure: "RC造", builtYear: 2018, price: 24500, yieldPct: 5.95, areaSqm: 690, source: "添付PDF" },
    { subject: "【新築8年】北区 RC一棟 2.45億", confidence: 0.99, reason: "添付販売図面と本文の双方から物件概要を抽出(整合)", attachment: "販売図面_志賀町レジデンス.pdf" },
  ),
  normal(
    "m-11",
    "○○損害保険 代理店",
    "info@sonpo-agency.example.jp",
    19 * H,
    "火災保険 契約更新手続きのご案内(8月満期)",
    "平素より大変お世話になっております。\nご契約中の火災保険が8月に満期を迎えます。\n更新手続きのご案内資料を添付いたしますので、ご確認をお願いいたします。",
    "更新案内.pdf",
    "保険契約の更新案内。売買対象の物件概要ではないため物件情報メールに該当せず",
    0.91,
  ),
  property(
    "m-12",
    "名岐リアルエステート",
    "bukken@meigi-re.example.co.jp",
    22 * H + 10,
    { pref: "愛知県", city: "春日井市鳥居松町", structure: "RC造", builtYear: 2007, price: 13800, yieldPct: 7.02, areaSqm: 512, source: "本文" },
    { subject: "春日井市 一棟マンション 1.38億のご案内", confidence: 0.97, reason: "本文に物件概要表を検出", attachment: null },
  ),
  property(
    "m-13",
    "尾張不動産販売",
    "info@owari-fudosan.example.jp",
    1 * D + 2 * H,
    { pref: "愛知県", city: "小牧市中央1丁目", structure: "木造", builtYear: 2011, price: 4980, yieldPct: 8.9, areaSqm: 214, source: "添付PDF" },
    { subject: "小牧市 木造アパート 4,980万 利回8.90%", confidence: 0.96, reason: "添付販売図面より構造「木造」を抽出", attachment: "販売図面_小牧市中央.pdf" },
  ),
  property(
    "m-14",
    "アーバンリンク住販",
    "bukken@urbanlink-jusan.example.co.jp",
    1 * D + 5 * H,
    { pref: "愛知県", city: "名古屋市熱田区五本松町", structure: "RC造", builtYear: 2016, price: 21300, yieldPct: 6.15, areaSqm: 634, source: "添付PDF" },
    { subject: "【新着】熱田区 RC一棟 2.13億 満室", confidence: 0.98, reason: "添付販売図面の物件概要表から全項目を抽出", attachment: "販売図面_五本松町.pdf" },
  ),
  normal(
    "m-15",
    "○○銀行 法人営業部",
    "houjin@bank-example.example.jp",
    1 * D + 7 * H,
    "融資ご相談の件 打ち合わせ日程について",
    "お世話になっております。\n先日ご相談いただいた件につきまして、来週の打ち合わせ日程のご相談です。\n7/23(木)14時〜、または7/24(金)10時〜でご都合はいかがでしょうか。",
    null,
    "日程調整の業務メール。物件概要の記載がなく物件情報メールに該当せず",
  ),
  property(
    "m-16",
    "セントラル不動産投資",
    "bukken@central-toshi.example.co.jp",
    1 * D + 9 * H,
    { pref: "静岡県", city: "浜松市中央区砂山町", structure: "RC造", builtYear: 2003, price: 16700, yieldPct: 7.6, areaSqm: 720, source: "本文" },
    { subject: "浜松市 一棟マンション 1.67億 利回7.60%", confidence: 0.97, reason: "本文に物件概要表を検出。所在地は静岡県と抽出", attachment: null },
  ),
  property(
    "m-17",
    "東海アセットパートナーズ",
    "sales@tokai-asset.example.co.jp",
    1 * D + 12 * H,
    { pref: "愛知県", city: "名古屋市中村区名駅南2丁目", structure: "SRC造", builtYear: 1994, price: 33000, yieldPct: 7.28, areaSqm: 1180, source: "添付PDF" },
    { subject: "名駅南 SRC一棟ビル 3.3億 販売図面添付", confidence: 0.98, reason: "添付販売図面より構造「SRC造」・築1994年を抽出", attachment: "販売図面_名駅南ビル.pdf" },
  ),
  property(
    "m-18",
    "中京不動産流通センター",
    "info@chukyo-ryutsu.example.jp",
    1 * D + 16 * H,
    { pref: "愛知県", city: "刈谷市桜町3丁目", structure: "RC造", builtYear: 2013, price: 10900, yieldPct: 7.45, areaSqm: 458, source: "本文" },
    { subject: "刈谷市 RC一棟 1.09億 利回7.45%", confidence: 0.96, reason: "本文に物件概要表を検出", attachment: null },
  ),
  normal(
    "m-19",
    "○○リフォーム工業",
    "info@reform-kogyo.example.jp",
    1 * D + 20 * H,
    "外壁改修工事 お見積書送付の件",
    "お世話になっております。\n先般ご依頼いただきました外壁改修工事のお見積書を送付いたします。\n工期は着工から約6週間を想定しております。ご査収ください。",
    "御見積書_外壁改修.pdf",
    "工事見積の業務メール。売買物件の概要情報を含まない",
  ),
  property(
    "m-20",
    "名岐リアルエステート",
    "bukken@meigi-re.example.co.jp",
    2 * D + 3 * H,
    { pref: "愛知県", city: "名古屋市守山区小幡中", structure: "RC造", builtYear: 1991, price: 8900, yieldPct: 9.15, areaSqm: 496, source: "添付PDF" },
    { subject: "守山区 一棟マンション 8,900万 利回9.15%", confidence: 0.97, reason: "添付販売図面より築1991年(築35年)を抽出", attachment: "販売図面_小幡中.pdf" },
  ),
  property(
    "m-21",
    "アーバンリンク住販",
    "bukken@urbanlink-jusan.example.co.jp",
    2 * D + 6 * H,
    { pref: "愛知県", city: "安城市御幸本町", structure: "RC造", builtYear: 2020, price: 18600, yieldPct: 5.8, areaSqm: 505, source: "本文" },
    { subject: "【築6年】安城市 RC一棟 1.86億", confidence: 0.98, reason: "本文に物件概要表を検出", attachment: null },
  ),
  property(
    "m-22",
    "尾張不動産販売",
    "info@owari-fudosan.example.jp",
    2 * D + 9 * H,
    { pref: "愛知県", city: "半田市清水東町", structure: "鉄骨造", builtYear: 2006, price: 6700, yieldPct: 8.2, areaSqm: 288, source: "添付PDF" },
    { subject: "半田市 S造アパート 6,700万", confidence: 0.95, reason: "添付販売図面より構造「鉄骨造」を抽出", attachment: "販売図面_清水東町.pdf" },
  ),
  normal(
    "m-23",
    "○○商工会議所",
    "news@cci-example.example.jp",
    2 * D + 11 * H,
    "【会員向け】8月開催セミナーのご案内",
    "会員各位\n8月に開催予定のセミナーについてご案内いたします。\nテーマ:事業承継と資産管理の実務\n開催日:8月20日(木)14:00〜16:00\n参加をご希望の方は申込フォームよりお手続きください。",
    null,
    "セミナー案内のメールマガジン。物件情報メールに該当せず",
    0.94,
  ),
  property(
    "m-24",
    "セントラル不動産投資",
    "bukken@central-toshi.example.co.jp",
    2 * D + 15 * H,
    { pref: "愛知県", city: "名古屋市天白区植田山", structure: "RC造", builtYear: 2010, price: 17200, yieldPct: 6.7, areaSqm: 566, source: "本文" },
    { subject: "天白区 RC一棟 1.72億 利回6.70%", confidence: 0.97, reason: "本文に物件概要表を検出", attachment: null },
  ),
  property(
    "m-25",
    "東海アセットパートナーズ",
    "sales@tokai-asset.example.co.jp",
    3 * D + 2 * H,
    { pref: "岐阜県", city: "大垣市郭町", structure: "RC造", builtYear: 2008, price: 8300, yieldPct: 8.65, areaSqm: 384, source: "添付PDF" },
    { subject: "大垣市 RC一棟 8,300万 利回8.65%", confidence: 0.96, reason: "添付販売図面より所在地「岐阜県大垣市」を抽出", attachment: "販売図面_大垣市郭町.pdf" },
  ),
  property(
    "m-26",
    "中京不動産流通センター",
    "info@chukyo-ryutsu.example.jp",
    3 * D + 5 * H,
    { pref: "愛知県", city: "名古屋市南区柴田本通", structure: "RC造", builtYear: 1985, price: 6400, yieldPct: 10.2, areaSqm: 412, source: "本文" },
    { subject: "南区 一棟マンション 6,400万 利回10.20%", confidence: 0.95, reason: "本文に物件概要表を検出。築1985年(築41年)と抽出", attachment: null },
  ),
  normal(
    "m-27",
    "○○ガス 供給センター",
    "info@gas-supply.example.jp",
    3 * D + 8 * H,
    "定期保安点検の実施日程について",
    "いつもご利用いただきありがとうございます。\n法令に基づく定期保安点検を8月上旬に実施いたします。\n対象物件のご担当者様のご在館日をご連絡ください。",
    null,
    "設備点検の連絡。物件の売買情報ではないため対象外",
  ),
  property(
    "m-28",
    "アーバンリンク住販",
    "bukken@urbanlink-jusan.example.co.jp",
    3 * D + 13 * H,
    { pref: "愛知県", city: "名古屋市西区名西2丁目", structure: "RC造", builtYear: 1999, price: 14300, yieldPct: 7.88, areaSqm: 604, source: "添付PDF" },
    { subject: "西区 RC一棟 1.43億 利回7.88% 図面添付", confidence: 0.98, reason: "添付販売図面の物件概要表から全項目を抽出", attachment: "販売図面_名西2丁目.pdf" },
  ),
  property(
    "m-29",
    "名岐リアルエステート",
    "bukken@meigi-re.example.co.jp",
    4 * D + 4 * H,
    { pref: "東京都", city: "板橋区大山町", structure: "RC造", builtYear: 2014, price: 42000, yieldPct: 4.6, areaSqm: 780, source: "本文" },
    { subject: "【首都圏】板橋区 RC一棟 4.2億", confidence: 0.97, reason: "本文に物件概要表を検出。所在地は東京都と抽出", attachment: null },
  ),
  property(
    "m-30",
    "尾張不動産販売",
    "info@owari-fudosan.example.jp",
    4 * D + 9 * H,
    { pref: "愛知県", city: "稲沢市国府宮神田町", structure: "RC造", builtYear: 2002, price: 9600, yieldPct: 8.35, areaSqm: 447, source: "添付PDF" },
    { subject: "稲沢市 RC一棟 9,600万 利回8.35%", confidence: 0.96, reason: "添付販売図面より築2002年(築24年)を抽出", attachment: "販売図面_国府宮神田町.pdf" },
  ),
  normal(
    "m-31",
    "○○司法書士事務所",
    "info@shihoshoshi.example.jp",
    4 * D + 14 * H,
    "登記識別情報 originalのご返送について",
    "お世話になっております。\n先日の所有権移転登記が完了いたしましたので、書類一式を返送いたします。\n到着後、内容のご確認をお願いいたします。",
    null,
    "登記手続き完了の連絡。新規の物件紹介ではないため対象外",
    0.93,
  ),
  property(
    "m-32",
    "セントラル不動産投資",
    "bukken@central-toshi.example.co.jp",
    5 * D + 3 * H,
    { pref: "愛知県", city: "豊橋市駅前大通2丁目", structure: "SRC造", builtYear: 2011, price: 20400, yieldPct: 7.1, areaSqm: 812, source: "本文" },
    { subject: "豊橋駅前 SRC一棟 2.04億 利回7.10%", confidence: 0.97, reason: "本文に物件概要表を検出。構造「SRC造」と抽出", attachment: null },
  ),
  property(
    "m-33",
    "東海アセットパートナーズ",
    "sales@tokai-asset.example.co.jp",
    5 * D + 10 * H,
    { pref: "愛知県", city: "名古屋市緑区鳴海町", structure: "RC造", builtYear: 2019, price: 16900, yieldPct: 6.05, areaSqm: 498, source: "添付PDF" },
    { subject: "【築7年】緑区 RC一棟 1.69億", confidence: 0.99, reason: "添付販売図面と本文の双方から物件概要を抽出(整合)", attachment: "販売図面_鳴海町.pdf" },
  ),
  property(
    "m-34",
    "中京不動産流通センター",
    "info@chukyo-ryutsu.example.jp",
    6 * D + 6 * H,
    { pref: "愛知県", city: "瀬戸市西追分町", structure: "木造",  builtYear: 1996, price: 3800, yieldPct: 11.4, areaSqm: 196, source: "本文" },
    { subject: "瀬戸市 木造アパート 3,800万 利回11.40%", confidence: 0.94, reason: "本文に物件概要表を検出。構造「木造」と抽出", attachment: null },
  ),
];

/** 受信日時は「今」を基準に相対生成する(デモを開いた時点で常に最近のデータに見せるため) */
export function receivedAt(mail: Mail): Date {
  const now = new Date();
  const days = Math.floor(mail.agoMinutes / (24 * 60));
  const rest = mail.agoMinutes % (24 * 60);
  return subMinutes(subHours(subDays(now, days), Math.floor(rest / 60)), rest % 60);
}

/** 都道府県の選択肢(条件設定シート用) */
export const PREF_OPTIONS = [
  "愛知県",
  "岐阜県",
  "三重県",
  "静岡県",
  "東京都",
] as const;

/** 構造の選択肢(条件設定シート用) */
export const STRUCTURE_OPTIONS = ["RC造", "SRC造", "鉄骨造", "木造"] as const;
