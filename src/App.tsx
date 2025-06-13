import { useMemo } from "react";
import CurrentUser from "./components/others/firebase/hooks/auth"
import Header from "./components/ui/custom/header"
import Controller from "./Controller"
import Login from "./Login";

function App() {
  const user = CurrentUser();
  const isDoctor = useMemo(() => {
    if (!user) return false;
    return user.uid === import.meta.env.VITE_DOCTOR_UID;
  }, [user]);

  return <div className="h-screen font-poppins">
    <div className="flex justify-center items-start flex-col px-10 py-4 gap-5">
      <Header />
      {user ? <Controller isDoctor={isDoctor} /> : <Login />}
    </div>
  </div>
}

export default App
