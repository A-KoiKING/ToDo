import React, { useState } from 'react';
//import './Task.css';

function Task({ handleAddTask, tasks, handleDeleteTask, userName }) {
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('通常');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    通常: true,
    重要: true,
    緊急: true,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (taskName.trim() === '' || isSubmitting) return;
    setIsSubmitting(true);
    await handleAddTask({ name: taskName, priority, user: userName });
    setTaskName('');
    setPriority('通常');
    setIsSubmitting(false);
  };

  const toggleAccordion = (level) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const groupedTasks = {
    通常: tasks.filter((task) => task.priority === '通常'),
    重要: tasks.filter((task) => task.priority === '重要'),
    緊急: tasks.filter((task) => task.priority === '緊急'),
  };

  return (
    <div className="task">
      <h1>タスク管理</h1>
      <form onSubmit={onSubmit} className="form">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="タスクを入力してください"
          required
          autoComplete="off"
          className="input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="select"
        >
          <option value="通常">通常</option>
          <option value="重要">重要</option>
          <option value="緊急">緊急</option>
        </select>
        <button type="submit" disabled={isSubmitting} className="button">
          {isSubmitting ? '追加中...' : '追加'}
        </button>
      </form>

      <div className="accordion-container">
        {['緊急', '重要', '通常'].map((level) => (
          <div key={level} className="accordion">
            <h2
              className={`accordion-title priority-${level}`}
              onClick={() => toggleAccordion(level)}
            >
              {level} {openAccordions[level] ? '▼' : '▶'}
            </h2>
            {openAccordions[level] && (
              <ul className="accordion-content">
                {groupedTasks[level].length > 0 ? (
                  groupedTasks[level].map((task) => (
                    <li key={task.id}>
                      {task.user} : {task.name}{' '}
                      {task.createdAt
                        ? new Date(task.createdAt.seconds * 1000).toLocaleString()
                        : '日時不明'}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="delete-button"
                      >
                        削除
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="no-tasks">タスクがありません</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Task;