import { subDays, subHours } from "date-fns";

// ============================================================
//  型定義
// ============================================================

export type Category =
  | "販売・接客"
  | "物流・倉庫"
  | "製造・工場"
  | "軽作業"
  | "飲食・フード"
  | "介護・福祉"
  | "ドライバー"
  | "事務・オフィス";

export type Employment = "正社員" | "契約社員" | "紹介予定派遣" | "派遣";

export interface Wage {
  type: "月給" | "時給";
  min: number; // 月給は万円 / 時給は円
  max: number;
}

export interface Job {
  id: string;
  title: string;
  company: string; // ※機能紹介用のダミー企業名(架空)
  category: Category;
  prefecture: string;
  city: string;
  employment: Employment;
  wage: Wage;
  tags: string[];
  catch: string; // 応援トーンのキャッチコピー
  body: string;
  holiday: string;
  hours: string;
  postedAt: string; // ISO
  views: number;
  published: boolean;
}

export type Era = "20代" | "30代" | "40代以上" | "指定なし";

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  name: string;
  kana: string;
  era: Era;
  desiredArea: string;
  experience: string; // これまでの経験(自由記述)
  message: string;
  appliedAt: string; // ISO
  status: "新規応募" | "書類確認中" | "面接調整中";
}

// ============================================================
//  地域マスタ(都道府県 → 市区町村)
//  ※ 関東甲信越・関西圏・太平洋ベルトを中心に
// ============================================================

export const REGIONS: Record<string, string[]> = {
  東京都: ["新宿区", "渋谷区", "世田谷区", "豊島区", "八王子市", "町田市"],
  神奈川県: ["横浜市", "川崎市", "相模原市", "藤沢市", "厚木市"],
  埼玉県: ["さいたま市", "川口市", "所沢市", "越谷市"],
  千葉県: ["千葉市", "船橋市", "柏市", "市川市"],
  愛知県: ["名古屋市", "豊田市", "岡崎市", "一宮市"],
  大阪府: ["大阪市", "堺市", "東大阪市", "吹田市"],
  兵庫県: ["神戸市", "姫路市", "西宮市", "尼崎市"],
  福岡県: ["福岡市", "北九州市", "久留米市"],
  長野県: ["長野市", "松本市"],
  新潟県: ["新潟市", "長岡市"],
};

export const PREFECTURES = Object.keys(REGIONS);

// ============================================================
//  職種マスタ
// ============================================================

export const CATEGORIES: { key: Category; icon: string; hint: string }[] = [
  { key: "販売・接客", icon: "ShoppingBag", hint: "アパレル・店舗スタッフ" },
  { key: "物流・倉庫", icon: "Package", hint: "ピッキング・仕分け" },
  { key: "製造・工場", icon: "Factory", hint: "組立・検査・ライン" },
  { key: "軽作業", icon: "Boxes", hint: "シール貼り・梱包" },
  { key: "飲食・フード", icon: "UtensilsCrossed", hint: "ホール・キッチン" },
  { key: "介護・福祉", icon: "HeartHandshake", hint: "介護スタッフ・送迎" },
  { key: "ドライバー", icon: "Truck", hint: "配送・ルート" },
  { key: "事務・オフィス", icon: "Briefcase", hint: "データ入力・受付" },
];

// ============================================================
//  求人シード
// ============================================================

type Raw = Omit<Job, "id" | "postedAt" | "published"> & { daysAgo: number };

