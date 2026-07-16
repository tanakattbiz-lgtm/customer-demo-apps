import type { Category, Inquiry } from "../data/seed";

/**
 * AI 返信下書きの生成(モック)。
 * カテゴリ・要約・抽出項目から、実際に送れる水準の日本語返信文を組み立てる。
 * ※ 本番では生成 AI にこの inquiry を渡して同等の下書きを得る想定。
 */

export type Tone = "ていねい" | "簡潔" | "やわらかい";

const GREET: Record<Tone, string> = {
  ていねい: "いつもお世話になっております。",
  簡潔: "ご連絡ありがとうございます。",
  やわらかい: "お問い合わせいただきありがとうございます!",
};

const CLOSE: Record<Tone, string> = {
  ていねい:
    "ご不明な点がございましたら、どうぞお気軽にお申し付けください。何卒よろしくお願いいたします。",
  簡潔: "ご不明点があればお知らせください。よろしくお願いいたします。",
  やわらかい:
    "ほかにも気になることがあれば、遠慮なくおたずねくださいね。よろしくお願いします。",
};

function bodyFor(cat: Category | undefined, inq: Inquiry): string {
  const first = inq.fields?.[0]?.value ?? "ご相談内容";
  switch (cat) {
    case "見積もり依頼":
      return `「${first}」につきまして、お見積りのご依頼を承りました。\nいただいた条件をもとに概算を確認し、あらためて金額と納期の目安をご案内いたします。追加で仕様のご希望があれば、あわせてお知らせください。`;
    case "サービスの質問":
      return `ご質問いただいた点について、以下のとおりご案内いたします。\n${inq.summary ?? ""}\nご要望に合わせた進め方もご提案できますので、詳しくは折り返しご説明させてください。`;
    case "予約・日程":
      return `ご希望の日程を承りました。\nこちらで候補を確認のうえ、いくつか日時の候補をお送りいたします。ご都合のよいものをお選びいただけますと幸いです。`;
    case "要望・クレーム":
      return `このたびはご不便・ご心配をおかけし、誠に申し訳ございません。\nいただいたご指摘を真摯に受け止め、早急に状況を確認のうえ対応いたします。あらためて経過をご報告させていただきます。`;
    case "手続き・書類":
      return `お手続きのご依頼を承りました。\n「${first}」について確認し、必要な書類をご用意のうえご案内いたします。お手元に届くまで今しばらくお待ちください。`;
    default:
      return `お問い合わせの内容を確認いたしました。\n担当にて内容を確認のうえ、あらためてご連絡いたします。`;
  }
}

export function draftReply(inq: Inquiry, tone: Tone = "ていねい"): string {
  const name = inq.customerName + " 様";
  return `${name}\n\n${GREET[tone]}\n${bodyFor(inq.category, inq)}\n\n${CLOSE[tone]}`;
}
