import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import Layout from "./components/Layout";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";
import UserStats from "./components/UserStats";
import BadgeDisplay from "./components/BadgeDisplay";
import ResetButton from "./components/ResetButton";
import { useTasks } from "./hooks/useTasks";
import { TaskPriority, MoodType } from "../src/shared/types";

// Create Apollo client
const client = new ApolloClient({
  uri: "http://localhost:4002/graphql",
  cache: new InMemoryCache(),
});

const TaskApp: React.FC = () => {
  const {
    tasks,
    userStats,
    badges,
    loading,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    resetEverything,
    toggleTaskCompletion,
  } = useTasks();

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">An error occurred: {error.message}</p>
      </div>
    );
  }

  const handleAddTask = (
    title: string,
    description: string,
    priority: TaskPriority
  ) => {
    createTask(title, description || undefined, priority);
  };

  const handleUpdateTask = (
    id: string,
    title?: string,
    description?: string,
    priority?: TaskPriority
  ) => {
    updateTask(id, title, description, priority);
  };

  const handleCompleteTask = (id: string, mood: MoodType) => {
    completeTask(id, mood);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleResetEverything = () => {
    resetEverything();
  };

  const handleToggleCompletion = (id: string) => {
    toggleTaskCompletion(id);
  };

  return (
    <div>
      <UserStats stats={userStats} loading={loading} />
      <BadgeDisplay badges={badges} loading={loading} />
      <AddTaskForm onAdd={handleAddTask} />
      <ResetButton onReset={handleResetEverything} />
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse h-24 bg-gray-200 rounded-lg"
            ></div>
          ))}
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onCompleteTask={handleCompleteTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
          onToggleCompletion={handleToggleCompletion}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Layout>
        <TaskApp />
      </Layout>
    </ApolloProvider>
  );
};

export default App;
