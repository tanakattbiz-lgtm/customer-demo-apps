// すべての疑似データ操作はこれを通す。本物のシステムらしい「通信の待ち時間」を再現する。
export async function fakeApi<T>(result: T, ms = 400): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 300));
  return result;
}
