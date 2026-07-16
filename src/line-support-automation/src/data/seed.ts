import { subDays, subHours, subMinutes } from "date-fns";

// ============================================================
//  型定義
// ============================================================

/** ユーザーの進捗ステージ(オンボーディングのパイプライン) */
export type Stage = "friend" | "account" | "trade" | "done" | "churn";

/** パイプライン上の進行順(churn は分岐なので含めない) */
export const STAGE_ORDER: Stage[] = ["friend", "account", "trade", "done"];

export const STAGE_LABEL: Record<Stage, string> = {
  friend: "友だち追加",
  account: "口座開設サポート",
  trade: "取引サポート",
  done: "取引完了",
  churn: "離脱・要再アプローチ",
};

export const STAGE_SHORT: Record<Stage, string> = {
  friend: "友だち追加",
  account: "口座開設",
  trade: "取引",
  done: "完了",
  churn: "離脱",
};

export const STAGE_TONE: Record<Stage, string> = {
  friend: "blue",
  account: "violet",
  trade: "amber",
  done: "green",
  churn: "gray",
};

export interface Member {
  id: string;
  name: string; // 氏名(サンプルデータ)
  lineName: string; // LINE 表示名
  color: string;
  stage: Stage;
  stepIndex: number; // 現ステージのシナリオで配信済みのステップ数
  joinedAt: string; // 友だち追加日時
  lastActiveAt: string; // 最終アクティブ日時
  broker: string; // 案内中の口座
  reward: number; // 想定報酬(円)
  assigneeId: string;
  note?: string;
}

export interface ScenarioStep {
  id: string;
  title: string;
  timing: string; // 配信タイミング(例: 登録直後 / 翌日)
  body: string; // 配信メッセージ本文
}

export interface Scenario {
  stage: Stage; // どのステージのユーザーに配信するか
  steps: ScenarioStep[];
}

export type FaqCategory = "口座開設" | "取引" | "報酬" | "その他";

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  keywords: string[]; // 反応キーワード
  answer: string;
  enabled: boolean;
  hits: number; // 今月の自動返信回数
}

export type ActivityType = "join" | "step" | "stage" | "faq" | "stall" | "manual";

