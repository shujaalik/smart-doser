import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAFFWqxrJRowPed2ByjoMsBCUyWTg4sVAI",
  authDomain: "smart-doser.firebaseapp.com",
  projectId: "smart-doser",
  storageBucket: "smart-doser.firebasestorage.app",
  messagingSenderId: "1058789459046",
  appId: "1:1058789459046:web:7a60c79054039d147159a7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export default app;
export { auth, db };
