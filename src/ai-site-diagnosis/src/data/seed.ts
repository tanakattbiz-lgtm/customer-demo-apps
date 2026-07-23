// 診断で使うマスタデータ（診断項目の定義・所見テンプレート・改善提案テンプレート）。
// すべて自作のダミー。実在の企業・個人・サービスは登場しない。

export type CategoryKey =
  | "design"
  | "seo"
  | "speed"
  | "update"
  | "traffic"
  | "trust";

export interface CategoryMeta {
  key: CategoryKey;
  /** レーダーチャート等で使う短い見出し */
  short: string;
  /** 正式名 */
  label: string;
  /** 一言説明 */
  desc: string;
  /** 総合スコアへの重み */
  weight: number;
  /** スコアが高いときの所見 */
  strong: string[];
  /** スコアが低いときの所見 */
  weak: string[];
  /** 改善提案（弱いカテゴリで提示する） */
  actions: ActionTemplate[];
}

export interface ActionTemplate {
  title: string;
  detail: string;
  /** 見込みスコア改善幅（点） */
  impact: number;
  effort: "小" | "中" | "大";
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "design",
    short: "デザイン",
    label: "デザイン / UI",
    desc: "第一印象と操作のしやすさ",
    weight: 1.2,
    strong: [
      "ファーストビューで何のサイトか一目で伝わる構成になっています",
      "余白とタイポグラフィの階層が整い、視線誘導が自然です",
      "配色に統一感があり、ブランドの世界観が伝わります",
    ],
    weak: [
      "ファーストビューの情報量が多く、視線が迷いやすい状態です",
      "見出しと本文のコントラストが弱く、階層が読み取りにくいです",
      "ボタンの見た目が本文に埋もれ、クリック箇所が分かりにくいです",
    ],
    actions: [
      {
        title: "ファーストビューを1メッセージに絞る",
        detail:
          "広告から流入した瞬間に「誰の・何の・どんな得か」が伝わるよう、キャッチコピー＋1CTAへ整理します。",
        impact: 8,
        effort: "中",
      },
      {
        title: "CTAボタンのコントラストを強化",
        detail:
          "アクセントカラーを主要ボタンに限定し、周囲に余白を確保してタップ率を引き上げます。",
        impact: 5,
        effort: "小",
      },
    ],
  },
  {
    key: "seo",
    short: "SEO",
    label: "SEO対策",
    desc: "検索エンジンからの見つけやすさ",
    weight: 1.0,
    strong: [
      "タイトルタグと見出し構造が適切に設定されています",
      "主要ページにメタディスクリプションが設定されています",
      "画像のalt属性が概ね設定されています",
    ],
    weak: [
      "titleタグが全ページ共通で、ページごとの最適化がされていません",
      "h1が複数存在し、検索エンジンが主題を判断しづらい状態です",
      "構造化データ（schema.org）が未設定です",
    ],
    actions: [
      {
        title: "ページ単位でtitle / descriptionを最適化",
        detail:
          "検索意図に沿ったキーワードをtitleへ反映し、クリック率の高い説明文を各ページに設定します。",
        impact: 7,
        effort: "中",
      },
      {
        title: "構造化データ（FAQ・サービス）を追加",
        detail:
          "schema.orgのマークアップで検索結果のリッチリザルト表示を狙い、露出を増やします。",
        impact: 4,
        effort: "中",
      },
    ],
  },
  {
    key: "speed",
    short: "表示速度",
    label: "表示速度",
    desc: "ページの読み込み体験",
    weight: 1.1,
    strong: [
      "初回表示（LCP）が2.5秒以内に収まっています",
      "画像が次世代フォーマットで軽量化されています",
      "レイアウトのガタつき（CLS）が抑えられています",
    ],
    weak: [
      "ファーストビューの画像が重く、初回表示に3秒以上かかっています",
      "未使用のJavaScriptが読み込まれ、描画をブロックしています",
      "画像の遅延読み込み（lazy load）が未設定です",
    ],
    actions: [
      {
        title: "ヒーロー画像をWebP化＋圧縮",
        detail:
          "最も重い画像を次世代フォーマットへ変換し、離脱の起きやすい初回表示を高速化します。",
        impact: 6,
        effort: "小",
      },
      {
        title: "描画をブロックするスクリプトを遅延読み込み",
        detail:
          "計測・チャット等のタグをdefer/遅延化し、コンテンツの表示を優先させます。",
        impact: 5,
        effort: "中",
      },
    ],
  },
  {
    key: "update",
    short: "更新頻度",
    label: "更新頻度",
    desc: "コンテンツの鮮度",
    weight: 0.9,
    strong: [
      "ブログ・お知らせが直近1か月以内に更新されています",
      "更新の頻度が安定しており、運用が続いている印象を与えます",
      "季節・キャンペーンに応じた情報更新が見られます",
    ],
    weak: [
      "最終更新が半年以上前で、稼働中か不安を与える状態です",
      "お知らせ欄が初期状態のまま放置されています",
      "実績・事例の追加が止まっており、鮮度が伝わりません",
    ],
    actions: [
      {
        title: "更新代行で「動いているサイト」を演出",
        detail:
          "月数本のブログ・実績更新を仕組み化し、訪問者と検索エンジンの双方に鮮度を伝えます。",
        impact: 5,
        effort: "中",
      },
    ],
  },
  {
    key: "traffic",
    short: "集客力",
    label: "集客力・導線",
    desc: "流入から問い合わせまでの導線",
    weight: 1.1,
    strong: [
      "問い合わせ・予約への導線が各ページから確保されています",
      "広告の受け皿となるLP構成が意識されています",
      "スマホでのCTA固定表示など、離脱防止の工夫があります",
    ],
    weak: [
      "問い合わせ導線がヘッダーの1か所のみで、機会損失が起きています",
      "広告の訴求とサイト内の文言が噛み合っていません",
      "スマホでCTAが下部に埋もれ、押されにくい状態です",
    ],
    actions: [
      {
        title: "スマホCTAを追従表示に",
        detail:
          "画面下部に「無料相談」ボタンを常時固定し、どのスクロール位置でも行動できるようにします。",
        impact: 7,
        effort: "小",
      },
      {
        title: "広告文とLPのメッセージを一致させる",
        detail:
          "広告のキーワードとファーストビューの文言を揃え、期待とのズレによる直帰を減らします。",
        impact: 6,
        effort: "中",
      },
    ],
  },
  {
    key: "trust",
    short: "信頼性",
    label: "信頼性",
    desc: "安心して問い合わせできるか",
    weight: 1.0,
    strong: [
      "運営者情報・実績・お客様の声が整い、安心感があります",
      "SSL化されており、フォームの安全性が担保されています",
      "料金や流れが明示され、問い合わせの不安が少ない構成です",
    ],
    weak: [
      "お客様の声・導入実績が乏しく、判断材料が不足しています",
      "料金や対応エリアの記載がなく、問い合わせ前の不安が残ります",
      "運営者情報が見つけにくく、信頼の裏付けが弱い状態です",
    ],
    actions: [
      {
        title: "実績・お客様の声セクションを追加",
        detail:
          "数値実績と具体的な声を掲載し、初回訪問者の「本当に大丈夫か」の不安を解消します。",
        impact: 6,
        effort: "中",
      },
    ],
  },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => ((acc[c.key] = c), acc),
  {} as Record<CategoryKey, CategoryMeta>,
);

/** ワンクリックで試せるサンプルサイト（すべて自作のダミー） */
export const SAMPLE_SITES: { url: string; label: string }[] = [
  { url: "https://sample-clinic.example.jp", label: "歯科クリニック" },
  { url: "https://machino-cafe.example.com", label: "街のカフェ" },
  { url: "https://smart-reform.example.jp", label: "リフォーム会社" },
  { url: "https://yoga-studio-lumo.example.com", label: "ヨガスタジオ" },
];

/** 解析中の演出で表示するステップ */
export const SCAN_STEPS: string[] = [
  "サイトへ接続しHTMLを取得中",
  "デザイン・レイアウトを解析中",
  "SEO・メタ情報をチェック中",
  "表示速度を計測中",
  "更新状況・集客導線を確認中",
  "AIが総合スコアを算出中",
];
