import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import { deleteDoc, doc, collection, addDoc, onSnapshot, query, orderBy, where, getDocs } from "firebase/firestore";
import { HashRouter as Router, Route, Routes, useNavigate, useLocation } from "react-router-dom";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

      // 現在のURLが有効なルートかどうかをチェック
      const validRoutes = ["/home", "/task", "/calendar"];
      const currentPath = location.pathname;

      // 有効なルートでない場合のみ /home にリダイレクト
      if (!validRoutes.includes(currentPath)) {
        navigate("/home");
      }
      // 有効なルート（/home, /task, /calendar）の場合は何もしない（現在のURLを維持）
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      navigate("/home");
    } else {
      console.log("ユーザーIDまたはパスワードが間違っています");
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
    navigate("/");
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (task.trim() === "" || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(firestore, "tasks"), {
        name: task,
        user: userName,
        createdAt: new Date(),
      });
      setTask("");
    } catch (error) {
      console.log("タスク追加エラー:" + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteDoc(doc(firestore, "tasks", id));
    } catch (error) {
      console.log("タスク削除エラー:" + error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
          <button className="menu-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? "✕" : "☰"}
          </button>
          <Sidebar
            userName={userName}
            handleLogout={handleLogout}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
          <div className="main-content">
            <Routes>
              <Route path="/home" element={<div>Home Page</div>} />
              <Route
                path="/task"
                element={
                  <Task
                    handleAddTask={handleAddTask}
                    task={task}
                    setTask={setTask}
                    isSubmitting={isSubmitting}
                    tasks={tasks}
                    handleDeleteTask={handleDeleteTask}
                  />
                }
              />
              <Route path="/calendar" element={<div>Calendar Page</div>} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}