// 必要なFirebase SDKの関数をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, query, orderBy, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

// userId設定
let userId = "";

// クールタイムの設定
const Cooltime = 1000;
let isCooltime = false;

// ログイン処理
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    userId = userIdInput.value.trim();
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
            loadTasks();
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
    const tasksQuery = query(tasksCollection, orderBy("createdAt", "asc"));  // 作成日時順に並び替え
    onSnapshot(tasksQuery, (snapshot) => {
        taskList.innerHTML = "";

        // テーブル要素の作成
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        // テーブルヘッダーの作成
        const headerRow = document.createElement("tr");
        const headers = ["ユーザー", "タスク名", "作成日時", "削除"];
        headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // テーブルボディにデータを追加
        snapshot.forEach((doc) => {
            const task = doc.data();
            const row = document.createElement("tr");

            const userCell = document.createElement("td");
            userCell.textContent = task.user || "ユーザー不明";
            row.appendChild(userCell);

            const nameCell = document.createElement("td");
            nameCell.textContent = task.name;
            row.appendChild(nameCell);

            const createdAtCell = document.createElement("td");
            createdAtCell.textContent = task.createdAt.toDate().toLocaleString();
            row.appendChild(createdAtCell);

            // 削除ボタンのセル
            const deleteButtonCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";
            deleteButton.addEventListener("click", async () => {
                await deleteDoc(doc.ref);
            });
            deleteButtonCell.appendChild(deleteButton);
            row.appendChild(deleteButtonCell);

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        taskList.appendChild(table);
    });
}


// タスク追加
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(isCooltime){
        alert("クールタイム中です。しばらくお待ちください。");
        return;
    }
    const taskName = taskInput.value.trim();
    if (taskName) {
        taskInput.value = "";
        const tasksCollection = collection(firestore, "tasks");
        await addDoc(tasksCollection, { name: taskName, user: userId, createdAt: new Date() });
        // クールタイム
        isCooltime = true;
        setTimeout(() => {
            isCooltime = false;
        }, Cooltime);
    }
});
