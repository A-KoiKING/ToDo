import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { deleteDoc, doc, collection, addDoc, onSnapshot, query, orderBy, where, getDocs } from "firebase/firestore";
import "./App.css";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import Task from "./components/Task";

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

    setIsSubmitting(() => true);

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
      setIsSubmitting(() => false);
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
        <LoginPage
          handleLogin={handleLogin}
          userId={userId}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
        />
      ) : (
        <div className="WebApp">
          <Sidebar 
            userName={userName}
            handleLogout={handleLogout}
          />
          <Task 
            handleAddTask={handleAddTask}
            task={task}
            setTask={setTask}
            isSubmitting={isSubmitting}
            tasks={tasks}
            handleDeleteTask={handleDeleteTask}
          />
        </div>
      )}
    </div>
  );
}

export default App;
