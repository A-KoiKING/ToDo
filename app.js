import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { sha256 } from "https://cdn.jsdelivr.net/npm/js-sha256@0.9.0/src/sha256.js";

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyAnlKqY57-RezoII0FLXhiSZJyjuKFbc3s",
    authDomain: "todo-13521.firebaseapp.com",
    projectId: "todo-13521",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestoreのusersコレクションを参照
const usersCollection = collection(db, "users");
const tasksCollection = collection(db, "tasks");

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

    if (!userId || !password) {
        alert("ユーザーIDとパスワードを入力してください。");
        return;
    }

    // パスワードをハッシュ化
    const hashedPassword = sha256(password);

    try {
        // Firestoreからユーザー情報を取得
        const q = query(usersCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("ユーザーIDが見つかりません。");
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password !== hashedPassword) {
            alert("パスワードが正しくありません。");
            return;
        }

        // ログイン成功
        alert("ログイン成功！");
        loginForm.reset();

        // ログイン状態を保存 (例: sessionStorage)
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("userId", userId);

        // タスク画面を表示
        loginSection.classList.add("hidden");
        todoSection.classList.remove("hidden");
        loadTasks(); // タスクの読み込み
    } catch (error) {
        alert("ログインに失敗しました: " + error.message);
    }
});

// ログアウト処理
logoutButton.addEventListener("click", () => {
    sessionStorage.clear();
    alert("ログアウトしました。");
    loginSection.classList.remove("hidden");
    todoSection.classList.add("hidden");
});

// ログイン状態の確認
window.addEventListener("load", () => {
    if (sessionStorage.getItem("loggedIn") === "true") {
        loginSection.classList.add("hidden");
        todoSection.classList.remove("hidden");
        loadTasks(); // タスクの読み込み
    } else {
        loginSection.classList.remove("hidden");
        todoSection.classList.add("hidden");
    }
});

// タスクの読み込み
function loadTasks() {
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
        await addDoc(tasksCollection, { name: taskName });
        taskInput.value = ""; // 入力フィールドをクリア
    }
});
