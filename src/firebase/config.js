// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB26pCLUBgC7u4HpGYIttW1O4_TPxmKMpE",
  authDomain: "roulette-game3.firebaseapp.com",
  projectId: "roulette-game3",
  storageBucket: "roulette-game3.firebasestorage.app",
  messagingSenderId: "422162418078",
  appId: "1:422162418078:web:81ffb72a4d3f0149a62e8f",
  measurementId: "G-Q7XNT2P65K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);