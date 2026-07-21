/**
 * 疑似 API レイヤー。
 * すべてのデータ操作をこれ経由にして「通信の手応え」を再現する。
 */
export async function fakeApi<T>(result: T, ms = 380): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 320));
  return result;
}
