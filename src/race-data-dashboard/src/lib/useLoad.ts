import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** 画面の初回ロードでスケルトンを一定時間見せるためのフック */
export function useLoad(ms = 540): boolean {
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