export interface Activity {
  id: string;
  at: string;
  type: ActivityType;
  memberId?: string;
  memberName?: string;
  text: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface AppData {
  members: Member[];
  scenarios: Scenario[];
  faqs: Faq[];
  activities: Activity[];
  staff: Staff[];
}

// ============================================================
//  スタッフ(運用担当)
// ============================================================

export const CURRENT_USER_ID = "op_me";

const STAFF: Staff[] = [
  { id: "op_me", name: "運用管理者", role: "サポート統括", color: "oklch(55% 0.14 151)" },
  { id: "op_sato", name: "佐藤 美咲", role: "運用サポート", color: "oklch(60% 0.16 25)" },
  { id: "op_tamura", name: "田村 亮", role: "運用サポート", color: "oklch(58% 0.13 265)" },
];

export const staffById = (staff: Staff[], id: string) => staff.find((s) => s.id === id);

// ============================================================
//  ステップ配信シナリオ(ステージ別)
// ============================================================

function buildScenarios(): Scenario[] {
  return [
    {
      stage: "friend",
      steps: [
        {
          id: "st_f1",
          title: "ウェルカムメッセージ",
          timing: "登録直後",
          body:
            "友だち追加ありがとうございます！FXポイ活サポートへようこそ。これから口座開設〜取引完了まで、順番にご案内します。まずはこのトークをブックマークしておいてください。",
        },
        {
          id: "st_f2",
          title: "全体の流れをご案内",
          timing: "5分後",
          body:
            "進め方は4ステップです。①口座開設 → ②入金 → ③取引 → ④報酬受取。分からないことはこのトークにいつでも質問してください（自動で回答します）。",
        },
        {
          id: "st_f3",
          title: "口座開設への誘導",
          timing: "翌日 10:00",
          body:
            "それでは口座開設に進みましょう。次のメッセージから、手順を順番にお送りします。準備ができたら「開設スタート」と送ってください。",
        },
      ],
    },
    {
      stage: "account",
      steps: [
        {
          id: "st_a1",
          title: "口座開設マニュアル配信",
          timing: "ステージ開始時",
          body:
            "口座開設の手順書をお送りします。所要時間はおよそ10分です。スマホから完結できますので、画面の案内に沿って入力を進めてください。",
        },
        {
          id: "st_a2",
          title: "本人確認書類の案内",
          timing: "1日後",
          body:
            "本人確認では、運転免許証またはマイナンバーカードをご用意ください。撮影のコツ（明るい場所・全体が入るように）もこちらの画像で解説しています。",
        },
        {
          id: "st_a3",
          title: "開設完了の確認",
          timing: "3日後",
          body:
            "口座開設は完了しましたか？完了された方は「開設完了」と送ってください。取引サポートのステップに進みます。つまずいている方は状況を教えてください。",
        },
      ],
    },
    {
      stage: "trade",
      steps: [
        {
          id: "st_t1",
          title: "入金・初回取引マニュアル",
          timing: "ステージ開始時",
          body:
            "口座開設おめでとうございます！次は入金と初回取引です。ポイ活の条件を満たす取引手順を、画像付きで順番にご案内します。",
        },
        {
          id: "st_t2",
          title: "取引条件(ロット・回数)の案内",
          timing: "1日後",
          body:
            "報酬確定に必要な取引ロット・回数の目安はこちらです。無理のない範囲で、条件達成までサポートします。ご不明点は質問してください。",
        },
        {
          id: "st_t3",
          title: "報酬確定条件のチェック",
          timing: "3日後",
          body:
            "取引条件は達成できましたか？「達成」と送っていただくと、報酬受取までの最終案内をお送りします。もう少しの方は残り条件を一緒に確認しましょう。",
        },
      ],
    },
  ];
}

export const scenarioForStage = (scenarios: Scenario[], stage: Stage) =>
  scenarios.find((s) => s.stage === stage);

// ============================================================
//  FAQ(自動返信)
// ============================================================

function buildFaqs(): Faq[] {
  return [
    {
      id: "faq_1",
      category: "口座開設",
      question: "口座開設にはどれくらい時間がかかりますか？",
      keywords: ["口座開設", "時間", "どれくらい", "審査"],
      answer:
        "入力はおよそ10分で完了します。本人確認の審査は最短で当日〜翌営業日です。審査完了の通知が届いたら「開設完了」と送ってください。",
      enabled: true,
      hits: 47,
    },
    {
      id: "faq_2",
      category: "口座開設",
      question: "本人確認に必要な書類は？",
      keywords: ["本人確認", "書類", "免許証", "マイナンバー"],
      answer:
        "運転免許証、またはマイナンバーカードのいずれか1点でお手続きできます。スマホでの撮影に対応しています。",
      enabled: true,
      hits: 33,
    },
    {
      id: "faq_3",
      category: "取引",
      question: "取引はいくらから始められますか？",
      keywords: ["取引", "いくら", "最低", "入金", "金額"],
      answer:
        "推奨の入金額と最低取引ロットはマニュアルに記載しています。ポイ活条件の達成に必要な目安もあわせてご案内していますのでご確認ください。",
      enabled: true,
      hits: 28,
    },
    {
      id: "faq_4",
      category: "取引",
      question: "取引のやり方が分かりません",
      keywords: ["取引", "やり方", "方法", "わからない", "分からない"],
      answer:
        "初回取引の手順を画像付きでご案内します。順番に進めれば大丈夫です。特定の画面で止まっている場合は、その画面名を送っていただければ個別にサポートします。",
      enabled: true,
      hits: 41,
    },
    {
      id: "faq_5",
      category: "報酬",
      question: "報酬はいつ受け取れますか？",
      keywords: ["報酬", "いつ", "受取", "受け取り", "振込"],
      answer:
        "取引条件の達成を確認後、所定の期間を経てお受け取りいただけます。条件達成が確認できたら、受取までの流れを個別にご案内します。",
      enabled: true,
      hits: 22,
    },
    {
      id: "faq_6",
      category: "報酬",
      question: "報酬の条件を教えてください",
      keywords: ["報酬", "条件", "ロット", "回数", "達成"],
      answer:
        "報酬確定には所定の取引ロット・回数の達成が必要です。現在の達成状況はサポート担当が管理していますので、「進捗」と送っていただければお知らせします。",
      enabled: true,
      hits: 19,
    },
    {
      id: "faq_7",
      category: "その他",
      question: "問い合わせの返信が来ない",
      keywords: ["返信", "こない", "来ない", "連絡", "遅い"],
      answer:
        "よくあるご質問には自動でご案内しています。個別の対応が必要な場合は担当者が順次確認します。お急ぎの内容は「至急」と添えてお送りください。",
      enabled: true,
      hits: 12,
    },
    {
      id: "faq_8",
      category: "その他",
      question: "退会・配信停止したい",
      keywords: ["退会", "配信停止", "ブロック", "やめたい"],
      answer:
        "配信の停止をご希望の場合は「配信停止」と送ってください。手続きをご案内します。再開はいつでも可能です。",
      enabled: false,
      hits: 4,
    },
    {
      id: "faq_9",
      category: "口座開設",
      question: "審査に落ちた場合はどうすれば？",
      keywords: ["審査", "落ちた", "否決", "通らない"],
      answer:
        "審査結果によっては別の口座をご案内できる場合があります。「審査NG」と送っていただければ、次のステップを担当者がご提案します。",
      enabled: true,
      hits: 8,
    },
    {
      id: "faq_10",
      category: "取引",
      question: "スプレッドやスワップとは？",
      keywords: ["スプレッド", "スワップ", "用語", "意味"],
      answer:
        "取引の基本用語は用語集にまとめています。ポイ活に必要な範囲だけ、やさしい言葉で解説していますのでご安心ください。",
      enabled: true,
      hits: 15,
    },
  ];
}

// ============================================================
//  ユーザー(メンバー)生成
// ============================================================

// 氏名・LINE表示名(サンプルデータ。実在の人物ではありません)
const MEMBER_DEFS: {
  name: string;
  line: string;
  stage: Stage;
  step: number;
  joinedDaysAgo: number;
  lastActiveHoursAgo: number;
  broker: string;
  reward: number;
  staff: number;
}[] = [
  { name: "山田 健一", line: "けんちゃん", stage: "trade", step: 2, joinedDaysAgo: 12, lastActiveHoursAgo: 5, broker: "A社 FX口座", reward: 25000, staff: 1 },
  { name: "佐々木 由美", line: "yumi.s", stage: "account", step: 1, joinedDaysAgo: 6, lastActiveHoursAgo: 120, broker: "B社 FX口座", reward: 20000, staff: 2 },
  { name: "高橋 大輔", line: "だい", stage: "done", step: 3, joinedDaysAgo: 24, lastActiveHoursAgo: 30, broker: "A社 FX口座", reward: 30000, staff: 1 },
  { name: "中村 彩", line: "aya___", stage: "friend", step: 1, joinedDaysAgo: 1, lastActiveHoursAgo: 3, broker: "C社 証券口座", reward: 15000, staff: 0 },
  { name: "小林 拓也", line: "taku0921", stage: "account", step: 2, joinedDaysAgo: 8, lastActiveHoursAgo: 14, broker: "A社 FX口座", reward: 25000, staff: 2 },
  { name: "加藤 美穂", line: "みほ🌸", stage: "trade", step: 1, joinedDaysAgo: 15, lastActiveHoursAgo: 200, broker: "B社 FX口座", reward: 20000, staff: 1 },
  { name: "渡辺 翔太", line: "shota_w", stage: "account", step: 3, joinedDaysAgo: 9, lastActiveHoursAgo: 26, broker: "A社 FX口座", reward: 25000, staff: 0 },
  { name: "伊藤 さくら", line: "sakura.i", stage: "friend", step: 2, joinedDaysAgo: 2, lastActiveHoursAgo: 20, broker: "C社 証券口座", reward: 15000, staff: 2 },
  { name: "松本 隆", line: "たかし", stage: "done", step: 3, joinedDaysAgo: 28, lastActiveHoursAgo: 70, broker: "A社 FX口座", reward: 30000, staff: 1 },
  { name: "井上 香織", line: "kaori_54", stage: "account", step: 1, joinedDaysAgo: 5, lastActiveHoursAgo: 8, broker: "B社 FX口座", reward: 20000, staff: 0 },
  { name: "木村 悠斗", line: "yuto.k", stage: "trade", step: 3, joinedDaysAgo: 18, lastActiveHoursAgo: 12, broker: "A社 FX口座", reward: 25000, staff: 2 },
  { name: "林 真央", line: "mao🍀", stage: "friend", step: 0, joinedDaysAgo: 0, lastActiveHoursAgo: 1, broker: "C社 証券口座", reward: 15000, staff: 0 },
  { name: "清水 亮介", line: "ryosuke.s", stage: "churn", step: 1, joinedDaysAgo: 20, lastActiveHoursAgo: 260, broker: "B社 FX口座", reward: 20000, staff: 1 },
  { name: "山口 恵理", line: "eri.y", stage: "account", step: 2, joinedDaysAgo: 7, lastActiveHoursAgo: 40, broker: "A社 FX口座", reward: 25000, staff: 2 },
  { name: "森田 直樹", line: "naoki_m", stage: "trade", step: 2, joinedDaysAgo: 16, lastActiveHoursAgo: 6, broker: "A社 FX口座", reward: 30000, staff: 1 },
  { name: "池田 千夏", line: "chinatsu", stage: "friend", step: 1, joinedDaysAgo: 3, lastActiveHoursAgo: 48, broker: "C社 証券口座", reward: 15000, staff: 0 },
  { name: "橋本 蓮", line: "ren.h", stage: "done", step: 3, joinedDaysAgo: 26, lastActiveHoursAgo: 90, broker: "A社 FX口座", reward: 25000, staff: 2 },
  { name: "石井 美咲", line: "misaki.i", stage: "account", step: 1, joinedDaysAgo: 10, lastActiveHoursAgo: 180, broker: "B社 FX口座", reward: 20000, staff: 1 },
  { name: "阿部 洋平", line: "yohei_a", stage: "trade", step: 1, joinedDaysAgo: 14, lastActiveHoursAgo: 22, broker: "A社 FX口座", reward: 25000, staff: 0 },
  { name: "藤田 麻衣", line: "mai.f", stage: "friend", step: 2, joinedDaysAgo: 2, lastActiveHoursAgo: 4, broker: "C社 証券口座", reward: 15000, staff: 2 },
  { name: "岡田 慎", line: "shin_okd", stage: "account", step: 3, joinedDaysAgo: 11, lastActiveHoursAgo: 16, broker: "A社 FX口座", reward: 30000, staff: 1 },
  { name: "後藤 里奈", line: "rina.g", stage: "trade", step: 3, joinedDaysAgo: 19, lastActiveHoursAgo: 150, broker: "B社 FX口座", reward: 20000, staff: 0 },
  { name: "村上 圭吾", line: "keigo.m", stage: "done", step: 3, joinedDaysAgo: 22, lastActiveHoursAgo: 48, broker: "A社 FX口座", reward: 25000, staff: 2 },
  { name: "近藤 望", line: "nozomi_k", stage: "account", step: 2, joinedDaysAgo: 6, lastActiveHoursAgo: 10, broker: "B社 FX口座", reward: 20000, staff: 1 },
  { name: "坂本 竜也", line: "tatsuya.s", stage: "friend", step: 1, joinedDaysAgo: 1, lastActiveHoursAgo: 7, broker: "C社 証券口座", reward: 15000, staff: 0 },
  { name: "遠藤 彩花", line: "ayaka.e", stage: "churn", step: 2, joinedDaysAgo: 25, lastActiveHoursAgo: 310, broker: "A社 FX口座", reward: 25000, staff: 2 },
  { name: "青木 大和", line: "yamato_a", stage: "trade", step: 2, joinedDaysAgo: 17, lastActiveHoursAgo: 9, broker: "A社 FX口座", reward: 30000, staff: 1 },
  { name: "福田 明日香", line: "asuka.f", stage: "account", step: 1, joinedDaysAgo: 4, lastActiveHoursAgo: 30, broker: "B社 FX口座", reward: 20000, staff: 0 },
];

function buildMembers(now: Date): Member[] {
  const palette = [
    "oklch(60% 0.14 151)",
    "oklch(60% 0.15 25)",
    "oklch(58% 0.13 265)",
    "oklch(62% 0.14 300)",
    "oklch(64% 0.13 60)",
    "oklch(58% 0.12 200)",
    "oklch(60% 0.14 340)",
  ];
  return MEMBER_DEFS.map((d, i) => ({
    id: `mb_${(i + 1).toString().padStart(3, "0")}`,
    name: d.name,
    lineName: d.line,
    color: palette[i % palette.length],
    stage: d.stage,
    stepIndex: d.step,
    joinedAt: subHours(subDays(now, d.joinedDaysAgo), (i * 3) % 12).toISOString(),
    lastActiveAt: subHours(now, d.lastActiveHoursAgo).toISOString(),
    broker: d.broker,
    reward: d.reward,
    assigneeId: STAFF[d.staff].id,
  }));
}

// ============================================================
//  アクティビティフィード生成(最近の自動配信ログ)
// ============================================================

function buildActivities(now: Date, members: Member[]): Activity[] {
  const pick = (i: number) => members[i % members.length];
  const raw: { minsAgo: number; type: ActivityType; mi: number; text: string }[] = [
    { minsAgo: 4, type: "faq", mi: 4, text: "FAQ自動返信:「取引のやり方が分かりません」に自動回答しました。" },
    { minsAgo: 12, type: "step", mi: 0, text: "取引サポート ステップ2「取引条件の案内」を自動配信しました。" },
    { minsAgo: 27, type: "join", mi: 11, text: "が友だち追加しました。ウェルカムメッセージを自動配信。" },
    { minsAgo: 46, type: "stage", mi: 6, text: "が口座開設サポートを完了し、取引サポートへ進みました。" },
    { minsAgo: 88, type: "faq", mi: 9, text: "FAQ自動返信:「報酬はいつ受け取れますか？」に自動回答しました。" },
    { minsAgo: 140, type: "stall", mi: 1, text: "の更新が5日間ありません。フォロー配信の候補に追加しました。" },
    { minsAgo: 210, type: "step", mi: 13, text: "口座開設サポート ステップ2「本人確認書類の案内」を自動配信しました。" },
    { minsAgo: 320, type: "faq", mi: 3, text: "FAQ自動返信:「口座開設にはどれくらい時間がかかりますか？」に自動回答しました。" },
    { minsAgo: 480, type: "stage", mi: 2, text: "が取引を完了しました。報酬受取の案内を送付。" },
  ];
  return raw.map((r, i) => {
    const m = pick(r.mi);
    return {
      id: `ac_${i}`,
      at: subMinutes(now, r.minsAgo).toISOString(),
      type: r.type,
      memberId: m.id,
      memberName: m.name,
      text: r.text,
    };
  });
}

// ============================================================
//  シード全体
// ============================================================

export function buildSeed(): AppData {
  const now = new Date();
  const members = buildMembers(now);
  return {
    members,
    scenarios: buildScenarios(),
    faqs: buildFaqs(),
    activities: buildActivities(now, members),
    staff: STAFF,
  };
}
