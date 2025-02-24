import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { deleteDoc, doc, collection, addDoc, onSnapshot, query, orderBy, where, getDocs } from "firebase/firestore";
import "./App.css";

function App() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedUserName = localStorage.getItem("userName");
    if (savedUserId && savedUserName) {
      setUserId(savedUserId);
      setUserName(savedUserName);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const userRef = collection(firestore, "users");
    const userQuery = query(userRef, where("userId", "==", userId), where("password", "==", password));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      setUserName(userSnapshot.docs[0].data().userName);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userSnapshot.docs[0].data().userName);
      setIsLoggedIn(true);
    } else {
      alert("ユーザーIDまたはパスワードが間違っています");
    }
  };

  const handleLogout = () => {
    setUserId("");
    setPassword("");
    setUserName("");
    setTask("");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (task.trim() === "" || isSubmitting) return;
    setIsSubmitting(true);
    if (task.trim()) {
      try {
        await addDoc(collection(firestore, "tasks"), { 
          name: task, 
          user: userName, 
          createdAt: new Date() 
        });
        setTask("");
      } catch (error) {
        alert("タスク追加エラー:"+ error);
      } finally {
        setIsSubmitting(false);
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
        <div className="container">
          <h1 className="title">Welcome to Hakorobo</h1>
          <form onSubmit={handleLogin} className="form">
            <label className="login_label">ユーザーID</label>
            <input type="text" name="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required autoComplete="off" className="input"/>
            <label className="login_label">パスワード</label>
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" className="input"/>
            <button type="submit" className="button">ログイン</button>
          </form>
        </div>
      ) : (
        <div>
          <h1>タスク管理</h1>
          <label className="label">ユーザー名: {userName}</label>
          <button onClick={handleLogout} className="button">ログアウト</button>
          <form onSubmit={handleAddTask} className="form">
            <input type="text" name="task" value={task} onChange={(e) => setTask(e.target.value)} placeholder="タスクを入力してください" required autoComplete="off" className="input"/>
            <button type="submit" disabled={isSubmitting} className="button">{isSubmitting ? "追加中..." : "追加"}</button>
          </form>
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {task.user} : {task.name}  {task.createdAt?.toDate().toLocaleString()}
                <button onClick={() => handleDeleteTask(task.id)} className="button">削除</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
