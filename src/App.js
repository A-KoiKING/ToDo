import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { deleteDoc, doc, collection, addDoc, onSnapshot, query, orderBy, where, getDocs } from "firebase/firestore";
import "./App.css";

function App() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      const tasksCollection = collection(firestore, "tasks");
      const tasksQuery = query(tasksCollection, orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const userRef = collection(firestore, "users");
    const userQuery = query(userRef, where("userId", "==", userId), where("password", "==", password));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      setIsLoggedIn(true);
    } else {
      alert("ユーザーIDまたはパスワードが間違っています");
    }
  };

  const handleLogout = () => {
    setUserId("");
    setPassword("");
    setIsLoggedIn(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (task.trim()) {
      try {
        await addDoc(collection(firestore, "tasks"), { 
          name: task, 
          user: userId, 
          createdAt: new Date() 
        });
        setTask("");
      } catch (error) {
        alert("タスク追加エラー:"+ error);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteDoc(doc(firestore, "tasks", id));
    } catch (error) {
      alert("タスク削除エラー:"+ error);
    }
  };
  

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <h1>ログイン</h1>
          <form onSubmit={handleLogin}>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="ユーザーID" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" required />
            <button type="submit">ログイン</button>
          </form>
        </div>
      ) : (
        <div>
          <h1>タスク管理</h1>
          <button onClick={handleLogout}>ログアウト</button>
          <form onSubmit={handleAddTask}>
            <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="タスクを入力してください" required />
            <button type="submit">追加</button>
          </form>
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {task.user} : {task.name}
                <button onClick={() => handleDeleteTask(task.id)}>削除</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
