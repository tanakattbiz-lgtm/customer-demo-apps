import { subDays, subHours, subMinutes } from "date-fns";

/* ============================================================
 * 型定義
 * ========================================================== */

export type KBCategory =
  | "料金・プラン"
  | "登録・アカウント"
  | "使い方"
  | "お支払い"
  | "解約・退会"
  | "セキュリティ"
  | "サポート";

export const KB_CATEGORIES: KBCategory[] = [
  "料金・プラン",
  "登録・アカウント",
  "使い方",
  "お支払い",
  "解約・退会",
  "セキュリティ",
  "サポート",
];

/** ナレッジベース記事(RAG の参照元) */
export interface KBArticle {
  id: string;
  category: KBCategory;
  question: string; // 代表的な質問
  keywords: string[]; // 検索ヒット用のキーワード
  answer: string; // AI が引用して回答する本文
  updatedAt: string; // ISO
  published: boolean;
}

export type MsgRole = "user" | "bot" | "agent";

export interface ChatMessage {
  id: string;
  role: MsgRole;
  text: string;
  at: string; // ISO
  sourceIds?: string[]; // 引用したナレッジ記事 id
}

export type SessionStatus = "解決済み" | "未解決" | "有人対応";

export interface Session {
  id: string;
  visitor: string; // 匿名の訪問者ラベル
  channel: "コーポレートサイト" | "サービスLP" | "会員マイページ";
  startedAt: string; // ISO
  status: SessionStatus;
  rating?: 1 | 2 | 3 | 4 | 5; // 満足度(解決時のみ)
  messages: ChatMessage[];
  live?: boolean; // デモ中に生成したセッションかどうか
}

/* ============================================================
 * ナレッジベース(発注元サービスの FAQ を模したダミー)
 *   ※ 発注元名は伏字。サンプルの製品名は一般語。
 * ========================================================== */

const now = new Date();
const iso = (d: Date) => d.toISOString();

