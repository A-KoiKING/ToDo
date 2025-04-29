import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Confirm from "./Confirm";
import "./Task.css";

function Task({ handleAddTask, tasks, handleDeleteTask, userName }) {
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("通常");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    通常: false,
    重要: false,
    緊急: false,
  });
  const [openUserAccordions, setOpenUserAccordions] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const [checkedTasks, setCheckedTasks] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmingTaskId, setConfirmingTaskId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);

    if (newValue === 1) {
      const allUsersOpen = Object.keys(groupedByUser).reduce((acc, user) => {
        acc[user] = true;
        return acc;
      }, {});
      setOpenUserAccordions(allUsersOpen);
    }
  };

  useEffect(() => {
    setOpenAccordions((prev) => ({
      通常: tasks.some((task) => task.priority === "通常") ? true : prev.通常,
      重要: tasks.some((task) => task.priority === "重要") ? true : prev.重要,
      緊急: tasks.some((task) => task.priority === "緊急") ? true : prev.緊急,
    }));
  }, [tasks]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (taskName.trim() === "" || isSubmitting) return;
    setIsSubmitting(true);
    await handleAddTask({ name: taskName, priority, user: userName });
    setTaskName("");
    setPriority("通常");
    setIsSubmitting(false);
  };

  const toggleAccordion = (level) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const toggleUserAccordion = (user) => {
    setOpenUserAccordions((prev) => ({
      ...prev,
      [user]: !prev[user],
    }));
  };

  const groupedTasks = {
    通常: tasks.filter((task) => task.priority === "通常"),
    重要: tasks.filter((task) => task.priority === "重要"),
    緊急: tasks.filter((task) => task.priority === "緊急"),
  };

  const groupedByUser = tasks.reduce((acc, task) => {
    if (!acc[task.user]) acc[task.user] = [];
    acc[task.user].push(task);
    return acc;
  }, {});

  const handleCheckboxChange = (taskId) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleDeleteClick = (taskId) => {
    setConfirmingTaskId(taskId);
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    if (confirmingTaskId) {
      handleDeleteTask(confirmingTaskId);
    }
    setShowConfirm(false);
    setConfirmingTaskId(null);
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    setConfirmingTaskId(null);
  };

  return (
    <div className="task-container">
      <div className="task-background">
        <form onSubmit={onSubmit} className="task-form">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="タスクを入力してください"
            required
            autoComplete="off"
            className="task-input"
          />
          <div className="select-button-wrapper">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="task-select"
            >
              <option value="通常">通常</option>
              <option value="重要">重要</option>
              <option value="緊急">緊急</option>
            </select>
            <button type="submit" disabled={isSubmitting} className="task-button">
              {isSubmitting ? "追加中..." : "追加"}
            </button>
          </div>
        </form>

        <Tabs value={tabIndex} onChange={handleTabChange} className="task-tabs">
          <Tab label="重要度別" />
          <Tab label="ユーザー別" />
        </Tabs>

        <div className="accordion-container">
          {tabIndex === 0 ? (
            ["緊急", "重要", "通常"].map((level) => (
              <Accordion
                className="content-accordion"
                key={level}
                expanded={openAccordions[level]}
                onChange={() => toggleAccordion(level)}
              >
                <AccordionSummary
                  className="content-summary"
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography className="content-title">{level}</Typography>
                </AccordionSummary>
                <AccordionDetails className="content-details">
                  <Box className="content-box">
                    {groupedTasks[level].length > 0 ? (
                      groupedTasks[level].map((task) => (
                        <div key={task.id} className="content-item">
                          <input
                            type="checkbox"
                            checked={!!checkedTasks[task.id]}
                            onChange={() => handleCheckboxChange(task.id)}
                            style={{ marginRight: "10px" }}
                          />
                          <div className="content-content">
                            <Typography className="content-user">
                              <span className="user-label">ユーザー:</span>{" "}
                              <strong>{task.user}</strong>
                            </Typography>
                            <Typography className="content-name">{task.name}</Typography>
                            <Typography className="content-time">
                              {task.createdAt
                                ? new Date(task.createdAt.seconds * 1000).toLocaleString()
                                : "日時不明"}
                            </Typography>
                          </div>
                          <button
                            onClick={() => handleDeleteClick(task.id)}
                            className="content-button"
                          >
                            削除
                          </button>
                        </div>
                      ))
                    ) : (
                      <Typography className="content-item no-border">
                        タスクがありません
                      </Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            Object.entries(groupedByUser).map(([user, userTasks]) => (
              <Accordion
                className="content-accordion"
                key={user}
                expanded={!!openUserAccordions[user]}
                onChange={() => toggleUserAccordion(user)}
              >
                <AccordionSummary
                  className="content-summary"
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography className="content-title">{user}</Typography>
                </AccordionSummary>
                <AccordionDetails className="content-details">
                  <Box className="content-box">
                    {userTasks.map((task) => (
                      <div key={task.id} className="content-item">
                        <input
                          type="checkbox"
                          checked={!!checkedTasks[task.id]}
                          onChange={() => handleCheckboxChange(task.id)}
                          style={{ marginRight: "10px" }}
                        />
                        <div className="content-content">
                          <Typography className="content-name">{task.name}</Typography>
                          <Typography className="content-priority">重要度: {task.priority}</Typography>
                          <Typography className="content-time">
                            {task.createdAt
                              ? new Date(task.createdAt.seconds * 1000).toLocaleString()
                              : "日時不明"}
                          </Typography>
                        </div>
                        <button
                          onClick={() => handleDeleteClick(task.id)}
                          className="content-button"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </div>

        {showConfirm && (
          <Confirm
            message="このタスクを本当に削除しますか？"
            onConfirm={handleConfirmYes}
            onCancel={handleConfirmNo}
          />
        )}
      </div>
    </div>
  );
}

export default Task;
