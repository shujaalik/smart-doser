import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "..";

const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

const signOut = async () => {
  return await auth.signOut();
};

export { signIn, signOut };
