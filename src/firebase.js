import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// LIM INN DIN KONFIGURASJON HER (fra Firebase-konsollen):
const firebaseConfig = {
  apiKey: "AIzaSyBaEU3ZThrYnPPozPc89yK7M5Qc-a2nE3U", 
  authDomain: "meny-system.firebaseapp.com",
  projectId: "meny-system",
  storageBucket: "meny-system.firebasestorage.app",
  messagingSenderId: "919975605631",
  appId: "1:919975605631:web:990294bdc3fcd4aa4b564a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);