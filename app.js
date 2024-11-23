import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
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
const db = getDatabase(app);
const firestore = getFirestore(app);

// HTML要素の取得
const loginSection = document.getElementById("login-section");
const todoSection = document.getElementById("todo-section");
const loginForm = document.getElementById("login-form");
const userIdInput = document.getElementById("user-id");
const passwordInput = document.getElementById("password");
const logoutButton = document.getElementById("logout-button");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// ログイン処理
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();

    // ユーザーIDとパスワードの確認
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    
    if (snapshot.exists() && snapshot.val().password === password) {
        // ログイン成功
        loginSection.classList.add("hidden");
        todoSection.classList.remove("hidden");
        userIdInput.value = "";
        passwordInput.value = "";
        loadTasks();  // タスクの読み込み
    } else {
        // ログイン失敗
        alert("ユーザーIDまたはパスワードが間違っています");
    }
});

// ログアウト処理
logoutButton.addEventListener("click", () => {
    loginSection.classList.remove("hidden");
    todoSection.classList.add("hidden");
});

// タスクの読み込み
function loadTasks() {
    const tasksCollection = collection(firestore, "tasks");
    onSnapshot(tasksCollection, (snapshot) => {
        taskList.innerHTML = ""; // リストをクリア
        snapshot.forEach((doc) => {
            const task = doc.data();
            const li = document.createElement("li");
            li.textContent = task.name;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";
            deleteButton.addEventListener("click", async () => {
                await deleteDoc(doc.ref);
            });

            li.appendChild(deleteButton);
            taskList.appendChild(li);
        });
    });
}

// タスク追加
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const taskName = taskInput.value.trim();
    if (taskName) {
        const tasksCollection = collection(firestore, "tasks");
        await addDoc(tasksCollection, { name: taskName });
        taskInput.value = ""; // 入力フィールドをクリア
    }
});
