import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** 初回ロードのスケルトン表示を再現するフック */
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
