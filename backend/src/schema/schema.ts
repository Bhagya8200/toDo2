import { buildSchema } from "type-graphql";
import { TaskResolver } from "../resolvers/TaskResolver";
import { BadgeResolver } from "../resolvers/BadgeResolver";
import { UserStatsResolver } from "../resolvers/UserStatsResolver";

export const createSchema = async () => {
  return await buildSchema({
    resolvers: [TaskResolver, BadgeResolver, UserStatsResolver],
    emitSchemaFile: true,
    validate: true,
  });
};
