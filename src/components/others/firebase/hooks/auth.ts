import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "..";

const CurrentUser = () => {
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => setUser(user));
  }, []);

  return user;
};

export default CurrentUser;
