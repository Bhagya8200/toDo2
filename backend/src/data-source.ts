import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Task } from "./entity/Task";
import { Badge } from "./entity/Badge";
import { UserStats } from "./entity/UserStats";
import "reflect-metadata";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [Task, Badge, UserStats],
});