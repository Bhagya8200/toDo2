import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";
import { Task } from "../entity/Task";
import { UserStats } from "../entity/UserStats";
import { Badge } from "../entity/Badge";
import { AppDataSource } from "../data-source";
import { MoodType, TaskPriority } from "../shared/types";

@Resolver(Task)
export class TaskResolver {
  @Query(() => [Task])
  async tasks(): Promise<Task[]> {
    return await AppDataSource.getRepository(Task).find({
      order: {
        completed: "ASC",
        createdAt: "DESC"
      }
    });
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
      [TaskPriority.HIGH]: 15
    };

    const task = AppDataSource.getRepository(Task).create({
      title,
      description,
      priority: priority || TaskPriority.MEDIUM,
      points: pointsMap[priority || TaskPriority.MEDIUM]
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
        [TaskPriority.HIGH]: 15
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
        longestStreak: 0
      });
    }

    // Update stats
    stats.totalPoints += task.points;
    stats.tasksCompleted += 1;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCompleted = stats.lastCompletedAt ? new Date(stats.lastCompletedAt) : null;
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

  private async checkForBadges(stats: UserStats): Promise<void> {
    const badgeRepo = AppDataSource.getRepository(Badge);
    
    // Check tasks completed badges
    const tasksCompletedBadges = [
      { count: 1, name: "First Task", description: "Completed your first task!", imageUrl: "badge-first-task.svg" },
      { count: 5, name: "Getting Started", description: "Completed 5 tasks", imageUrl: "badge-getting-started.svg" },
      { count: 10, name: "On a Roll", description: "Completed 10 tasks", imageUrl: "badge-on-a-roll.svg" },
      { count: 25, name: "Task Master", description: "Completed 25 tasks", imageUrl: "badge-task-master.svg" },
      { count: 50, name: "Productivity Guru", description: "Completed 50 tasks", imageUrl: "badge-productivity-guru.svg" },
      { count: 100, name: "Centurion", description: "Completed 100 tasks", imageUrl: "badge-centurion.svg" }
    ];

    for (const badgeInfo of tasksCompletedBadges) {
      if (stats.tasksCompleted >= badgeInfo.count) {
        const existingBadge = await badgeRepo.findOne({ where: { name: badgeInfo.name } });
        if (!existingBadge) {
          const badge = badgeRepo.create({
            ...badgeInfo,
            requirement: `Complete ${badgeInfo.count} tasks`,
            earnedAt: new Date()
          });
          await badgeRepo.save(badge);
        }
      }
    }

    // Check streak badges
    const streakBadges = [
      { count: 3, name: "Consistent", description: "Maintained a 3-day streak", imageUrl: "badge-consistent.svg" },
      { count: 7, name: "Weekly Warrior", description: "Maintained a 7-day streak", imageUrl: "badge-weekly.svg" },
      { count: 14, name: "Fortnight Focus", description: "Maintained a 14-day streak", imageUrl: "badge-fortnight.svg" },
      { count: 30, name: "Monthly Master", description: "Maintained a 30-day streak", imageUrl: "badge-monthly.svg" }
    ];

    for (const badgeInfo of streakBadges) {
      if (stats.longestStreak >= badgeInfo.count) {
        const existingBadge = await badgeRepo.findOne({ where: { name: badgeInfo.name } });
        if (!existingBadge) {
          const badge = badgeRepo.create({
            ...badgeInfo,
            requirement: `Maintain a ${badgeInfo.count}-day streak`,
            earnedAt: new Date()
          });
          await badgeRepo.save(badge);
        }
      }
    }

    // Check points badges
    const pointsBadges = [
      { count: 100, name: "Century", description: "Earned 100 points", imageUrl: "badge-century.svg" },
      { count: 500, name: "Big Achiever", description: "Earned 500 points", imageUrl: "badge-achiever.svg" },
      { count: 1000, name: "Millennial", description: "Earned 1000 points", imageUrl: "badge-millennial.svg" }
    ];

    for (const badgeInfo of pointsBadges) {
      if (stats.totalPoints >= badgeInfo.count) {
        const existingBadge = await badgeRepo.findOne({ where: { name: badgeInfo.name } });
        if (!existingBadge) {
          const badge = badgeRepo.create({
            ...badgeInfo,
            requirement: `Earn ${badgeInfo.count} points`,
            earnedAt: new Date()
          });
          await badgeRepo.save(badge);
        }
      }
    }
  }
}
