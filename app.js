import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyAnlKqY57-RezoII0FLXhiSZJyjuKFbc3s",
    authDomain: "todo-13521.firebaseapp.com",
    projectId: "todo-13521",
    storageBucket: "todo-13521.firebasestorage.app",
    messagingSenderId: "887675608384",
    appId: "1:887675608384:web:969383e374d4e03a616ea5",
    measurementId: "G-LLL2PC42TQ"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// タスク用コレクション
const tasksCollection = collection(db, "tasks");

// HTML要素の取得
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Firestoreからタスクをリアルタイムで取得
onSnapshot(tasksCollection, (snapshot) => {
    taskList.innerHTML = ''; // リストをクリア
    snapshot.forEach(doc => {
        const task = doc.data();
        const li = document.createElement('li');
        li.textContent = task.name;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', async () => {
            await deleteDoc(doc.ref);
        });

        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
});

// タスク追加時の処理
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = taskInput.value.trim();
    if (taskName) {
        await addDoc(tasksCollection, { name: taskName });
        taskInput.value = '';
    }
});