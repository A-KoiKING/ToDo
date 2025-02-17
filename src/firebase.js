import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, query, orderBy, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnLKqY57-RezoII0FLXhiSZJyjuKFbc3s",
  authDomain: "todo-13521.firebaseapp.com",
  projectId: "todo-13521",
  storageBucket: "todo-13521.firebasestorage.app",
  messagingSenderId: "887675608384",
  appId: "1:887675608384:web:969383e374d4e03a616ea5",
  measurementId: "G-LLL2PC42TQ",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore, collection, addDoc, onSnapshot, deleteDoc, query, orderBy, where, getDocs };
