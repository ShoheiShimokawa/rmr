import { useEffect, useState } from "react";

/** valueが変化してからdelayミリ秒だけ入力が止まった後の値を返す。 */
export const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
