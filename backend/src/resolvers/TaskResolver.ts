// import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";
// import { Task } from "../entity/Task";
// import { UserStats } from "../entity/UserStats";
// import { Badge } from "../entity/Badge";
// import { AppDataSource } from "../data-source";
// import { MoodType, TaskPriority } from "../shared/types";
// import { Not, Raw } from "typeorm";

// @Resolver(Task)
// export class TaskResolver {
//   @Query(() => [Task])
//   async tasks(): Promise<Task[]> {
//     return await AppDataSource.getRepository(Task).find({
//       order: {
//         completed: "ASC",
//         createdAt: "DESC",
//       },
//     });
//   }

//   @Mutation(() => Boolean)
//   async deleteAllTasks(): Promise<boolean> {
//     await AppDataSource.getRepository(Task).clear();
//     return true;
//   }

//   @Query(() => Task, { nullable: true })
//   async task(@Arg("id", () => ID) id: string): Promise<Task | null> {
//     return await AppDataSource.getRepository(Task).findOneBy({ id });
//   }

//   @Mutation(() => Task)
//   async createTask(
//     @Arg("title") title: string,
//     @Arg("description", { nullable: true }) description?: string,
//     @Arg("priority", () => String, { nullable: true }) priority?: TaskPriority
//   ): Promise<Task> {
//     const pointsMap = {
//       [TaskPriority.LOW]: 5,
//       [TaskPriority.MEDIUM]: 10,
//       [TaskPriority.HIGH]: 15,
//     };

//     const task = AppDataSource.getRepository(Task).create({
//       title,
//       description,
//       priority: priority || TaskPriority.MEDIUM,
//       points: pointsMap[priority || TaskPriority.MEDIUM],
//     });

//     return await AppDataSource.getRepository(Task).save(task);
//   }

//   @Mutation(() => Task)
//   async updateTask(
//     @Arg("id", () => ID) id: string,
//     @Arg("title", { nullable: true }) title?: string,
//     @Arg("description", { nullable: true }) description?: string,
//     @Arg("priority", () => String, { nullable: true }) priority?: TaskPriority
//   ): Promise<Task> {
//     const task = await AppDataSource.getRepository(Task).findOneBy({ id });

//     if (!task) {
//       throw new Error("Task not found");
//     }

//     if (title !== undefined) task.title = title;
//     if (description !== undefined) task.description = description;
//     if (priority !== undefined) {
//       task.priority = priority;
//       const pointsMap = {
//         [TaskPriority.LOW]: 5,
//         [TaskPriority.MEDIUM]: 10,
//         [TaskPriority.HIGH]: 15,
//       };
//       task.points = pointsMap[priority];
//     }

//     return await AppDataSource.getRepository(Task).save(task);
//   }

//   @Mutation(() => Task)
//   async completeTask(
//     @Arg("id", () => ID) id: string,
//     @Arg("mood", () => String) mood: MoodType
//   ): Promise<Task> {
//     const taskRepo = AppDataSource.getRepository(Task);
//     const task = await taskRepo.findOneBy({ id });

//     if (!task) {
//       throw new Error("Task not found");
//     }

//     // Update task completion status
//     task.completed = true;
//     task.completedAt = new Date();
//     task.completionMood = mood;
//     await taskRepo.save(task);

//     // Update user stats
//     const statsRepo = AppDataSource.getRepository(UserStats);
//     let stats = await statsRepo.findOne({ where: {} });

//     if (!stats) {
//       stats = statsRepo.create({
//         totalPoints: 0,
//         tasksCompleted: 0,
//         currentStreak: 0,
//         longestStreak: 0,
//       });
//     }

//     // Update stats
//     stats.totalPoints += task.points;
//     stats.tasksCompleted += 1;

//     // Update streak
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const lastCompleted = stats.lastCompletedAt
//       ? new Date(stats.lastCompletedAt)
//       : null;
//     if (lastCompleted) {
//       lastCompleted.setHours(0, 0, 0, 0);

