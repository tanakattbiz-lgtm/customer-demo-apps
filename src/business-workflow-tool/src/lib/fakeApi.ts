import { useEffect, useState } from "react";

/**
 * 疑似 API レイヤー。
 * すべてのデータ操作をこれ経由にして「通信の手応え」を再現する。
 */
export async function fakeApi<T>(result: T, ms = 420): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 320));
  return result;
}

/** 画面の初回ロードでスケルトンを一定時間見せるためのフック */
export function useLoad(ms = 520): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fakeApi(true, ms).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [ms]);
  return loading;
}
