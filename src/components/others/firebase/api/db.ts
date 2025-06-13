import { ref, set as FBSet, get as FBGet } from "firebase/database";
import { db } from "..";

const set = async (path: string, data: unknown) => {
  const reference = ref(db, path);
  return await FBSet(reference, data);
};

const get = async (path: string) => {
  const reference = ref(db, path);
  return await FBGet(reference);
};

export { set, get };
