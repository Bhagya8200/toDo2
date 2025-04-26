import React from "react";
import { Task } from ".../../../../../backend/src/entity/Task";
import { MoodType, TaskPriority } from "../../src/shared/types";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (id: string, mood: MoodType) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (
    id: string,
    title?: string,
    description?: string,
    priority?: TaskPriority
  ) => void;
  onToggleCompletion: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onCompleteTask,
  onDeleteTask,
  onUpdateTask,
  onToggleCompletion,
}) => {
  // Split tasks into active and completed
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No tasks yet. Add your first task above!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">
        Active Tasks ({activeTasks.length})
      </h2>
      {activeTasks.length === 0 ? (
        <p className="text-gray-500 mb-6">
          You've completed all your tasks. Great job!
        </p>
      ) : (
        <div className="mb-6">
          {activeTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onCompleteTask}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
              onToggleCompletion={onToggleCompletion}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3">
            Completed Tasks ({completedTasks.length})
          </h2>
          <div>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
                onUpdate={onUpdateTask}
                onToggleCompletion={onToggleCompletion} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskList;
