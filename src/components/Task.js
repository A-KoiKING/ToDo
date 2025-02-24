import React from 'react'

function Task({
    userName, 
    handleLogout, 
    handleAddTask, 
    task, 
    setTask, 
    isSubmitting, 
    tasks, 
    handleDeleteTask 
}) {
  return (
    <div className="task">
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
                    {task.user} : {task.name}  
                    {task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleString() : "日時不明"}
                    <button onClick={() => handleDeleteTask(task.id)} className="button">削除</button>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default Task
