import { Resolver, Query } from "type-graphql";
import { UserStats } from "../entity/UserStats";
import { AppDataSource } from "../data-source";

@Resolver(UserStats)
export class UserStatsResolver {
  @Query(() => UserStats, { nullable: true })
  async userStats(): Promise<UserStats | null> {
    let stats = await AppDataSource.getRepository(UserStats).findOne({ where: {} });
    
    if (!stats) {
      stats = AppDataSource.getRepository(UserStats).create({
        totalPoints: 0,
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0
      });
      await AppDataSource.getRepository(UserStats).save(stats);
    }
    
    return stats;
  }
}