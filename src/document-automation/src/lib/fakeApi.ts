// すべてのデータ操作はこれを通し、本物のシステムの通信待ちを再現する
export async function fakeApi<T>(result: T, ms = 400): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 300));
  return result;
}
