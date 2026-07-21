import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** 画面の初回ロードでスケルトンを一定時間見せるためのフック */
export function useLoad(ms = 520, deps: unknown[] = []): boolean {
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
