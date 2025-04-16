import { gql } from '@apollo/client';

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      description
      completed
      createdAt
      completedAt
      priority
      points
      completionMood
    }
  }
`;

export const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      id
      totalPoints
      tasksCompleted
      currentStreak
      longestStreak
      lastCompletedAt
    }
  }
`;

export const GET_BADGES = gql`
  query GetBadges {
    badges {
      id
      name
      description
      imageUrl
      requirement
      earnedAt
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String, $priority: String) {
    createTask(title: $title, description: $description, priority: $priority) {
      id
      title
      description
      priority
      points
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $priority: String) {
    updateTask(id: $id, title: $title, description: $description, priority: $priority) {
      id
      title
      description
      priority
      points
    }
  }
`;

export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: ID!, $mood: String!) {
    completeTask(id: $id, mood: $mood) {
      id
      completed
      completedAt
      completionMood
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;