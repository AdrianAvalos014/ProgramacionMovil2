// // //-FASE3
// // // firebase-config.js
// // // Tipos para que TS no se queje aunque sea .js
// // /** @typedef {import('firebase/app').FirebaseApp} FirebaseApp */
// // /** @typedef {import('firebase/auth').Auth} Auth */

// // import { initializeApp, getApps, getApp } from "firebase/app";
// // import {
// //   initializeAuth,
// //   getAuth,
// //   getReactNativePersistence,
// // } from "firebase/auth";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { getFirestore } from "firebase/firestore";


// // export const firebaseConfig = {
// //   apiKey: "AIzaSyCKPnIba6s0Fdh5T_JNhHODcU7P5RN49vE",
// //   authDomain: "app-mobil-7b9bb.firebaseapp.com",
// //   projectId: "app-mobil-7b9bb",
// //   storageBucket: "app-mobil-7b9bb.firebasestorage.app",
// //   messagingSenderId: "136521694635",
// //   appId: "1:136521694635:web:f35eadf38240ce5da6e6ee",
// // };

// // /** @type {FirebaseApp} */
// // const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// // /** @type {Auth} */
// // let auth;
// // try {
// //   auth = initializeAuth(app, {
// //     persistence: getReactNativePersistence(AsyncStorage),
// //   });
// // } catch {
// //   // si ya estaba inicializado por Fast Refresh
// //   auth = getAuth(app);
// // }
// // // ...

// // auth.useDeviceLanguage && auth.useDeviceLanguage();

// // export { app, auth };



// // firebase-config.js
// // Configuración de Firebase (Auth + Firestore) para React Native / Expo

// import { initializeApp, getApps, getApp } from "firebase/app";
// import {
//   initializeAuth,
//   getAuth,
//   getReactNativePersistence,
// } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Tu configuración de Firebase
// export const firebaseConfig = {
//   apiKey: "AIzaSyCKPnIba6s0Fdh5T_JNhHODcU7P5RN49vE",
//   authDomain: "app-mobil-7b9bb.firebaseapp.com",
//   projectId: "app-mobil-7b9bb",
//   storageBucket: "app-mobil-7b9bb.firebasestorage.app",
//   messagingSenderId: "136521694635",
//   appId: "1:136521694635:web:f35eadf38240ce5da6e6ee",
// };

// // Evitar re-inicializar en Fast Refresh
// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// // Auth con persistencia en AsyncStorage (offline)
// let auth;
// try {
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage),
//   });
// } catch (e) {
//   // Si ya estaba inicializado (Fast Refresh)
//   auth = getAuth(app);
// }

// if (auth && typeof auth.useDeviceLanguage === "function") {
//   auth.useDeviceLanguage();
// }

// // Firestore para datos (sync online)
// const db = getFirestore(app);

// export { app, auth, db };


// firebase-config.js
// Configuración Firebase para Expo (Auth + Firestore)

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto
export const firebaseConfig = {
  apiKey: "AIzaSyCKPnIba6s0Fdh5T_JNhHODcU7P5RN49vE",
  authDomain: "app-mobil-7b9bb.firebaseapp.com",
  projectId: "app-mobil-7b9bb",
  storageBucket: "app-mobil-7b9bb.firebasestorage.app",
  messagingSenderId: "136521694635",
  appId: "1:136521694635:web:f35eadf38240ce5da6e6ee",
};

// Evitar re-inicializar con Fast Refresh
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth con persistencia en AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

if (auth && typeof auth.useDeviceLanguage === "function") {
  auth.useDeviceLanguage();
}

// 🔹 Firestore
const db = getFirestore(app);

export { app, auth, db };
