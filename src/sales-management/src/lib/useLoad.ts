import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** 初回ロード時にスケルトンを見せるためのヘルパー。deps 変化で再ロード。 */
export function useLoad(deps: unknown[] = [], ms = 480): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fakeApi(true, ms).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}
