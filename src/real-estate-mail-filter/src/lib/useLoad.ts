import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** 初回ロードのスケルトン表示用(疑似APIの待ち時間を再現する) */
export function useLoad(ms = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fakeApi(null, ms).then(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [ms]);
  return loading;
}