export function seedKnowledge(): KBArticle[] {
  const base: Omit<KBArticle, "id" | "updatedAt" | "published">[] = [
    {
      category: "料金・プラン",
      question: "無料プランはありますか？料金体系を教えてください",
      keywords: ["無料", "料金", "価格", "いくら", "プラン", "費用", "値段", "フリー"],
      answer:
        "3つの料金プランをご用意しています。\n・フリー:¥0/月(基本機能・1ユーザー)\n・スタンダード:¥1,480/月(全機能・5ユーザーまで)\n・ビジネス:¥4,800/月(無制限ユーザー・優先サポート)\n個人のお試しには無料のフリープランがおすすめです。いつでもアップグレードできます。",
    },
    {
      category: "料金・プラン",
      question: "年払いにすると割引はありますか？",
      keywords: ["年払い", "年額", "割引", "まとめ払い", "お得", "年間"],
      answer:
        "年払いをお選びいただくと、月払いに比べて2ヶ月分お得になります(実質16%オフ)。お支払い画面でお支払い周期を「年払い」に切り替えるだけで適用されます。",
    },
    {
      category: "登録・アカウント",
      question: "アカウントの登録方法を教えてください",
      keywords: ["登録", "アカウント", "サインアップ", "始め方", "新規", "会員登録", "作成"],
      answer:
        "トップページ右上の「無料ではじめる」から、メールアドレスとパスワードを入力するだけで登録できます。登録直後からフリープランの全機能をご利用いただけます。クレジットカードの登録は不要です。",
    },
    {
      category: "登録・アカウント",
      question: "パスワードを忘れてしまいました",
      keywords: ["パスワード", "忘れ", "ログインできない", "リセット", "再設定", "入れない"],
      answer:
        "ログイン画面の「パスワードをお忘れの方」からご登録のメールアドレスを入力してください。再設定用のリンクをお送りします。リンクの有効期限は60分です。メールが届かない場合は迷惑メールフォルダもご確認ください。",
    },
    {
      category: "使い方",
      question: "データをCSVでエクスポートできますか？",
      keywords: ["csv", "エクスポート", "書き出し", "ダウンロード", "出力", "データ"],
      answer:
        "はい、可能です。各一覧画面の右上「…」メニューから「CSVエクスポート」を選択すると、表示中のデータをCSV形式でダウンロードできます。スタンダードプラン以上ではExcel形式にも対応しています。",
    },
    {
      category: "使い方",
      question: "スマートフォンからも使えますか？",
      keywords: ["スマホ", "スマートフォン", "モバイル", "アプリ", "iphone", "android", "携帯"],
      answer:
        "ブラウザからそのままスマートフォンでご利用いただけます。画面はモバイル表示に最適化されています。iOS / Android 向けの専用アプリも各ストアで配信しています。",
    },
    {
      category: "使い方",
      question: "チームメンバーを招待するには？",
      keywords: ["招待", "メンバー", "チーム", "追加", "共有", "ユーザー"],
      answer:
        "設定 > メンバー管理 > 「メンバーを招待」から、招待したい方のメールアドレスを入力してください。招待メールが届き、相手が承認するとチームに参加できます。権限は管理者/編集者/閲覧者から選べます。",
    },
    {
      category: "お支払い",
      question: "どんな支払い方法に対応していますか？",
      keywords: ["支払い", "決済", "クレジット", "カード", "銀行", "振込", "請求書", "コンビニ"],
      answer:
        "主要なクレジットカード(VISA / Mastercard / JCB / AMEX)に対応しています。ビジネスプランでは銀行振込・請求書払いも承っております。お支払い方法は設定画面からいつでも変更できます。",
    },
    {
      category: "お支払い",
      question: "領収書は発行できますか？",
      keywords: ["領収書", "請求書", "インボイス", "経費", "適格", "発行"],
      answer:
        "お支払い履歴の各明細から、いつでもPDFの領収書をダウンロードいただけます。適格請求書(インボイス)にも対応しており、登録番号を記載した領収書を発行できます。",
    },
    {
      category: "解約・退会",
      question: "解約したい場合はどうすればいいですか？",
      keywords: ["解約", "退会", "キャンセル", "やめる", "停止", "契約終了"],
      answer:
        "設定 > プラン > 「プランを解約する」からお手続きいただけます。解約後も、契約期間の満了日まではご利用いただけます。日割りでの返金は行っておりませんのでご了承ください。データは解約後30日間保管されます。",
    },
    {
      category: "解約・退会",
      question: "解約するとデータは消えてしまいますか？",
      keywords: ["データ", "消える", "削除", "残る", "解約後", "バックアップ"],
      answer:
        "解約後もデータは30日間保管されます。この間に再開いただければデータはそのままご利用いただけます。完全に削除をご希望の場合は、退会手続きをお願いします。事前にCSVエクスポートでのバックアップをおすすめします。",
    },
    {
      category: "セキュリティ",
      question: "二段階認証には対応していますか？",
      keywords: ["二段階", "2段階", "認証", "セキュリティ", "mfa", "2fa", "ワンタイム"],
      answer:
        "はい、対応しています。設定 > セキュリティ から二段階認証(認証アプリ / SMS)を有効化できます。ビジネスプランではSAMLによるシングルサインオン(SSO)にも対応しています。",
    },
    {
      category: "セキュリティ",
      question: "データはどこに保管されていますか？安全ですか？",
      keywords: ["データ", "保管", "安全", "暗号化", "サーバー", "情報漏洩", "プライバシー"],
      answer:
        "お客様のデータは国内のデータセンターに保管し、通信・保存ともに暗号化しています。定期的な脆弱性診断とバックアップを実施しており、第三者機関によるセキュリティ認証も取得しています。",
    },
    {
      category: "サポート",
      question: "サポートの問い合わせ時間を教えてください",
      keywords: ["サポート", "問い合わせ", "時間", "営業時間", "対応時間", "受付", "土日"],
      answer:
        "サポート受付は平日10:00〜18:00です(土日祝を除く)。この時間外のお問い合わせには、翌営業日に順次ご返信します。ビジネスプランのお客様は優先対応の窓口をご利用いただけます。",
    },
    {
      category: "サポート",
      question: "導入前に相談したいのですが、オンライン打ち合わせは可能ですか？",
      keywords: ["導入", "相談", "打ち合わせ", "デモ", "説明", "検討", "商談"],
      answer:
        "はい、導入をご検討中のお客様向けに、オンラインでのご説明を承っています。マイページの「導入相談」から、ご希望の日程をお知らせください。担当者より折り返しご案内いたします。",
    },
  ];

  return base.map((b, i) => ({
    ...b,
    id: `kb_${String(i + 1).padStart(2, "0")}`,
    updatedAt: iso(subDays(now, [2, 5, 9, 1, 14, 6, 20, 3, 11, 8, 30, 4, 17, 22, 7][i] ?? i)),
    published: i !== 14, // 1件だけ下書き(非公開)にして状態を出し分ける
  }));
}

/* ============================================================
 * 会話ログ(過去のセッション)
 * ========================================================== */

let seq = 1000;
const msgId = () => `m_${seq++}`;

