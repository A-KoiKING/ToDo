import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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

  const groupedTasks = {
    通常: tasks.filter((task) => task.priority === "通常"),
    重要: tasks.filter((task) => task.priority === "重要"),
    緊急: tasks.filter((task) => task.priority === "緊急"),
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
        </form>

        <div className="accordion-container">
          {["緊急", "重要", "通常"].map((level) => (
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
                        <div className="content-content">
                          <Typography className="content-name">
                            {task.user} : {task.name}
                          </Typography>
                          <Typography className="content-time">
                            {task.createdAt
                              ? new Date(task.createdAt.seconds * 1000).toLocaleString()
                              : "日時不明"}
                          </Typography>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="task-button"
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default Task;