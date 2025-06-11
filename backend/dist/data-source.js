"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const Task_1 = require("./entity/Task");
const Badge_1 = require("./entity/Badge");
const UserStats_1 = require("./entity/UserStats");
require("reflect-metadata");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [Task_1.Task, Badge_1.Badge, UserStats_1.UserStats],
});
//# sourceMappingURL=data-source.js.map