function s(
  visitor: string,
  channel: Session["channel"],
  startedAt: string,
  status: SessionStatus,
  messages: ChatMessage[],
  rating?: Session["rating"],
): Session {
  return {
    id: `sess_${seq++}`,
    visitor,
    channel,
    startedAt,
    status,
    rating,
    messages,
  };
}

export function seedSessions(): Session[] {
  const list: Session[] = [
    s(
      "訪問者 #A2F9",
      "サービスLP",
      iso(subMinutes(now, 22)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "無料で使えますか？", at: iso(subMinutes(now, 22)) },
        {
          id: msgId(),
          role: "bot",
          text: "はい、無料のフリープランをご用意しています。基本機能を1ユーザーでずっと無料でお使いいただけます。",
          at: iso(subMinutes(now, 22)),
          sourceIds: ["kb_01"],
        },
        { id: msgId(), role: "user", text: "ありがとう、登録してみます", at: iso(subMinutes(now, 21)) },
      ],
      5,
    ),
    s(
      "訪問者 #7C4B",
      "コーポレートサイト",
      iso(subHours(now, 2)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "支払いはクレカ以外もいけますか", at: iso(subHours(now, 2)) },
        {
          id: msgId(),
          role: "bot",
          text: "主要クレジットカードに加え、ビジネスプランでは銀行振込・請求書払いにも対応しています。",
          at: iso(subHours(now, 2)),
          sourceIds: ["kb_08"],
        },
      ],
      4,
    ),
    s(
      "訪問者 #E1D0",
      "会員マイページ",
      iso(subHours(now, 5)),
      "有人対応",
      [
        { id: msgId(), role: "user", text: "請求金額が想定と違うのですが", at: iso(subHours(now, 5)) },
        {
          id: msgId(),
          role: "bot",
          text: "ご不便をおかけしております。個別のご請求内容については担当者が確認いたします。オペレーターにおつなぎしますね。",
          at: iso(subHours(now, 5)),
        },
        {
          id: msgId(),
          role: "agent",
          text: "サポート担当の田村です。ご請求の明細を確認いたしました。追加ユーザー分が反映されておりました。詳細をマイページにお送りします。",
          at: iso(subHours(now, 4)),
        },
      ],
    ),
    s(
      "訪問者 #B933",
      "サービスLP",
      iso(subHours(now, 8)),
      "未解決",
      [
        { id: msgId(), role: "user", text: "他社ツールからデータ移行できますか？", at: iso(subHours(now, 8)) },
        {
          id: msgId(),
          role: "bot",
          text: "申し訳ありません、その内容については確かな回答をご用意できませんでした。よろしければ担当者におつなぎします。",
          at: iso(subHours(now, 8)),
        },
      ],
    ),
    s(
      "訪問者 #55AE",
      "コーポレートサイト",
      iso(subHours(now, 20)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "二段階認証は使えますか", at: iso(subHours(now, 20)) },
        {
          id: msgId(),
          role: "bot",
          text: "はい、設定 > セキュリティ から二段階認証を有効化できます。ビジネスプランではSSOにも対応しています。",
          at: iso(subHours(now, 20)),
          sourceIds: ["kb_12"],
        },
      ],
      5,
    ),
    s(
      "訪問者 #0F62",
      "会員マイページ",
      iso(subDays(now, 1)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "領収書ってもらえますか", at: iso(subDays(now, 1)) },
        {
          id: msgId(),
          role: "bot",
          text: "お支払い履歴からPDFの領収書をいつでもダウンロードできます。インボイスにも対応しています。",
          at: iso(subDays(now, 1)),
          sourceIds: ["kb_09"],
        },
      ],
      4,
    ),
    s(
      "訪問者 #A780",
      "サービスLP",
      iso(subDays(now, 1)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "スマホアプリありますか？", at: iso(subDays(now, 1)) },
        {
          id: msgId(),
          role: "bot",
          text: "ブラウザからそのままスマホでもお使いいただけます。iOS / Android 向けの専用アプリもございます。",
          at: iso(subDays(now, 1)),
          sourceIds: ["kb_06"],
        },
      ],
      5,
    ),
    s(
      "訪問者 #3C11",
      "会員マイページ",
      iso(subDays(now, 2)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "解約したらデータ消えますか", at: iso(subDays(now, 2)) },
        {
          id: msgId(),
          role: "bot",
          text: "解約後もデータは30日間保管されます。再開すればそのままお使いいただけます。バックアップにはCSVエクスポートもご利用ください。",
          at: iso(subDays(now, 2)),
          sourceIds: ["kb_11", "kb_05"],
        },
      ],
      4,
    ),
    s(
      "訪問者 #9E2A",
      "コーポレートサイト",
      iso(subDays(now, 2)),
      "未解決",
      [
        { id: msgId(), role: "user", text: "APIの利用制限はどれくらい？", at: iso(subDays(now, 2)) },
        {
          id: msgId(),
          role: "bot",
          text: "申し訳ありません、その内容については確かな回答をご用意できませんでした。担当者へおつなぎすることもできます。",
          at: iso(subDays(now, 2)),
        },
      ],
    ),
    s(
      "訪問者 #6D48",
      "サービスLP",
      iso(subDays(now, 3)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "年払いって安くなる？", at: iso(subDays(now, 3)) },
        {
          id: msgId(),
          role: "bot",
          text: "年払いにすると月払いより2ヶ月分お得(実質16%オフ)になります。お支払い画面から切り替えられます。",
          at: iso(subDays(now, 3)),
          sourceIds: ["kb_02"],
        },
      ],
      5,
    ),
    s(
      "訪問者 #C007",
      "会員マイページ",
      iso(subDays(now, 4)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "メンバー招待の方法", at: iso(subDays(now, 4)) },
        {
          id: msgId(),
          role: "bot",
          text: "設定 > メンバー管理 > 「メンバーを招待」からメールアドレスを入力してください。権限も選べます。",
          at: iso(subDays(now, 4)),
          sourceIds: ["kb_07"],
        },
      ],
      4,
    ),
    s(
      "訪問者 #F5B2",
      "サービスLP",
      iso(subDays(now, 5)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "CSVで出力できますか", at: iso(subDays(now, 5)) },
        {
          id: msgId(),
          role: "bot",
          text: "各一覧の「…」メニューからCSVエクスポートが可能です。スタンダード以上ではExcelにも対応します。",
          at: iso(subDays(now, 5)),
          sourceIds: ["kb_05"],
        },
      ],
      5,
    ),
    s(
      "訪問者 #71E0",
      "コーポレートサイト",
      iso(subDays(now, 6)),
      "有人対応",
      [
        { id: msgId(), role: "user", text: "導入前に一度相談したい", at: iso(subDays(now, 6)) },
        {
          id: msgId(),
          role: "bot",
          text: "導入をご検討中のお客様向けにオンラインでのご説明を承っています。担当者におつなぎします。",
          at: iso(subDays(now, 6)),
          sourceIds: ["kb_15"],
        },
        {
          id: msgId(),
          role: "agent",
          text: "導入相談担当の佐々木です。ご検討ありがとうございます。ご希望の日程をお知らせいただけますか。",
          at: iso(subDays(now, 6)),
        },
      ],
    ),
    s(
      "訪問者 #2AB4",
      "会員マイページ",
      iso(subDays(now, 6)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "パスワード忘れました", at: iso(subDays(now, 6)) },
        {
          id: msgId(),
          role: "bot",
          text: "ログイン画面の「パスワードをお忘れの方」から再設定用リンクをお送りします。有効期限は60分です。",
          at: iso(subDays(now, 6)),
          sourceIds: ["kb_04"],
        },
      ],
      5,
    ),
    s(
      "訪問者 #8801",
      "サービスLP",
      iso(subDays(now, 7)),
      "解決済み",
      [
        { id: msgId(), role: "user", text: "サポートは土日もやってますか", at: iso(subDays(now, 7)) },
        {
          id: msgId(),
          role: "bot",
          text: "サポート受付は平日10:00〜18:00です(土日祝を除く)。時間外は翌営業日に順次ご返信します。",
          at: iso(subDays(now, 7)),
          sourceIds: ["kb_14"],
        },
        { id: msgId(), role: "user", text: "了解です", at: iso(subDays(now, 7)) },
      ],
      3,
    ),
  ];
  return list;
}

/* ============================================================
 * デイリー件数の集計用シード(ダッシュボードのグラフ)
 * ========================================================== */

export interface DailyStat {
  date: string; // "M/d"
  total: number;
  resolved: number;
}

export function seedDaily(): DailyStat[] {
  const pattern = [
    [38, 31],
    [42, 34],
    [29, 22],
    [51, 43],
    [47, 38],
    [58, 49],
    [44, 37],
    [39, 33],
    [62, 53],
    [55, 47],
    [48, 41],
    [43, 36],
    [67, 58],
    [59, 51],
  ];
  return pattern.map(([total, resolved], i) => {
    const d = subDays(now, pattern.length - 1 - i);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      total,
      resolved,
    };
  });
}
