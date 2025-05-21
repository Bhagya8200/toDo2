import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";
import { Task } from "../entity/Task";
import { UserStats } from "../entity/UserStats";
import { Badge } from "../entity/Badge";
import { AppDataSource } from "../data-source";
import { MoodType, TaskPriority } from "../shared/types";
// import { Not, Raw } from "typeorm";

@Resolver(Task)
export class TaskResolver {
  @Query(() => [Task])
  async tasks(): Promise<Task[]> {
    return await AppDataSource.getRepository(Task).find({
      order: {
        completed: "ASC",
        createdAt: "DESC",
      },
    });
  }

  @Mutation(() => Boolean)
  async deleteAllTasks(): Promise<boolean> {
    await AppDataSource.getRepository(Task).clear();
    return true;
  }

  @Query(() => Task, { nullable: true })
  async task(@Arg("id", () => ID) id: string): Promise<Task | null> {
    return await AppDataSource.getRepository(Task).findOneBy({ id });
  }

  @Mutation(() => Task)
  async createTask(
    @Arg("title") title: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("priority", () => String, { nullable: true }) priority?: TaskPriority
  ): Promise<Task> {
    const pointsMap = {
      [TaskPriority.LOW]: 5,
      [TaskPriority.MEDIUM]: 10,
      [TaskPriority.HIGH]: 15,
    };

    const task = AppDataSource.getRepository(Task).create({
      title,
      description,
      priority: priority || TaskPriority.MEDIUM,
      points: pointsMap[priority || TaskPriority.MEDIUM],
    });

    return await AppDataSource.getRepository(Task).save(task);
  }

  @Mutation(() => Task)
  async updateTask(
    @Arg("id", () => ID) id: string,
    @Arg("title", { nullable: true }) title?: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("priority", () => String, { nullable: true }) priority?: TaskPriority
  ): Promise<Task> {
    const task = await AppDataSource.getRepository(Task).findOneBy({ id });

    if (!task) {
      throw new Error("Task not found");
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) {
      task.priority = priority;
      const pointsMap = {
        [TaskPriority.LOW]: 5,
        [TaskPriority.MEDIUM]: 10,
        [TaskPriority.HIGH]: 15,
      };
      task.points = pointsMap[priority];
    }

    return await AppDataSource.getRepository(Task).save(task);
  }

