import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "react-char-mwcq.firebaseapp.com",
    projectId: "react-char-mwcq",
    storageBucket: "react-char-mwcq.appspot.com",
    messagingSenderId: "982892453633",
    appId: "1:982892453633:web:b6df17f23e0c47da05c500"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()