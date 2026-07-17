// 疑似 API レイヤー — すべてのデータ操作はこれを通す
export async function fakeApi<T>(result: T, ms = 400): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 300));
  return result;
}