//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);

//       if (lastCompleted.getTime() === yesterday.getTime()) {
//         // Completed a task yesterday, increment streak
//         stats.currentStreak += 1;
//       } else if (lastCompleted.getTime() !== today.getTime()) {
//         // Didn't complete a task yesterday and haven't completed one today, reset streak
//         stats.currentStreak = 1;
//       }
//     } else {
//       // First completed task ever
//       stats.currentStreak = 1;
//     }

//     stats.lastCompletedAt = new Date();

//     // Update longest streak if needed
//     if (stats.currentStreak > stats.longestStreak) {
//       stats.longestStreak = stats.currentStreak;
//     }

//     await statsRepo.save(stats);

//     // Check for badges
//     await this.checkForBadges(stats);

//     return task;
//   }

//   @Mutation(() => Task)
//   async deleteTask(@Arg("id", () => ID) id: string): Promise<Task> {
//     const taskRepo = AppDataSource.getRepository(Task);
//     const task = await taskRepo.findOneBy({ id });

//     if (!task) {
//       throw new Error("Task not found");
//     }

//     return await taskRepo.remove(task);
//   }

//   // In backend/src/resolvers/TaskResolver.ts

//   // Add these new mutations
//   @Mutation(() => Boolean)
//   async resetEverything(): Promise<boolean> {
//     // Delete all tasks
//     await AppDataSource.getRepository(Task).clear();

//     // Delete all badges
//     await AppDataSource.getRepository(Badge).clear();

//     // Reset user stats
//     const statsRepo = AppDataSource.getRepository(UserStats);
//     let stats = await statsRepo.findOne({ where: {} });

//     if (stats) {
//       stats.totalPoints = 0;
//       stats.tasksCompleted = 0;
//       stats.currentStreak = 0;
//       stats.longestStreak = 0;
//       stats.lastCompletedAt = undefined;
//       await statsRepo.save(stats);
//     }

//     return true;
//   }

//   @Mutation(() => Task)
//   async toggleTaskCompletion(@Arg("id", () => ID) id: string): Promise<Task> {
//     const taskRepo = AppDataSource.getRepository(Task);
//     const task = await taskRepo.findOneBy({ id });

//     if (!task) {
//       throw new Error("Task not found");
//     }

//     // If task is already completed, we need to undo the completion
//     if (task.completed) {
//       // Get user stats to update them
//       const statsRepo = AppDataSource.getRepository(UserStats);
//       let stats = await statsRepo.findOne({ where: {} });

//       if (stats) {
//         // Revert the points
//         stats.totalPoints -= task.points;

//         // Decrement completed tasks count
//         stats.tasksCompleted = Math.max(0, stats.tasksCompleted - 1);

//         // Handle streak if this was the only task completed today
//         // This is a simplified approach - for a real app you'd want to check if
//         // other tasks were completed on the same day before affecting streaks
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const completedAt = task.completedAt
//           ? new Date(task.completedAt)
//           : null;
//         if (completedAt) {
//           completedAt.setHours(0, 0, 0, 0);

//           // If this was completed today and it was the task keeping the streak
//           if (completedAt.getTime() === today.getTime()) {
//             // Check if there are other tasks completed today
//             const otherTasksCompletedToday = await taskRepo.count({
//               where: {
//                 completed: true,
//                 id: Not(id), // Not this task
//                 completedAt: Raw((alias) => `DATE(${alias}) = CURRENT_DATE`),
//               },
//             });

//             // If no other tasks completed today, we might need to adjust the streak
//             if (otherTasksCompletedToday === 0) {
//               // For simplicity, we'll just decrement the streak
//               // A more complex implementation would check previous days
//               stats.currentStreak = Math.max(0, stats.currentStreak - 1);
//             }
//           }
//         }

//         await statsRepo.save(stats);
//       }

//       // Update the task
//       task.completed = false;
//       task.completedAt = undefined;
//       task.completionMood = undefined;
//     }

