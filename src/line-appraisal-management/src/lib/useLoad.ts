import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** スケルトン表示用:初回だけ疑似 API の待ち時間を作る */
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
