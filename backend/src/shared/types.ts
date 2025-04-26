export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum MoodType {
  AWESOME = "AWESOME",
  GOOD = "GOOD",
  NEUTRAL = "NEUTRAL",
  BAD = "BAD",
  TERRIBLE = "TERRIBLE",
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  priority: TaskPriority;
  points: number;
  completionMood?: MoodType;
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requirement: string;
  earnedAt?: Date;
}

export interface IUserStats {
  id: string;
  totalPoints: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: Date;
}