  @Mutation(() => Task)
  async completeTask(
    @Arg("id", () => ID) id: string,
    @Arg("mood", () => String) mood: MoodType
  ): Promise<Task> {
    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOneBy({ id });

    if (!task) {
      throw new Error("Task not found");
    }

    // Update task completion status
    task.completed = true;
    task.completedAt = new Date();
    task.completionMood = mood;
    await taskRepo.save(task);

    // Update user stats
    const statsRepo = AppDataSource.getRepository(UserStats);
    let stats = await statsRepo.findOne({ where: {} });

    if (!stats) {
      stats = statsRepo.create({
        totalPoints: 0,
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    }

    // Update stats
    stats.totalPoints += task.points;
    stats.tasksCompleted += 1;

    // Recalculate streak based on task completion history
    await this.recalculateStreak(stats);

    await statsRepo.save(stats);

    // Check for badges
    await this.checkForBadges(stats);

    return task;
  }

  @Mutation(() => Task)
  async deleteTask(@Arg("id", () => ID) id: string): Promise<Task> {
    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOneBy({ id });

    if (!task) {
      throw new Error("Task not found");
    }

    return await taskRepo.remove(task);
  }

  @Mutation(() => Boolean)
  async resetEverything(): Promise<boolean> {
    // Delete all tasks
    await AppDataSource.getRepository(Task).clear();

    // Delete all badges
    await AppDataSource.getRepository(Badge).clear();

    // Reset user stats
    const statsRepo = AppDataSource.getRepository(UserStats);
    let stats = await statsRepo.findOne({ where: {} });

    if (stats) {
      stats.totalPoints = 0;
      stats.tasksCompleted = 0;
      stats.currentStreak = 0;
      stats.longestStreak = 0;
      stats.lastCompletedAt = undefined;
      await statsRepo.save(stats);
    }

    return true;
  }

  @Mutation(() => Task)
  async toggleTaskCompletion(@Arg("id", () => ID) id: string): Promise<Task> {
    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOneBy({ id });

    if (!task) {
      throw new Error("Task not found");
    }

    // Get user stats to update them
    const statsRepo = AppDataSource.getRepository(UserStats);
    let stats = await statsRepo.findOne({ where: {} });

    if (!stats) {
      stats = statsRepo.create({
        totalPoints: 0,
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    }

    // If task is already completed, we need to undo the completion
    if (task.completed) {
      // Revert the points
      stats.totalPoints -= task.points;

      // Decrement completed tasks count
      stats.tasksCompleted = Math.max(0, stats.tasksCompleted - 1);

      // Update the task first
      task.completed = false;
      task.completedAt = undefined;
      task.completionMood = undefined;
      await taskRepo.save(task);
    } else {
      // This is basically a complete task without mood
      task.completed = true;
      task.completedAt = new Date();
      task.completionMood = MoodType.NEUTRAL; // Default mood

      // Update points and tasks completed
      stats.totalPoints += task.points;
      stats.tasksCompleted += 1;

      // Save the task first
      await taskRepo.save(task);
    }

    // Always recalculate streak after toggling task status
    await this.recalculateStreak(stats);
    await statsRepo.save(stats);

    // Always check for badges
    await this.checkForBadges(stats);

    return task;
  }

  /**
   * Recalculates the streak based on completed tasks
   */
  private async recalculateStreak(stats: UserStats): Promise<void> {
    const taskRepo = AppDataSource.getRepository(Task);

    // Get all completed tasks
    const completedTasks = await taskRepo.find({
      where: { completed: true },
      order: { completedAt: "DESC" },
    });

    if (completedTasks.length === 0) {
      // No completed tasks, reset streak
      stats.currentStreak = 0;
      stats.lastCompletedAt = undefined;
      stats.longestStreak = 0; // Reset longest streak if there are no completed tasks
      return;
    }

    // Group tasks by date (YYYY-MM-DD)
    const tasksByDay = new Map<string, boolean>();

    for (const task of completedTasks) {
      if (!task.completedAt) continue;

      // Get date string in YYYY-MM-DD format (using UTC to avoid timezone issues)
      const date = new Date(task.completedAt);
      const dateString = date.toISOString().split("T")[0];

      // Mark this day as having completed tasks
      tasksByDay.set(dateString, true);
    }

    // Get the most recent task completion date
    const mostRecentTask = completedTasks[0];
    if (!mostRecentTask.completedAt) {
      stats.currentStreak = 0;
      stats.lastCompletedAt = undefined;
      return;
    }

    // Set lastCompletedAt to the most recent completion
    stats.lastCompletedAt = new Date(mostRecentTask.completedAt);

    // Get today's date in the YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    // Calculate streak
    let currentStreak = 0;

    // Start from today and go back day by day
    let checkDate = new Date();
    let consecutiveDays = true;

    // Check today and go back up to a year
    for (let i = 0; i < 366 && consecutiveDays; i++) {
      // Format the current check date as YYYY-MM-DD
      const dateString = checkDate.toISOString().split("T")[0];

      if (tasksByDay.has(dateString)) {
        // If we have tasks completed on this day, increment streak
        currentStreak++;
      } else if (dateString === todayString) {
        // If it's today and no tasks are completed, that's okay - we don't break the streak
        // We just don't increment it
      } else {
        // For any other day with no completed tasks, streak is broken
        consecutiveDays = false;
      }

      // Move to the previous day
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Update the current streak
    stats.currentStreak = currentStreak;

    // Update longest streak if needed
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  }

  private async checkForBadges(stats: UserStats): Promise<void> {
    const badgeRepo = AppDataSource.getRepository(Badge);

    // Clear existing badges to reassess them
    await badgeRepo.clear();

    // Check tasks completed badges
    const tasksCompletedBadges = [
      {
        count: 1,
        name: "First Task",
        description: "Completed your first task!",
        imageUrl: "badge-first-task.svg",
      },
      {
        count: 5,
        name: "Getting Started",
        description: "Completed 5 tasks",
        imageUrl: "badge-getting-started.svg",
      },
      {
        count: 10,
        name: "On a Roll",
        description: "Completed 10 tasks",
        imageUrl: "badge-on-a-roll.svg",
      },
      {
        count: 25,
        name: "Task Master",
        description: "Completed 25 tasks",
        imageUrl: "badge-task-master.svg",
      },
      {
        count: 50,
        name: "Productivity Guru",
        description: "Completed 50 tasks",
        imageUrl: "badge-productivity-guru.svg",
      },
      {
        count: 100,
        name: "Centurion",
        description: "Completed 100 tasks",
        imageUrl: "badge-centurion.svg",
      },
    ];

    for (const badgeInfo of tasksCompletedBadges) {
      if (stats.tasksCompleted >= badgeInfo.count) {
        const badge = badgeRepo.create({
          ...badgeInfo,
          requirement: `Complete ${badgeInfo.count} tasks`,
          earnedAt: new Date(),
        });
        await badgeRepo.save(badge);
      }
    }

    // Check streak badges
    const streakBadges = [
      {
        count: 3,
        name: "Consistent",
        description: "Maintained a 3-day streak",
        imageUrl: "badge-consistent.svg",
      },
      {
        count: 7,
        name: "Weekly Warrior",
        description: "Maintained a 7-day streak",
        imageUrl: "badge-weekly.svg",
      },
      {
        count: 14,
        name: "Fortnight Focus",
        description: "Maintained a 14-day streak",
        imageUrl: "badge-fortnight.svg",
      },
      {
        count: 30,
        name: "Monthly Master",
        description: "Maintained a 30-day streak",
        imageUrl: "badge-monthly.svg",
      },
    ];

    for (const badgeInfo of streakBadges) {
      if (stats.longestStreak >= badgeInfo.count) {
        const badge = badgeRepo.create({
          ...badgeInfo,
          requirement: `Maintain a ${badgeInfo.count}-day streak`,
          earnedAt: new Date(),
        });
        await badgeRepo.save(badge);
      }
    }

    // Check points badges
    const pointsBadges = [
      {
        count: 100,
        name: "Century",
        description: "Earned 100 points",
        imageUrl: "badge-century.svg",
      },
      {
        count: 500,
        name: "Big Achiever",
        description: "Earned 500 points",
        imageUrl: "badge-achiever.svg",
      },
      {
        count: 1000,
        name: "Millennial",
        description: "Earned 1000 points",
        imageUrl: "badge-millennial.svg",
      },
    ];

    for (const badgeInfo of pointsBadges) {
      if (stats.totalPoints >= badgeInfo.count) {
        const badge = badgeRepo.create({
          ...badgeInfo,
          requirement: `Earn ${badgeInfo.count} points`,
          earnedAt: new Date(),
        });
        await badgeRepo.save(badge);
      }
    }
  }
}
