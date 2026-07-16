import { useEffect, useState } from "react";

/** 一覧などの初回ロードで、スケルトンを見せるための擬似ローディング。 */
export function useLoad(ms = 550): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), ms + Math.random() * 250);
    return () => clearTimeout(id);
  }, [ms]);
  return loading;
}
