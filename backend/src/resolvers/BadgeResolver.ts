import { Resolver, Query } from "type-graphql";
import { Badge } from "../entity/Badge";
import { AppDataSource } from "../data-source";

@Resolver(Badge)
export class BadgeResolver {
  @Query(() => [Badge])
  async badges(): Promise<Badge[]> {
    return await AppDataSource.getRepository(Badge).find({
      order: {
        earnedAt: "DESC"
      }
    });
  }
}
