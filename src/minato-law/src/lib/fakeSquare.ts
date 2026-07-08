/**
 * Square 連携の「デモ用モック」。
 * 本番では Square の Web Payments SDK を読み込み、
 *   const payments = window.Square.payments(APP_ID, LOCATION_ID);
 *   const card = await payments.card(); await card.attach('#card-container');
 *   const { token } = await card.tokenize();          // カードのnonceを取得
 *   → 自社サーバへ token を送信 → Square Payments API で決済を作成
 * という流れになる。このモックはそのインターフェイスに寄せてあり、
 * 実装イメージを掴めるようにしている。
 *
 * ※ デモのため実際の課金は行わず、アプリケーションID等も使用しない
 *   (CLAUDE.md ルール5)。sandbox 相当の疑似応答を返す。
 */

export interface TokenizeResult {
  status: "OK" | "ERROR";
  token?: string; // カードnonce (cnon:...)
  errors?: Array<{ field?: string; message: string }>;
  details?: { card: { brand: string; last4: string; expMonth: number; expYear: number } };
}

export interface SquarePayment {
  id: string;
  status: "COMPLETED" | "FAILED";
  amountMoney: { amount: number; currency: "JPY" };
  cardDetails: { brand: string; last4: string };
  receiptNumber: string;
  createdAt: string;
}

export interface CreatePaymentResult {
  payment?: SquarePayment;
  errors?: Array<{ code: string; detail: string }>;
}

let seq = 4000;
function id(prefix: string) {
  seq += 1;
  return `${prefix}${seq.toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

/** card.tokenize() 相当:カード情報を nonce 化する(sandbox) */
export async function tokenizeCard(card: {
  number: string;
  exp: string;
  cvc: string;
}): Promise<TokenizeResult> {
  await delay(650);
  const digits = card.number.replace(/\s/g, "");

  if (digits.length < 14) {
    return {
      status: "ERROR",
      errors: [{ field: "cardNumber", message: "カード番号が正しくありません。" }],
    };
  }
  const [mm, yy] = card.exp.split("/");
  return {
    status: "OK",
    token: "cnon:" + id("card_"),
    details: {
      card: {
        brand: cardBrand(digits),
        last4: digits.slice(-4),
        expMonth: Number(mm) || 12,
        expYear: 2000 + (Number(yy) || 28),
      },
    },
  };
}

/** Payments API の CreatePayment 相当(本番は自社サーバ経由) */
export async function createPayment(
  token: string,
  amount: number,
  brand: string,
  last4: string,
): Promise<CreatePaymentResult> {
  await delay(1200);

  // Square sandbox の decline テストカード(4000...0002)を再現
  if (last4 === "0002") {
    return {
      errors: [{ code: "CARD_DECLINED", detail: "カードが拒否されました。別のカードでお試しください。" }],
    };
  }

  return {
    payment: {
      id: id("sqpmt_"),
      status: "COMPLETED",
      amountMoney: { amount, currency: "JPY" },
      cardDetails: { brand, last4 },
      receiptNumber: token.slice(-8).toUpperCase(),
      createdAt: new Date().toISOString(),
    },
  };
}

export function cardBrand(num: string): string {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^35/.test(n)) return "JCB";
  return "カード";
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 400));
}
