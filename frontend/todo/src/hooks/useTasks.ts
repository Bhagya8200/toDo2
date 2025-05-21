import { useQuery, useMutation } from "@apollo/client";
import {
  GET_TASKS,
  GET_USER_STATS,
  GET_BADGES,
  CREATE_TASK,
  UPDATE_TASK,
  COMPLETE_TASK,
  DELETE_TASK,
  RESET_EVERYTHING,
  TOGGLE_TASK_COMPLETION,
} from "../graphql/resolvers";

export const useTasks = () => {
  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery(GET_TASKS);
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery(GET_USER_STATS);
  const {
    data: badgesData,
    loading: badgesLoading,
    error: badgesError,
    refetch: refetchBadges,
  } = useQuery(GET_BADGES);

  const [createTaskMutation] = useMutation(CREATE_TASK, {
    onCompleted: () => {
      refetchTasks();
    },
  });

  const [updateTaskMutation] = useMutation(UPDATE_TASK, {
    onCompleted: () => {
      refetchTasks();
    },
  });

  const [completeTaskMutation] = useMutation(COMPLETE_TASK, {
    onCompleted: () => {
      refetchTasks();
      refetchStats();
      refetchBadges();
    },
  });

  const [deleteTaskMutation] = useMutation(DELETE_TASK, {
    onCompleted: () => {
      refetchTasks();
    },
  });

  const [resetEverythingMutation] = useMutation(RESET_EVERYTHING, {
    onCompleted: () => {
      refetchTasks();
      refetchStats();
      refetchBadges();
    },
  });

  const [toggleTaskCompletionMutation] = useMutation(TOGGLE_TASK_COMPLETION, {
    onCompleted: () => {
      refetchTasks();
      refetchStats();
      refetchBadges(); // Add this line to refresh badges when toggling task completion
    },
  });

  const createTask = (
    title: string,
    description?: string,
    priority?: string
  ) => {
    return createTaskMutation({
      variables: { title, description, priority },
    });
  };

  const updateTask = (
    id: string,
    title?: string,
    description?: string,
    priority?: string
  ) => {
    return updateTaskMutation({
      variables: { id, title, description, priority },
    });
  };

  const completeTask = (id: string, mood: string) => {
    return completeTaskMutation({
      variables: { id, mood },
    });
  };

  const deleteTask = (id: string) => {
    return deleteTaskMutation({
      variables: { id },
    });
  };

  const resetEverything = () => {
    return resetEverythingMutation();
  };

  const toggleTaskCompletion = (id: string) => {
    return toggleTaskCompletionMutation({
      variables: { id },
    });
  };

  return {
    tasks: tasksData?.tasks || [],
    userStats: statsData?.userStats,
    badges: badgesData?.badges || [],
    loading: tasksLoading || statsLoading || badgesLoading,
    error: tasksError || statsError || badgesError,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    resetEverything,
    toggleTaskCompletion,
  };
};
