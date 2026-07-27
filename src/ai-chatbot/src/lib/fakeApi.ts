/**
 * 疑似 API レイヤー。
 * すべてのデータ操作をこれ経由にして「通信の手応え」を再現する。
 * ※ 本番では実際の生成 AI API / バックエンドに置き換わる。
 */
export async function fakeApi<T>(result: T, ms = 420): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 320));
  return result;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
