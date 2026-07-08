/**
 * 疑似 API レイヤー。
 * すべてのデータ操作をこれ経由にして「通信の手応え」を再現する。
 */
export async function fakeApi<T>(result: T, ms = 420): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 320));
  return result;
}

/** たまに失敗する処理(決済など)の再現用 */
export async function fakeApiMaybeFail<T>(
  result: T,
  failRate = 0,
  ms = 900,
): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 500));
  if (Math.random() < failRate) {
    throw new Error("処理に失敗しました。時間をおいて再度お試しください。");
  }
  return result;
}
