import { useEffect, useState } from "react";
import { fakeApi } from "./fakeApi";

/** 疑似 API のロード状態を扱う小さなフック。key が変わると再ロードする。 */
export function useLoad<T>(factory: () => T, deps: unknown[], ms = 480) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    fakeApi(factory(), ms).then((r) => {
      if (!live) return;
      setData(r);
      setLoading(false);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading };
}
