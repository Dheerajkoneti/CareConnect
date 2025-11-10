// client/src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase Web Config
const firebaseConfig = {
  apiKey: "AIzaSyA7gppMVI_Kyte5JZKJlwaeG5rM8-2K_pg",
  authDomain: "careconnect-dd2c1.firebaseapp.com",
  projectId: "careconnect-dd2c1",
  storageBucket: "careconnect-dd2c1.appspot.com",
  messagingSenderId: "297842485829",
  appId: "1:297842485829:web:d0eae6ef0b24b27847d512c",
  measurementId: "G-PRX8GLXH6T"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
