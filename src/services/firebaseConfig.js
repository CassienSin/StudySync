// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ6vfhNzsWE9EnKn3y1IHKVJHyUObR4sA",
  authDomain: "homeworktracker-fad3b.firebaseapp.com",
  projectId: "homeworktracker-fad3b",
  storageBucket: "homeworktracker-fad3b.appspot.com", // ✅ fixed extension
  messagingSenderId: "221942376989",
  appId: "1:221942376989:web:5fb01806ed1c377ac9f4f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export these so other files can import them
export const auth = getAuth(app);
export const db = getFirestore(app);