//     return await taskRepo.save(task);
//   }

//   private async checkForBadges(stats: UserStats): Promise<void> {
//     const badgeRepo = AppDataSource.getRepository(Badge);

//     // Check tasks completed badges
//     const tasksCompletedBadges = [
//       {
//         count: 1,
//         name: "First Task",
//         description: "Completed your first task!",
//         imageUrl: "badge-first-task.svg",
//       },
//       {
//         count: 5,
//         name: "Getting Started",
//         description: "Completed 5 tasks",
//         imageUrl: "badge-getting-started.svg",
//       },
//       {
//         count: 10,
//         name: "On a Roll",
//         description: "Completed 10 tasks",
//         imageUrl: "badge-on-a-roll.svg",
//       },
//       {
//         count: 25,
//         name: "Task Master",
//         description: "Completed 25 tasks",
//         imageUrl: "badge-task-master.svg",
//       },
//       {
//         count: 50,
//         name: "Productivity Guru",
//         description: "Completed 50 tasks",
//         imageUrl: "badge-productivity-guru.svg",
//       },
//       {
//         count: 100,
//         name: "Centurion",
//         description: "Completed 100 tasks",
//         imageUrl: "badge-centurion.svg",
//       },
//     ];

//     for (const badgeInfo of tasksCompletedBadges) {
//       if (stats.tasksCompleted >= badgeInfo.count) {
//         const existingBadge = await badgeRepo.findOne({
//           where: { name: badgeInfo.name },
//         });
//         if (!existingBadge) {
//           const badge = badgeRepo.create({
//             ...badgeInfo,
//             requirement: `Complete ${badgeInfo.count} tasks`,
//             earnedAt: new Date(),
//           });
//           await badgeRepo.save(badge);
//         }
//       }
//     }

//     // Check streak badges
//     const streakBadges = [
//       {
//         count: 3,
//         name: "Consistent",
//         description: "Maintained a 3-day streak",
//         imageUrl: "badge-consistent.svg",
//       },
//       {
//         count: 7,
//         name: "Weekly Warrior",
//         description: "Maintained a 7-day streak",
//         imageUrl: "badge-weekly.svg",
//       },
//       {
//         count: 14,
//         name: "Fortnight Focus",
//         description: "Maintained a 14-day streak",
//         imageUrl: "badge-fortnight.svg",
//       },
//       {
//         count: 30,
//         name: "Monthly Master",
//         description: "Maintained a 30-day streak",
//         imageUrl: "badge-monthly.svg",
//       },
//     ];

//     for (const badgeInfo of streakBadges) {
//       if (stats.longestStreak >= badgeInfo.count) {
//         const existingBadge = await badgeRepo.findOne({
//           where: { name: badgeInfo.name },
//         });
//         if (!existingBadge) {
//           const badge = badgeRepo.create({
//             ...badgeInfo,
//             requirement: `Maintain a ${badgeInfo.count}-day streak`,
//             earnedAt: new Date(),
//           });
//           await badgeRepo.save(badge);
//         }
//       }
//     }

//     // Check points badges
//     const pointsBadges = [
//       {
//         count: 100,
//         name: "Century",
//         description: "Earned 100 points",
//         imageUrl: "badge-century.svg",
//       },
//       {
//         count: 500,
//         name: "Big Achiever",
//         description: "Earned 500 points",
//         imageUrl: "badge-achiever.svg",
//       },
//       {
//         count: 1000,
//         name: "Millennial",
//         description: "Earned 1000 points",
//         imageUrl: "badge-millennial.svg",
//       },
//     ];

