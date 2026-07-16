import { subDays, subHours, subMinutes } from "date-fns";

// ============================================================
//  型定義
// ============================================================

export type Channel = "メール" | "Webフォーム" | "チャット" | "電話メモ";
export type Category =
  | "見積もり依頼"
  | "サービスの質問"
  | "予約・日程"
  | "要望・クレーム"
  | "手続き・書類"
  | "その他";
export type Priority = "高" | "中" | "低";
export type Sentiment = "好意的" | "ふつう" | "要注意";
export type Status = "未対応" | "対応中" | "返信済み";

/** AI が自動抽出した「相談内容の要点」 */
export interface ExtractedField {
  label: string;
  value: string;
}

export interface Inquiry {
  id: string;
  code: string; // 問い合わせ番号
  customerName: string;
  company: string; // 空文字なら個人
  channel: Channel;
  receivedAt: string; // ISO
  subject: string;
  body: string; // お客様からの原文

  // --- AI 自動整理の結果(organized=false のときは未算出)---
  organized: boolean;
  category?: Category;
  summary?: string;
  priority?: Priority;
  sentiment?: Sentiment;
  fields?: ExtractedField[];

  // --- 対応状況 ---
  status: Status;
  assigneeId?: string;
  draft?: string; // 返信下書き
  repliedAt?: string;
}

