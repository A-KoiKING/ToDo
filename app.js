// 必要なFirebase SDKの関数をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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
    
    console.log('Logging in with', userId, password);

    try {
        const userRef = collection(firestore, 'users');
        const userQuery = query(userRef, where('userId', '==', userId), where('password', '==', password));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
            console.log('Login successful');
            loginSection.classList.add("hidden");
            todoSection.classList.remove("hidden");
            userIdInput.value = "";
            passwordInput.value = "";
            loadTasks();  // タスクの読み込み
        } else {
            console.log('Login failed');
            alert("ユーザーIDまたはパスワードが間違っています");
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert("ログイン中にエラーが発生しました。");
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
