// 疑似 API レイヤー — すべてのデータ操作はこれを通し、通信の手応えを再現する
export async function fakeApi<T>(result: T, ms = 420): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 260));
  return result;
}