const RAW: Raw[] = [
  {
    title: "未経験OK！倉庫内の商品ピッキングスタッフ",
    company: "サンライズ物流株式会社",
    category: "物流・倉庫",
    prefecture: "埼玉県",
    city: "川口市",
    employment: "正社員",
    wage: { type: "月給", min: 23, max: 28 },
    tags: ["未経験歓迎", "学歴不問", "20代活躍中", "交通費支給", "週休2日"],
    catch: "スマホでピッ！と探すだけ。特別なスキルはいりません。",
    body: "ネット通販の商品を、リストを見ながら集めて仕分けするお仕事です。難しい作業はありません。先輩が3日間つきっきりで教えるので、バイトしか経験がなくても大丈夫。もくもく作業が好きな方にぴったりです。",
    holiday: "週休2日制(シフト制)",
    hours: "9:00〜18:00(実働8h)",
    daysAgo: 0.4,
    views: 312,
  },
  {
    title: "20代活躍中◎家電量販店の販売サポート",
    company: "株式会社ミナトデンキ",
    category: "販売・接客",
    prefecture: "東京都",
    city: "町田市",
    employment: "正社員",
    wage: { type: "月給", min: 24, max: 32 },
    tags: ["未経験歓迎", "研修制度あり", "20代活躍中", "土日祝手当"],
    catch: "「人と話すのが好き」その気持ちだけでOK。",
    body: "売り場でお客様のご案内や、商品の陳列・在庫チェックをお願いします。商品知識は入社後の研修でしっかり身につきます。人見知りだった先輩も、今では立派な販売員に。あなたのペースで成長できます。",
    holiday: "月8〜9日休み",
    hours: "10:00〜19:00(実働8h)",
    daysAgo: 1,
    views: 288,
  },
  {
    title: "ブランクOK！自動車部品の組立・検査",
    company: "東海プレシジョン工業株式会社",
    category: "製造・工場",
    prefecture: "愛知県",
    city: "豊田市",
    employment: "正社員",
    wage: { type: "月給", min: 25, max: 33 },
    tags: ["未経験歓迎", "寮・社宅あり", "前職不問", "資格取得支援", "週休2日"],
    catch: "手に職をつけたい人、応援します。寮完備で新生活も安心。",
    body: "小さな自動車部品を組み立てて、キズがないかチェックするお仕事。エアコン完備の綺麗な工場です。家具家電付きの寮があるので、地方から出てくる方も多数活躍中。フォークリフトなどの資格取得も会社が全額サポートします。",
    holiday: "土日休み(会社カレンダー)",
    hours: "8:30〜17:30(実働8h)",
    daysAgo: 2,
    views: 401,
  },
  {
    title: "座り仕事メイン◎シール貼り・かんたん梱包",
    company: "つばさパッケージ株式会社",
    category: "軽作業",
    prefecture: "大阪府",
    city: "東大阪市",
    employment: "契約社員",
    wage: { type: "時給", min: 1200, max: 1350 },
    tags: ["未経験歓迎", "学歴不問", "服装自由", "ブランクOK"],
    catch: "力仕事はナシ。もくもく系が好きな人あつまれ〜。",
    body: "商品にシールを貼ったり、箱に詰めたりする軽作業です。座ってできる工程が多めで、体力に自信がなくても続けられます。服装・髪型自由。まずは「やってみたい」の一歩からどうぞ。",
    holiday: "週休2日制",
    hours: "9:30〜17:30(実働7h)",
    daysAgo: 3,
    views: 197,
  },
  {
    title: "研修3ヶ月あり！人気カフェのホールスタッフ",
    company: "株式会社グリーンリーフ",
    category: "飲食・フード",
    prefecture: "東京都",
    city: "渋谷区",
    employment: "正社員",
    wage: { type: "月給", min: 23, max: 29 },
    tags: ["未経験歓迎", "研修制度あり", "20代活躍中", "服装自由"],
    catch: "笑顔だけ持ってきて。あとはぜんぶ教えます。",
    body: "おしゃれなカフェで、注文をとったりドリンクを運んだりするお仕事。3ヶ月の研修があるので、飲食が初めてでも安心です。将来は店長やエリアマネージャーへの道も。あなたの「好き」を仕事にしませんか。",
    holiday: "週休2日制(シフト制)",
    hours: "シフト制(実働8h)",
    daysAgo: 4,
    views: 356,
  },
  {
    title: "無資格・未経験から始める介護スタッフ",
    company: "ぬくもりケアサービス株式会社",
    category: "介護・福祉",
    prefecture: "神奈川県",
    city: "藤沢市",
    employment: "正社員",
    wage: { type: "月給", min: 24, max: 30 },
    tags: ["未経験歓迎", "資格取得支援", "研修制度あり", "前職不問", "週休2日"],
    catch: "「ありがとう」がやりがいに。資格は働きながら取れます。",
    body: "デイサービスで、利用者さんの生活のお手伝いや話し相手をするお仕事。無資格・未経験からスタートした先輩がほとんどです。介護資格の取得費用は会社が負担。人の役に立ちたい気持ちがある方、大歓迎です。",
    holiday: "週休2日制(シフト制)",
    hours: "8:00〜17:00(実働8h)",
    daysAgo: 5,
    views: 244,
  },
  {
    title: "AT限定OK！ルート配送ドライバー(2t)",
    company: "みなと運輸株式会社",
    category: "ドライバー",
    prefecture: "千葉県",
    city: "船橋市",
    employment: "正社員",
    wage: { type: "月給", min: 26, max: 34 },
    tags: ["未経験歓迎", "交通費支給", "土日祝休み", "20代活躍中"],
    catch: "決まったルートだから道に迷わない。ひとりの時間も◎",
    body: "決まったお店やオフィスに荷物を届けるお仕事。毎日同じルートなので、すぐに慣れます。重い荷物は台車を使うので力仕事は少なめ。運転が好きな方、ひとりで黙々と働きたい方におすすめです。",
    holiday: "土日祝休み",
    hours: "8:00〜17:00(実働8h)",
    daysAgo: 6,
    views: 178,
  },
  {
    title: "土日祝休み◎データ入力・かんたん事務",
    company: "株式会社アオゾラ商会",
    category: "事務・オフィス",
    prefecture: "大阪府",
    city: "大阪市",
    employment: "紹介予定派遣",
    wage: { type: "時給", min: 1400, max: 1550 },
    tags: ["未経験歓迎", "土日祝休み", "服装自由", "研修制度あり"],
    catch: "正社員をめざせる紹介予定派遣。パソコンは入力できればOK。",
    body: "注文データの入力や書類整理などのオフィスワーク。タイピングができれば大丈夫です。紹介予定派遣なので、まずは派遣で職場を体験してから正社員を目指せます。事務デビューを応援します。",
    holiday: "土日祝休み",
    hours: "9:00〜18:00(実働8h)",
    daysAgo: 7,
    views: 265,
  },
  {
    title: "20〜30代活躍！アパレルショップスタッフ",
    company: "株式会社リュクスモード",
    category: "販売・接客",
    prefecture: "兵庫県",
    city: "神戸市",
    employment: "正社員",
    wage: { type: "月給", min: 22, max: 28 },
    tags: ["未経験歓迎", "服装自由", "20代活躍中", "研修制度あり"],
    catch: "好きな服に囲まれて働く毎日。社割でおしゃれも楽しめる。",
    body: "アパレルショップで接客やコーディネート提案、レジ、品出しをお願いします。ファッションが好きなら未経験でも大丈夫。社員割引でお得にお買い物も。まずは「好き」からはじめましょう。",
    holiday: "週休2日制(シフト制)",
    hours: "シフト制(実働8h)",
    daysAgo: 8,
    views: 233,
  },
  {
    title: "冷暖房完備の倉庫でフォークリフト業務",
    company: "セントラル流通株式会社",
    category: "物流・倉庫",
    prefecture: "愛知県",
    city: "一宮市",
    employment: "正社員",
    wage: { type: "月給", min: 25, max: 31 },
    tags: ["未経験歓迎", "資格取得支援", "交通費支給", "週休2日"],
    catch: "資格ゼロでも大丈夫。免許取得は会社が全額サポート。",
    body: "倉庫内で荷物の運搬や入出庫作業を行います。フォークリフトの免許は入社後に会社負担で取得可能。空調完備で夏も冬も快適な環境です。手に職をつけて長く働きたい方にぴったりです。",
    holiday: "週休2日制",
    hours: "8:30〜17:30(実働8h)",
    daysAgo: 10,
    views: 156,
  },
  {
    title: "夜勤なし◎病院内のかんたん清掃・環境整備",
    company: "クリーンライフ神奈川株式会社",
    category: "軽作業",
    prefecture: "神奈川県",
    city: "横浜市",
    employment: "契約社員",
    wage: { type: "時給", min: 1180, max: 1250 },
    tags: ["未経験歓迎", "ブランクOK", "前職不問", "交通費支給"],
    catch: "自分のペースでコツコツと。夜勤ナシで生活リズムも整う。",
    body: "病院内の廊下や待合室などをきれいにするお仕事です。マニュアルがあるので未経験でも安心。ブランクのある方、久しぶりのお仕事という方も多数活躍しています。夜勤はありません。",
    holiday: "週休2日制(シフト制)",
    hours: "8:00〜16:00(実働7h)",
    daysAgo: 12,
    views: 121,
  },
  {
    title: "まかない付き！居酒屋のキッチンスタッフ",
    company: "株式会社まんぷく亭",
    category: "飲食・フード",
    prefecture: "福岡県",
    city: "福岡市",
    employment: "正社員",
    wage: { type: "月給", min: 23, max: 30 },
    tags: ["未経験歓迎", "学歴不問", "20代活躍中", "服装自由"],
    catch: "料理未経験から料理長へ。おいしいまかない付き。",
    body: "居酒屋の厨房で調理補助からスタート。包丁を握ったことがなくても、先輩が基礎から教えます。がんばり次第で料理長への昇進も。毎日のまかないが楽しみになる、あたたかい職場です。",
    holiday: "週休2日制(シフト制)",
    hours: "15:00〜23:00(実働8h)",
    daysAgo: 14,
    views: 143,
  },
  {
    title: "送迎ドライバー兼介護サポート(普通免許でOK)",
    company: "ひだまり介護サービス株式会社",
    category: "ドライバー",
    prefecture: "埼玉県",
    city: "越谷市",
    employment: "正社員",
    wage: { type: "月給", min: 22, max: 27 },
    tags: ["未経験歓迎", "資格取得支援", "前職不問", "週休2日"],
    catch: "普通免許があればスタートできる、人にやさしいお仕事。",
    body: "デイサービスの利用者さんの送り迎えと、施設内での軽いサポートをお願いします。普通自動車免許があればOK。介護の資格は働きながら取得できます。人と接するのが好きな方にぴったりです。",
    holiday: "週休2日制",
    hours: "7:30〜16:30(実働8h)",
    daysAgo: 16,
    views: 98,
  },
  {
    title: "受付・電話対応スタッフ(研修たっぷり)",
    company: "株式会社にじいろサポート",
    category: "事務・オフィス",
    prefecture: "東京都",
    city: "新宿区",
    employment: "契約社員",
    wage: { type: "時給", min: 1450, max: 1600 },
    tags: ["未経験歓迎", "研修制度あり", "土日祝休み", "服装自由"],
    catch: "話し方から教えます。丁寧な研修で「できる」に変わる。",
    body: "オフィスの受付や電話の取次ぎ、来客対応をお願いします。ビジネスマナーは入社後の研修でしっかり学べるので、社会人経験が浅くても安心。落ち着いた環境で長く働きたい方を歓迎します。",
    holiday: "土日祝休み",
    hours: "9:00〜18:00(実働8h)",
    daysAgo: 18,
    views: 176,
  },
  {
    title: "食品工場のライン・盛り付けスタッフ",
    company: "北九州フーズパック株式会社",
    category: "製造・工場",
    prefecture: "福岡県",
    city: "北九州市",
    employment: "正社員",
    wage: { type: "月給", min: 21, max: 26 },
    tags: ["未経験歓迎", "学歴不問", "ブランクOK", "交通費支給", "週休2日"],
    catch: "決まった作業のくり返しだから、すぐ慣れる・すぐ活躍。",
    body: "お弁当やお惣菜を、決められた場所に盛り付けたりパック詰めするお仕事。マニュアル通りに進めるだけなので、未経験・ブランクありでもすぐ慣れます。清潔で明るい工場です。",
    holiday: "週休2日制(シフト制)",
    hours: "8:00〜17:00(実働8h)",
    daysAgo: 21,
    views: 87,
  },
  {
    title: "スマホ受付カウンターのご案内スタッフ",
    company: "株式会社コネクトモバイル",
    category: "販売・接客",
    prefecture: "千葉県",
    city: "柏市",
    employment: "正社員",
    wage: { type: "月給", min: 24, max: 33 },
    tags: ["未経験歓迎", "研修制度あり", "20代活躍中", "資格取得支援"],
    catch: "スマホが好き＝立派な武器。マニュアル完備で安心デビュー。",
    body: "携帯ショップでプランのご案内や契約手続きのサポートをします。専門知識は入社後の研修で身につくので大丈夫。普段スマホを使っている感覚が活かせます。20代の先輩が多く、質問しやすい職場です。",
    holiday: "月8〜9日休み(シフト制)",
    hours: "10:00〜19:00(実働8h)",
    daysAgo: 24,
    views: 112,
  },
  {
    title: "長野の自然の中で!リゾート施設スタッフ",
    company: "株式会社しなの高原リゾート",
    category: "飲食・フード",
    prefecture: "長野県",
    city: "松本市",
    employment: "契約社員",
    wage: { type: "月給", min: 21, max: 25 },
    tags: ["未経験歓迎", "寮・社宅あり", "学歴不問", "20代活躍中"],
    catch: "住み込みで新しい自分に。生活費を抑えてしっかり貯金。",
    body: "リゾート施設のレストランや売店での接客・調理補助など。寮完備・食事付きなので、地方から出てくる方も多く活躍中。自然に囲まれた環境で、心機一転はたらきたい方にぴったりです。",
    holiday: "週休2日制(シフト制)",
    hours: "シフト制(実働8h)",
    daysAgo: 27,
    views: 76,
  },
];

