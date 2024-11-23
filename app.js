// sha256をインポート
import sha256 from "https://cdn.jsdelivr.net/npm/js-sha256@0.9.0/src/sha256.js";

// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
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
const auth = getAuth(app);

// HTML要素の取得
const loginSection = document.getElementById("login-section");
const todoSection = document.getElementById("todo-section");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerButton = document.getElementById("register-button");
const logoutButton = document.getElementById("logout-button");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// ユーザーの認証状態を監視
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ログイン中の場合
        loginSection.classList.add("hidden");
        todoSection.classList.remove("hidden");
        loadTasks(); // タスクの読み込み
    } else {
        // 未ログインの場合
        loginSection.classList.remove("hidden");
        todoSection.classList.add("hidden");
    }
});

// ログイン処理
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // パスワードをハッシュ化
    const hashedPassword = sha256(password);

    // ハッシュ化されたパスワードでログイン処理
    signInWithEmailAndPassword(auth, email, hashedPassword)
        .then(() => {
            emailInput.value = "";
            passwordInput.value = "";
        })
        .catch((error) => {
            alert("ログインに失敗しました: " + error.message);
        });
});

// ログアウト処理
logoutButton.addEventListener("click", () => {
    signOut(auth).catch((error) => {
        alert("ログアウトに失敗しました: " + error.message);
    });
});

// タスクの読み込み
function loadTasks() {
    const tasksCollection = collection(db, "tasks");
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
        const tasksCollection = collection(db, "tasks");
        await addDoc(tasksCollection, { name: taskName });
        taskInput.value = ""; // 入力フィールドをクリア
    }
});