//     for (const badgeInfo of pointsBadges) {
//       if (stats.totalPoints >= badgeInfo.count) {
//         const existingBadge = await badgeRepo.findOne({
//           where: { name: badgeInfo.name },
//         });
//         if (!existingBadge) {
//           const badge = badgeRepo.create({
//             ...badgeInfo,
//             requirement: `Earn ${badgeInfo.count} points`,
//             earnedAt: new Date(),
//           });
//           await badgeRepo.save(badge);
//         }
//       }
//     }
//   }
// }

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

    // Update streak
    await this.updateStreak(stats);

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

    // If task is already completed, we need to undo the completion
    if (task.completed) {
      // Get user stats to update them
      const statsRepo = AppDataSource.getRepository(UserStats);
      let stats = await statsRepo.findOne({ where: {} });

      if (stats) {
        // Revert the points
        stats.totalPoints -= task.points;

        // Decrement completed tasks count
        stats.tasksCompleted = Math.max(0, stats.tasksCompleted - 1);

        // Update the streak based on the most recent completed tasks
        await this.recalculateStatsAfterUncompletion(stats);

        await statsRepo.save(stats);

        // Reassess badges
        await this.checkForBadges(stats);
      }

      // Update the task
      task.completed = false;
      task.completedAt = undefined;
      task.completionMood = undefined;
    }

    return await taskRepo.save(task);
  }

  private async updateStreak(stats: UserStats): Promise<void> {
    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompleted = stats.lastCompletedAt
      ? new Date(stats.lastCompletedAt)
      : null;

    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastCompleted.getTime() === yesterday.getTime()) {
        // Completed a task yesterday, increment streak
        stats.currentStreak += 1;
      } else if (lastCompleted.getTime() !== today.getTime()) {
        // Didn't complete a task yesterday and haven't completed one today, reset streak
        stats.currentStreak = 1;
      }
    } else {
      // First completed task ever
      stats.currentStreak = 1;
    }

    stats.lastCompletedAt = new Date();

    // Update longest streak if needed
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  }

  private async recalculateStatsAfterUncompletion(
    stats: UserStats
  ): Promise<void> {
    const taskRepo = AppDataSource.getRepository(Task);

    // Get all completed tasks
    const completedTasks = await taskRepo.find({
      where: { completed: true },
      order: { completedAt: "DESC" },
    });

    if (completedTasks.length === 0) {
      // No completed tasks left, reset streak
      stats.currentStreak = 0;
      stats.lastCompletedAt = undefined;
      return;
    }

    // Most recent task completion date
    const lastCompletedTask = completedTasks[0];
    stats.lastCompletedAt = lastCompletedTask.completedAt;

    // Group completed tasks by day
    const tasksByDay = new Map<string, number>();

    for (const task of completedTasks) {
      if (!task.completedAt) continue;

      const date = new Date(task.completedAt);
      const dateString = date.toISOString().split("T")[0];

      const count = tasksByDay.get(dateString) || 0;
      tasksByDay.set(dateString, count + 1);
    }

    // Sort dates in descending order
    // const dates = Array.from(tasksByDay.keys()).sort().reverse();

    // Calculate current streak based on consecutive days
    let currentStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    // Check if there's an entry for today
    if (tasksByDay.has(todayString)) {
      currentStreak = 1;

      // Check consecutive previous days
      for (let i = 1; i <= 365; i++) {
        // Limit to a year of history
        const previousDate = new Date(today);
        previousDate.setDate(previousDate.getDate() - i);
        const previousDateString = previousDate.toISOString().split("T")[0];

        if (tasksByDay.has(previousDateString)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // No tasks completed today, check if there were any yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      if (tasksByDay.has(yesterdayString)) {
        currentStreak = 1;

        // Check consecutive days before yesterday
        for (let i = 2; i <= 365; i++) {
          // Limit to a year of history
          const previousDate = new Date(today);
          previousDate.setDate(previousDate.getDate() - i);
          const previousDateString = previousDate.toISOString().split("T")[0];

          if (tasksByDay.has(previousDateString)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    stats.currentStreak = currentStreak;

    // Update longest streak if current streak is still longer
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  }

  private async checkForBadges(stats: UserStats): Promise<void> {
    const badgeRepo = AppDataSource.getRepository(Badge);

    // Remove all unearned badges first to reassess them
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
