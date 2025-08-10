import {
  ref,
  set as FBSet,
  get as FBGet,
  push as FBPush,
} from "firebase/database";
import { db } from "..";

const set = async (path: string, data: unknown) => {
  const reference = ref(db, path);
  return await FBSet(reference, data);
};

const get = async (path: string) => {
  const reference = ref(db, path);
  return await FBGet(reference);
};

const push = async (path: string, data: unknown) => {
  const reference = ref(db, path);
  return await FBPush(reference, data);
};

export { set, get, push };
