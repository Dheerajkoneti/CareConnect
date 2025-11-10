// client/src/firebase/firebaseInit.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./firebaseConfig";

let app;
let analytics;

try {
  app = initializeApp(firebaseConfig);

  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics unavailable in this environment");
  }

} catch (err) {
  console.warn("Firebase initialization failed:", err);
}

export { app, analytics };
