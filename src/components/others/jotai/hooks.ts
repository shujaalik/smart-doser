import type { Atom } from "jotai";
import { useEffect, useState } from "react";
import { store } from ".";

const useSub = <Value>(atom: Atom<Value>): Value => {
  const [value, setValue] = useState<Value>(store.get(atom));

  useEffect(() => {
    const unsub = store.sub(atom, () => {
      const newValue = store.get(atom);
      setValue(newValue);
    });

    return unsub;
  }, [atom]);

  return value;
};

export default useSub;