export interface Template {
  id: string;
  title: string;
  kind: "返信定型文" | "資料テンプレート";
  category: Category | "共通";
  body: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface AppData {
  inquiries: Inquiry[];
  templates: Template[];
  staff: Staff[];
}

export const CURRENT_USER_ID = "u1";

// ============================================================
//  担当者(サンプル)
// ============================================================
const STAFF: Staff[] = [
  { id: "u1", name: "橋本 千尋", role: "管理者 / 一次対応", color: "oklch(53% 0.19 275)" },
  { id: "u2", name: "森田 蒼", role: "スタッフ", color: "oklch(58% 0.14 200)" },
  { id: "u3", name: "小林 果歩", role: "スタッフ", color: "oklch(60% 0.15 150)" },
];

// ============================================================
//  定型文・資料テンプレート
// ============================================================
const TEMPLATES: Template[] = [
  {
    id: "t1",
    title: "お問い合わせ受付のご連絡",
    kind: "返信定型文",
    category: "共通",
    body:
      "{{お客様名}} 様\n\nお問い合わせいただきありがとうございます。\n内容を確認のうえ、担当より{{目安}}にあらためてご連絡いたします。\n今しばらくお待ちくださいますようお願いいたします。",
  },
  {
    id: "t2",
    title: "お見積りのご案内",
    kind: "返信定型文",
    category: "見積もり依頼",
    body:
      "{{お客様名}} 様\n\nお見積りのご依頼ありがとうございます。\nいただいた内容をもとに、概算を以下のとおりご案内いたします。\n\n・内容：{{依頼内容}}\n・概算金額：{{金額}}(税込)\n・納期の目安：{{納期}}\n\n正式なお見積書は別途お送りいたします。ご不明点はお気軽にお知らせください。",
  },
  {
    id: "t3",
    title: "料金・サービスのご質問への回答",
    kind: "返信定型文",
    category: "サービスの質問",
    body:
      "{{お客様名}} 様\n\nお問い合わせありがとうございます。\nご質問の {{項目}} につきまして、以下のとおりご案内いたします。\n\n{{回答本文}}\n\nそのほかご不明な点がございましたら、遠慮なくお知らせください。",
  },
  {
    id: "t4",
    title: "日程調整のご相談",
    kind: "返信定型文",
    category: "予約・日程",
    body:
      "{{お客様名}} 様\n\nご連絡ありがとうございます。\nご希望の日程を承りました。以下の候補でご都合はいかがでしょうか。\n\n・第1候補：{{候補1}}\n・第2候補：{{候補2}}\n\nご都合のよい日時をお知らせいただけますと幸いです。",
  },
  {
    id: "t5",
    title: "ご要望・お詫びのご返信",
    kind: "返信定型文",
    category: "要望・クレーム",
    body:
      "{{お客様名}} 様\n\nこのたびはご不便をおかけし、誠に申し訳ございません。\nいただいたご指摘は真摯に受け止め、{{対応内容}}にて対応させていただきます。\n貴重なご意見をありがとうございました。今後の改善に努めてまいります。",
  },
  {
    id: "t6",
    title: "会社案内(自己紹介文)",
    kind: "資料テンプレート",
    category: "共通",
    body:
      "【会社案内】\n私たちは地域に根ざした小さな会社として、{{事業内容}}を行っております。\n少人数だからこそ、一件一件を丁寧に、お客様に寄り添った対応を心がけています。\nお困りごとがございましたら、まずはお気軽にご相談ください。",
  },
  {
    id: "t7",
    title: "サービス説明シート(概要)",
    kind: "資料テンプレート",
    category: "サービスの質問",
    body:
      "【サービス概要】\n■ できること：{{提供内容}}\n■ 料金の目安：{{料金}}\n■ 進め方：ご相談 → お見積り → ご契約 → 実施 → アフターフォロー\n■ よくあるご質問：別紙 FAQ をご参照ください。",
  },
  {
    id: "t8",
    title: "お見積書ひな形",
    kind: "資料テンプレート",
    category: "見積もり依頼",
    body:
      "【御見積書】\n宛先：{{お客様名}} 様\n件名：{{件名}}\n\n No. / 品目 / 数量 / 単価 / 金額\n 1  / {{品目}} / {{数量}} / {{単価}} / {{金額}}\n\n小計：{{小計}}\n消費税：{{税}}\n合計：{{合計}}\n\n有効期限：発行日より30日",
  },
];

// ============================================================
//  問い合わせ(サンプル 24 件)
//  ※ AI 整理済みの現実的なダミー。個人情報(メール/電話)は含めない。
// ============================================================

type RawInquiry = Omit<Inquiry, "id" | "code" | "receivedAt"> & {
  hoursAgo: number; // 受信からの経過時間
};

const RAW: RawInquiry[] = [
  {
    customerName: "斉藤 亮介",
    company: "斉藤工務店",
    channel: "Webフォーム",
    subject: "店舗改装の見積もりについて",
    body:
      "はじめまして。店舗の内装を一部リニューアルしたいと考えています。広さは約20坪で、床の張り替えと照明の交換を検討中です。来月中には終わらせたいのですが、概算でどのくらいかかるか教えていただけますか。",
    organized: true,
    category: "見積もり依頼",
    summary: "20坪店舗の床張替え・照明交換の概算見積り依頼。来月中の完了希望。",
    priority: "高",
    sentiment: "ふつう",
    fields: [
      { label: "依頼内容", value: "床の張り替え・照明交換" },
      { label: "規模", value: "約20坪" },
      { label: "希望納期", value: "来月中" },
      { label: "予算感", value: "記載なし(要確認)" },
    ],
    status: "未対応",
    hoursAgo: 2,
  },
  {
    customerName: "町田 由紀",
    company: "",
    channel: "メール",
    subject: "料金プランの違いを知りたい",
    body:
      "ホームページを拝見しました。ライトプランとスタンダードプランの違いがいまいち分からず…。個人でも申し込めますか?また、途中でプラン変更はできるのでしょうか。",
    organized: true,
    category: "サービスの質問",
    summary: "ライト/スタンダードの違い・個人申込可否・プラン変更可否の質問。",
    priority: "中",
    sentiment: "好意的",
    fields: [
      { label: "質問項目", value: "プランの違い / 個人申込 / 変更可否" },
      { label: "対象プラン", value: "ライト・スタンダード" },
    ],
    status: "未対応",
    hoursAgo: 5,
  },
  {
    customerName: "Grace Thompson",
    company: "Northgate Trading",
    channel: "メール",
    subject: "Inquiry about bulk order",
    body:
      "Hello, we are interested in placing a bulk order of around 300 units. Could you let us know the estimated lead time and whether volume discounts are available? Thank you.",
    organized: true,
    category: "見積もり依頼",
    summary: "300個のまとめ買い。納期の目安と数量割引の有無を確認したい(英語)。",
    priority: "高",
    sentiment: "好意的",
    fields: [
      { label: "数量", value: "約300個" },
      { label: "確認事項", value: "納期 / 数量割引" },
      { label: "言語", value: "英語(要翻訳対応)" },
    ],
    status: "未対応",
    hoursAgo: 8,
  },
  {
    customerName: "野口 健太",
    company: "のぐち商店",
    channel: "電話メモ",
    subject: "納品が遅れている件",
    body:
      "先週お願いした品がまだ届いていないとのお電話。今週末のイベントで使う予定なので、いつ届くのか至急知りたいとのこと。少し急いでいるご様子でした。",
    organized: true,
    category: "要望・クレーム",
    summary: "先週注文分が未着。今週末のイベント使用のため、到着予定を至急確認したい。",
    priority: "高",
    sentiment: "要注意",
    fields: [
      { label: "状況", value: "注文品が未着" },
      { label: "期限", value: "今週末のイベント" },
      { label: "温度感", value: "急ぎ・要フォロー" },
    ],
    status: "対応中",
    assigneeId: "u2",
    hoursAgo: 20,
  },
  {
    customerName: "藤井 みなみ",
    company: "",
    channel: "Webフォーム",
    subject: "打ち合わせの日程を決めたい",
    body:
      "先日はありがとうございました。次回の打ち合わせですが、来週の火曜か水曜の午後で調整できますでしょうか。オンラインでも対面でもどちらでも大丈夫です。",
    organized: true,
    category: "予約・日程",
    summary: "次回打ち合わせを来週火・水の午後で調整希望。オンライン/対面どちらも可。",
    priority: "中",
    sentiment: "好意的",
    fields: [
      { label: "希望日", value: "来週 火曜または水曜 午後" },
      { label: "形式", value: "オンライン / 対面どちらも可" },
    ],
    status: "未対応",
    hoursAgo: 26,
  },
  {
    customerName: "大槻 誠",
    company: "大槻自動車",
    channel: "メール",
    subject: "請求書の宛名変更のお願い",
    body:
      "いつもお世話になっております。先月分の請求書ですが、宛名を「大槻自動車株式会社」に変更して再発行いただくことは可能でしょうか。お手数をおかけしますがよろしくお願いします。",
    organized: true,
    category: "手続き・書類",
    summary: "先月分請求書の宛名を「大槻自動車株式会社」に変更し再発行してほしい。",
    priority: "中",
    sentiment: "好意的",
    fields: [
      { label: "依頼内容", value: "請求書の宛名変更・再発行" },
      { label: "変更後宛名", value: "大槻自動車株式会社" },
      { label: "対象", value: "先月分" },
    ],
    status: "対応中",
    assigneeId: "u1",
    hoursAgo: 30,
  },
  {
    customerName: "西村 彩",
    company: "にしむらデザイン室",
    channel: "チャット",
    subject: "対応エリアについて",
    body:
      "はじめまして。隣の市なのですが、対応エリア外でしょうか?出張費など追加でかかるものがあれば教えてください。",
    organized: true,
    category: "サービスの質問",
    summary: "隣接市が対応エリア内か、出張費など追加費用の有無を確認したい。",
    priority: "低",
    sentiment: "ふつう",
    fields: [
      { label: "質問項目", value: "対応エリア / 出張費" },
      { label: "所在", value: "隣接市" },
    ],
    status: "未対応",
    hoursAgo: 34,
  },
  {
    customerName: "堀田 和幸",
    company: "堀田製作所",
    channel: "メール",
    subject: "定期メンテナンスの相談",
    body:
      "現在お願いしている設備について、定期的な点検もお願いできればと考えています。頻度や費用の目安、契約の形などがあれば教えていただけますか。",
    organized: true,
    category: "サービスの質問",
    summary: "既存設備の定期点検を相談。頻度・費用目安・契約形態を知りたい。",
    priority: "中",
    sentiment: "好意的",
    fields: [
      { label: "相談内容", value: "定期メンテナンス契約" },
      { label: "確認事項", value: "頻度 / 費用 / 契約形態" },
    ],
    status: "未対応",
    hoursAgo: 40,
  },
  {
    customerName: "浅野 里佳",
    company: "",
    channel: "Webフォーム",
    subject: "キャンセルはできますか",
    body:
      "申し込んだ内容をキャンセルしたいのですが、キャンセル料はかかりますか。事情があり急にご連絡することになってしまい申し訳ありません。",
    organized: true,
    category: "手続き・書類",
    summary: "申込済み内容のキャンセル可否とキャンセル料の有無を確認したい。",
    priority: "中",
    sentiment: "要注意",
    fields: [
      { label: "依頼内容", value: "申込のキャンセル" },
      { label: "確認事項", value: "キャンセル料の有無" },
    ],
    status: "未対応",
    hoursAgo: 46,
  },
  {
    customerName: "田端 修二",
    company: "田端建材",
    channel: "電話メモ",
    subject: "追加発注の相談",
    body:
      "前回と同じ商品を追加で50個ほしいとのこと。前回と同じ単価でいけるか、在庫はあるか確認してほしいとのご依頼。",
    organized: true,
    category: "見積もり依頼",
    summary: "前回同一商品を50個追加。同単価の可否と在庫を確認したい。",
    priority: "中",
    sentiment: "好意的",
    fields: [
      { label: "依頼内容", value: "同一商品の追加発注" },
      { label: "数量", value: "50個" },
      { label: "確認事項", value: "単価据置の可否 / 在庫" },
    ],
    status: "返信済み",
    assigneeId: "u1",
    draft:
      "田端 修二 様\n\nお問い合わせありがとうございます。前回と同じ商品を50個、同単価にて承ることが可能です。在庫も確保できておりますので、最短で今週中に発送できます。正式なご注文をお待ちしております。",
    hoursAgo: 54,
  },
  {
    customerName: "久保田 直美",
    company: "",
    channel: "チャット",
    subject: "支払い方法について",
    body:
      "支払いは銀行振込のほかに対応している方法はありますか。分割での相談も可能でしょうか。",
    organized: true,
    category: "サービスの質問",
    summary: "利用可能な支払い方法と分割対応の可否を確認したい。",
    priority: "低",
    sentiment: "ふつう",
    fields: [
      { label: "質問項目", value: "支払い方法 / 分割可否" },
    ],
    status: "未対応",
    hoursAgo: 60,
  },
  {
    customerName: "三宅 亮",
    company: "みやけ商事",
    channel: "メール",
    subject: "資料を送ってほしい",
    body:
      "先日お問い合わせした者です。サービスの概要が分かる資料があれば、社内で共有したいので送っていただけますか。よろしくお願いします。",
    organized: true,
    category: "手続き・書類",
    summary: "社内共有用に、サービス概要資料の送付を希望。",
    priority: "低",
    sentiment: "好意的",
    fields: [
      { label: "依頼内容", value: "サービス概要資料の送付" },
      { label: "用途", value: "社内共有" },
    ],
    status: "未対応",
    hoursAgo: 68,
  },
  {
    customerName: "長谷川 恵子",
    company: "はせがわ保育園",
    channel: "Webフォーム",
    subject: "見学の予約をしたい",
    body:
      "サービスの導入を検討しており、一度見学や説明を受けられればと思っています。平日の午前中で空いている日はありますか。",
    organized: true,
    category: "予約・日程",
    summary: "導入検討のため見学・説明を希望。平日午前の空き日程を確認したい。",
    priority: "中",
    sentiment: "好意的",
    fields: [
      { label: "希望内容", value: "見学 / 説明" },
      { label: "希望日", value: "平日 午前中" },
    ],
    status: "未対応",
    hoursAgo: 74,
  },
  {
    customerName: "岡崎 竜也",
    company: "岡崎運送",
    channel: "電話メモ",
    subject: "対応が遅いとのご指摘",
    body:
      "前回の問い合わせへの返信が遅く、少し不満に感じているとのお声。今後はもう少し早く連絡がほしいとのご要望でした。",
    organized: true,
    category: "要望・クレーム",
    summary: "前回対応の遅さへの不満。今後の返信スピード改善を要望。",
    priority: "高",
    sentiment: "要注意",
    fields: [
      { label: "指摘内容", value: "返信対応が遅い" },
      { label: "ご要望", value: "今後は早めの連絡" },
    ],
    status: "対応中",
    assigneeId: "u3",
    hoursAgo: 80,
  },
  {
    customerName: "白石 麻衣",
    company: "",
    channel: "チャット",
    subject: "はじめての利用で不安です",
    body:
      "こういったサービスを利用するのが初めてで、何を準備すればいいのか分かりません。難しい知識がなくても大丈夫でしょうか。",
    organized: true,
    category: "サービスの質問",
    summary: "初めての利用で、必要な準備や専門知識の要否を不安に感じている。",
    priority: "中",
    sentiment: "ふつう",
    fields: [
      { label: "質問項目", value: "必要な準備 / 専門知識の要否" },
      { label: "状況", value: "初回利用・不安あり" },
    ],
    status: "未対応",
    hoursAgo: 88,
  },
  {
    customerName: "村上 拓海",
    company: "村上農園",
    channel: "メール",
    subject: "繁忙期の対応について",
    body:
      "毎年秋が繁忙期で、その時期だけ対応をお願いしたいのですが、短期間・スポットでの依頼も可能でしょうか。",
    organized: true,
    category: "サービスの質問",
    summary: "秋の繁忙期のみ、短期・スポットでの依頼が可能か確認したい。",
    priority: "低",
    sentiment: "好意的",
    fields: [
      { label: "質問項目", value: "短期 / スポット依頼の可否" },
      { label: "時期", value: "秋(繁忙期)" },
    ],
    status: "未対応",
    hoursAgo: 96,
  },
  {
    customerName: "石田 光",
    company: "石田電機",
    channel: "Webフォーム",
    subject: "納期を早めてほしい",
    body:
      "先日お願いした案件ですが、社内の事情で予定より1週間早めていただくことは可能でしょうか。難しい場合はその旨教えてください。",
    organized: true,
    category: "要望・クレーム",
    summary: "既存案件の納期を1週間前倒しできないか相談。",
    priority: "中",
    sentiment: "ふつう",
    fields: [
      { label: "依頼内容", value: "納期の前倒し" },
      { label: "希望", value: "予定より1週間早め" },
    ],
    status: "未対応",
    hoursAgo: 104,
  },
  {
    customerName: "近藤 さゆり",
    company: "",
    channel: "チャット",
    subject: "領収書は発行できますか",
    body:
      "先日利用した分の領収書を発行していただけますか。宛名は空欄でお願いします。",
    organized: true,
    category: "手続き・書類",
    summary: "利用分の領収書発行を希望。宛名は空欄。",
    priority: "低",
    sentiment: "ふつう",
    fields: [
      { label: "依頼内容", value: "領収書の発行" },
      { label: "宛名", value: "空欄" },
    ],
    status: "返信済み",
    assigneeId: "u2",
    draft:
      "近藤 さゆり 様\n\nお問い合わせありがとうございます。領収書を宛名空欄にて発行し、あらためてお送りいたします。ご入用の際はいつでもお申し付けください。",
    hoursAgo: 120,
  },
  {
    customerName: "松井 大輔",
    company: "松井塗装",
    channel: "メール",
    subject: "施工事例を見たい",
    body:
      "御社にお願いした場合の仕上がりのイメージが知りたいです。これまでの施工事例やビフォーアフターの写真などがあれば拝見できますか。",
    organized: true,
    category: "サービスの質問",
    summary: "仕上がりイメージ確認のため、施工事例・ビフォーアフターを見たい。",
    priority: "低",
    sentiment: "好意的",
    fields: [
      { label: "依頼内容", value: "施工事例の共有" },
      { label: "目的", value: "仕上がりイメージの確認" },
    ],
    status: "未対応",
    hoursAgo: 140,
  },
  {
    customerName: "遠藤 佳奈",
    company: "えんどう薬局",
    channel: "Webフォーム",
    subject: "複数店舗での導入相談",
    body:
      "現在3店舗を運営しており、まとめて導入した場合の費用や進め方を相談したいです。まずは1店舗から試すこともできますか。",
    organized: true,
    category: "見積もり依頼",
    summary: "3店舗の一括導入費用・進め方の相談。1店舗からの試験導入も検討。",
    priority: "高",
    sentiment: "好意的",
    fields: [
      { label: "相談内容", value: "複数店舗(3店舗)への導入" },
      { label: "確認事項", value: "費用 / 進め方 / 段階導入" },
    ],
    status: "未対応",
    hoursAgo: 160,
  },
  {
    customerName: "内田 翔",
    company: "",
    channel: "チャット",
    subject: "解約の手続きについて",
    body:
      "利用を一度お休みしたいと考えています。解約と休止では何が違いますか。再開したくなったときの手続きも知りたいです。",
    organized: true,
    category: "手続き・書類",
    summary: "解約と休止の違い、再開時の手続きを確認したい。",
    priority: "中",
    sentiment: "ふつう",
    fields: [
      { label: "質問項目", value: "解約 / 休止の違い / 再開手続き" },
    ],
    status: "未対応",
    hoursAgo: 175,
  },
  {
    customerName: "菅原 智子",
    company: "すがわら花店",
    channel: "電話メモ",
    subject: "先日はありがとうございました",
    body:
      "対応がとても丁寧で助かったとのお礼のお電話。また何かあればお願いしたいとのこと。特に返信は不要とのことでした。",
    organized: true,
    category: "その他",
    summary: "丁寧な対応へのお礼。返信不要とのこと。",
    priority: "低",
    sentiment: "好意的",
    fields: [
      { label: "内容", value: "お礼のご連絡" },
      { label: "対応", value: "返信不要" },
    ],
    status: "未対応",
    hoursAgo: 190,
  },
  {
    customerName: "平田 隆",
    company: "ひらた不動産",
    channel: "メール",
    subject: "契約書のひな形について",
    body:
      "契約を進めるにあたり、契約書のひな形を事前に確認させていただくことは可能でしょうか。社内で内容を確認したうえで進めたいと考えています。",
    organized: true,
    category: "手続き・書類",
    summary: "契約前に契約書ひな形を確認したい。社内確認のため事前共有希望。",
    priority: "中",
    sentiment: "好意的",
    fields: [
      { label: "依頼内容", value: "契約書ひな形の事前共有" },
      { label: "目的", value: "社内での内容確認" },
    ],
    status: "未対応",
    hoursAgo: 210,
  },
];

// ============================================================
//  「AI 自動整理」を体感させる:未整理のサンプル受信ネタ
//  受信ボタンで注入 → organize で下記の想定結果を埋める
// ============================================================
export interface RawSample {
  customerName: string;
  company: string;
  channel: Channel;
  subject: string;
  body: string;
  // 整理結果(AI が算出したという想定)
  result: {
    category: Category;
    summary: string;
    priority: Priority;
    sentiment: Sentiment;
    fields: ExtractedField[];
  };
}

export const RAW_SAMPLES: RawSample[] = [
  {
    customerName: "河合 美穂",
    company: "かわい珈琲",
    channel: "Webフォーム",
    subject: "オリジナルの案内チラシを作りたい",
    body:
      "新メニューの案内チラシを作りたいのですが、デザインからお願いできますか。A4片面で200部ほど、再来週のイベントに間に合わせたいです。予算は3万円くらいを考えています。",
    result: {
      category: "見積もり依頼",
      summary: "新メニュー案内チラシ(A4片面200部)をデザインから依頼。再来週まで・予算3万円。",
      priority: "高",
      sentiment: "好意的",
      fields: [
        { label: "依頼内容", value: "チラシのデザイン・印刷" },
        { label: "仕様", value: "A4片面 / 200部" },
        { label: "希望納期", value: "再来週のイベントまで" },
        { label: "予算感", value: "約3万円" },
      ],
    },
  },
  {
    customerName: "宮本 拓也",
    company: "",
    channel: "チャット",
    subject: "予約の変更をお願いしたい",
    body:
      "来週金曜の予約を、翌週の月曜か火曜に変更したいです。時間は午後だと助かります。急で申し訳ありません。",
    result: {
      category: "予約・日程",
      summary: "来週金曜の予約を翌週 月or火の午後へ変更希望。",
      priority: "中",
      sentiment: "ふつう",
      fields: [
        { label: "依頼内容", value: "予約日の変更" },
        { label: "変更希望", value: "翌週 月曜または火曜 午後" },
      ],
    },
  },
  {
    customerName: "Daniel Reyes",
    company: "Bayside Supply",
    channel: "メール",
    subject: "Question about product availability",
    body:
      "Hi, do you currently have the standard model in stock? We would need about 40 units by the end of the month. Please advise on availability and price. Thanks.",
    result: {
      category: "見積もり依頼",
      summary: "標準モデル40個を月末までに希望。在庫と価格を確認したい(英語)。",
      priority: "高",
      sentiment: "好意的",
      fields: [
        { label: "数量", value: "約40個" },
        { label: "希望納期", value: "今月末まで" },
        { label: "確認事項", value: "在庫 / 価格" },
        { label: "言語", value: "英語(要翻訳対応)" },
      ],
    },
  },
  {
    customerName: "柴田 恵美",
    company: "しばた整骨院",
    channel: "電話メモ",
    subject: "受け取った案内の内容が分かりにくい",
    body:
      "先日届いた案内の書き方が分かりづらく、結局どうすればよいのか分からなかったとのお声。もう少しかみ砕いた説明がほしいとのご要望でした。",
    result: {
      category: "要望・クレーム",
      summary: "送付済み案内の内容が分かりにくいとの指摘。平易な説明を要望。",
      priority: "中",
      sentiment: "要注意",
      fields: [
        { label: "指摘内容", value: "案内が分かりにくい" },
        { label: "ご要望", value: "かみ砕いた説明" },
      ],
    },
  },
];

// ============================================================
//  組み立て
// ============================================================
export function buildSeed(): AppData {
  const now = new Date();
  const inquiries: Inquiry[] = RAW.map((r, i) => {
    const { hoursAgo, ...rest } = r;
    const received =
      hoursAgo < 24
        ? subMinutes(subHours(now, hoursAgo), (i * 13) % 59)
        : subHours(subDays(now, 0), hoursAgo);
    const seq = 148 - i;
    return {
      ...rest,
      id: `inq_${i}`,
      code: `INQ-2026-${String(seq).padStart(4, "0")}`,
      receivedAt: received.toISOString(),
    };
  });

  return {
    inquiries,
    templates: TEMPLATES.map((t) => ({ ...t })),
    staff: STAFF.map((s) => ({ ...s })),
  };
}

// カテゴリ一覧(フィルタ用)
export const CATEGORIES: Category[] = [
  "見積もり依頼",
  "サービスの質問",
  "予約・日程",
  "要望・クレーム",
  "手続き・書類",
  "その他",
];

export const STATUSES: Status[] = ["未対応", "対応中", "返信済み"];
