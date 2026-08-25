/** すべてのデータ操作はここを通し、本物のシステムらしい待ち時間を再現する */
export async function fakeApi<T>(result: T, ms = 400): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 300));
  return result;
}
