import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCKPnIba6s0Fdh5T_JNhHODcU7P5RN49vE",
  authDomain: "app-mobil-7b9bb.firebaseapp.com",
  projectId: "app-mobil-7b9bb",
  storageBucket: "app-mobil-7b9bb.firebasestorage.app",
  messagingSenderId: "136521694635",
  appId: "1:136521694635:web:f35eadf38240ce5da6e6ee",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

if (auth && typeof auth.useDeviceLanguage === "function") {
  auth.useDeviceLanguage();
}

const db = getFirestore(app);

export { app, auth, db };
