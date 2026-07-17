/** すべてのデータ操作はこれを通し、実システムらしい待ち時間を再現する */
export async function fakeApi<T>(result: T, ms = 400): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 300));
  return result;
}