// ============================================================
//  応募シード(管理画面の初期表示用)
// ============================================================

type RawApp = Omit<Application, "id" | "appliedAt"> & { hoursAgo: number };

const RAW_APPS: RawApp[] = [
  {
    jobId: "job-1",
    jobTitle: "未経験OK！倉庫内の商品ピッキングスタッフ",
    company: "サンライズ物流株式会社",
    name: "田村 陽介",
    kana: "タムラ ヨウスケ",
    era: "20代",
    desiredArea: "埼玉県 川口市",
    experience: "コンビニのアルバイトを2年ほど。フルタイムで働くのは初めてです。",
    message: "もくもく作業が得意なので挑戦したいです。よろしくお願いします。",
    status: "書類確認中",
    hoursAgo: 5,
  },
  {
    jobId: "job-1",
    jobTitle: "未経験OK！倉庫内の商品ピッキングスタッフ",
    company: "サンライズ物流株式会社",
    name: "佐々木 美咲",
    kana: "ササキ ミサキ",
    era: "20代",
    desiredArea: "埼玉県 さいたま市",
    experience: "派遣で軽作業の経験あり。正社員は初めてです。",
    message: "安定して長く働きたいと思い応募しました。",
    status: "新規応募",
    hoursAgo: 20,
  },
  {
    jobId: "job-3",
    jobTitle: "ブランクOK！自動車部品の組立・検査",
    company: "東海プレシジョン工業株式会社",
    name: "高橋 大輝",
    kana: "タカハシ ダイキ",
    era: "30代",
    desiredArea: "愛知県 豊田市",
    experience: "飲食店で5年勤務。ものづくりに興味があり転職を考えています。",
    message: "寮があると聞き応募しました。手に職をつけたいです。",
    status: "面接調整中",
    hoursAgo: 32,
  },
];

// ============================================================
//  シード生成
// ============================================================

export const CURRENT_ADMIN = "採用担当 山口";

export interface AppData {
  jobs: Job[];
  applications: Application[];
}

export function buildSeed(): AppData {
  const jobs: Job[] = RAW.map((r, i) => {
    const { daysAgo, ...rest } = r;
    const postedAt =
      daysAgo < 1
        ? subHours(new Date(), Math.round(daysAgo * 24)).toISOString()
        : subDays(new Date(), Math.round(daysAgo)).toISOString();
    return { ...rest, id: `job-${i + 1}`, postedAt, published: true };
  });

  const applications: Application[] = RAW_APPS.map((r, i) => {
    const { hoursAgo, ...rest } = r;
    return {
      ...rest,
      id: `app-${i + 1}`,
      appliedAt: subHours(new Date(), hoursAgo).toISOString(),
    };
  });

  return { jobs, applications };
}

// 新着判定(3日以内)
export function isNew(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 1000 * 60 * 60 * 24 * 3;
}
