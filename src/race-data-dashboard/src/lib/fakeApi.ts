/**
 * 疑似 API レイヤー。
 * データソース(JRA-VAN / 競馬最強の法則WEB)との通信の「手応え」を再現するため、
 * すべてのデータ取得・掲載処理はこれ経由で行う。
 */
export async function fakeApi<T>(result: T, ms = 480): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 340));
  return result;
}
