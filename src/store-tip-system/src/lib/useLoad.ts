import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** 疑似 API 経由の初回ロード。スケルトン表示に使う。 */
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
