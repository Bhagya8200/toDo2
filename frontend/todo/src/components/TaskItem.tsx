import React, { useState } from "react";
import { Task } from "../../../../backend/src/entity/Task";
import { MoodType, TaskPriority } from "../../src/shared/types";
import CompletionMoodModal from "./CompletionMoodModal";

interface TaskItemProps {
  task: Task;
  onComplete: (id: string, mood: MoodType) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    title?: string,
    description?: string,
    priority?: TaskPriority
  ) => void;
  onToggleCompletion: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onDelete,
  onUpdate,
  onToggleCompletion,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const priorityColors = {
    [TaskPriority.LOW]: "bg-green-100 text-green-800",
    [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
    [TaskPriority.HIGH]: "bg-red-100 text-red-800",
  };

  const handleSave = () => {
    onUpdate(task.id, title, description || undefined, priority);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setIsEditing(false);
  };

  const handleComplete = () => {
    if (!task.completed) {
      setShowMoodModal(true);
    } else {
      // If already completed, toggle completion
      onToggleCompletion(task.id);
    }
  };

  const handleMoodSelect = (mood: MoodType) => {
    onComplete(task.id, mood);
    setShowMoodModal(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 slide-in">
        <div className="mb-2">
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
          />
        </div>
        <div className="mb-2">
          <textarea
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
          />
        </div>
        <div className="mb-4">
          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value={TaskPriority.LOW}>Low Priority</option>
            <option value={TaskPriority.MEDIUM}>Medium Priority</option>
            <option value={TaskPriority.HIGH}>High Priority</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white p-4 rounded-lg shadow-md mb-4 border-l-4 ${
          task.completed
            ? "border-green-500 opacity-75"
            : `border-${
                priority === TaskPriority.HIGH
                  ? "red"
                  : priority === TaskPriority.MEDIUM
                  ? "yellow"
                  : "green"
              }-500`
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleComplete}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              disabled={task.completed}
            />
            <div>
              <h3
                className={`text-lg font-medium ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`text-sm mt-1 ${
                    task.completed ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {task.description}
                </p>
              )}
              <div className="flex items-center mt-2 text-sm">
                <span className={`badge ${priorityColors[task.priority]}`}>
                  {task.priority.toLowerCase()} priority
                </span>
                <span className="ml-2 text-gray-500">{task.points} points</span>
                {task.completionMood && (
                  <span className="ml-2 text-gray-500">
                    Mood: {task.completionMood.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {!task.completed && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-500 hover:text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-red-500 hover:text-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {showMoodModal && (
        <CompletionMoodModal
          onSelect={handleMoodSelect}
          onCancel={() => setShowMoodModal(false)}
        />
      )}
    </>
  );
};

export default TaskItem;
