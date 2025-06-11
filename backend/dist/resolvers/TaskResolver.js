"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Task_1 = require("../entity/Task");
const UserStats_1 = require("../entity/UserStats");
const Badge_1 = require("../entity/Badge");
const data_source_1 = require("../data-source");
const types_1 = require("../shared/types");
let TaskResolver = class TaskResolver {
    tasks() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield data_source_1.AppDataSource.getRepository(Task_1.Task).find({
                order: {
                    completed: "ASC",
                    createdAt: "DESC",
                },
            });
        });
    }
    deleteAllTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            yield data_source_1.AppDataSource.getRepository(Task_1.Task).clear();
            return true;
        });
    }
    task(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield data_source_1.AppDataSource.getRepository(Task_1.Task).findOneBy({ id });
        });
    }
    createTask(title, description, priority) {
        return __awaiter(this, void 0, void 0, function* () {
            const pointsMap = {
                [types_1.TaskPriority.LOW]: 5,
                [types_1.TaskPriority.MEDIUM]: 10,
                [types_1.TaskPriority.HIGH]: 15,
            };
            const task = data_source_1.AppDataSource.getRepository(Task_1.Task).create({
                title,
                description,
                priority: priority || types_1.TaskPriority.MEDIUM,
                points: pointsMap[priority || types_1.TaskPriority.MEDIUM],
            });
            return yield data_source_1.AppDataSource.getRepository(Task_1.Task).save(task);
        });
    }
    updateTask(id, title, description, priority) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield data_source_1.AppDataSource.getRepository(Task_1.Task).findOneBy({ id });
            if (!task) {
                throw new Error("Task not found");
            }
            if (title !== undefined)
                task.title = title;
            if (description !== undefined)
                task.description = description;
            if (priority !== undefined) {
                task.priority = priority;
                const pointsMap = {
                    [types_1.TaskPriority.LOW]: 5,
                    [types_1.TaskPriority.MEDIUM]: 10,
                    [types_1.TaskPriority.HIGH]: 15,
                };
                task.points = pointsMap[priority];
            }
            return yield data_source_1.AppDataSource.getRepository(Task_1.Task).save(task);
        });
    }
    completeTask(id, mood) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
            const task = yield taskRepo.findOneBy({ id });
            if (!task) {
                throw new Error("Task not found");
            }
            task.completed = true;
            task.completedAt = new Date();
            task.completionMood = mood;
            yield taskRepo.save(task);
            const statsRepo = data_source_1.AppDataSource.getRepository(UserStats_1.UserStats);
            let stats = yield statsRepo.findOne({ where: {} });
            if (!stats) {
                stats = statsRepo.create({
                    totalPoints: 0,
                    tasksCompleted: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                });
            }
            stats.totalPoints += task.points;
            stats.tasksCompleted += 1;
            yield this.recalculateStreak(stats);
            yield statsRepo.save(stats);
            yield this.checkForBadges(stats);
            return task;
        });
    }
    deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
            const task = yield taskRepo.findOneBy({ id });
            if (!task) {
                throw new Error("Task not found");
            }
            return yield taskRepo.remove(task);
        });
    }
    resetEverything() {
        return __awaiter(this, void 0, void 0, function* () {
            yield data_source_1.AppDataSource.getRepository(Task_1.Task).clear();
            yield data_source_1.AppDataSource.getRepository(Badge_1.Badge).clear();
            const statsRepo = data_source_1.AppDataSource.getRepository(UserStats_1.UserStats);
            let stats = yield statsRepo.findOne({ where: {} });
            if (stats) {
                stats.totalPoints = 0;
                stats.tasksCompleted = 0;
                stats.currentStreak = 0;
                stats.longestStreak = 0;
                stats.lastCompletedAt = undefined;
                yield statsRepo.save(stats);
            }
            return true;
        });
    }
    toggleTaskCompletion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
            const task = yield taskRepo.findOneBy({ id });
            if (!task) {
                throw new Error("Task not found");
            }
            const statsRepo = data_source_1.AppDataSource.getRepository(UserStats_1.UserStats);
            let stats = yield statsRepo.findOne({ where: {} });
            if (!stats) {
                stats = statsRepo.create({
                    totalPoints: 0,
                    tasksCompleted: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                });
            }
            if (task.completed) {
                stats.totalPoints -= task.points;
                stats.tasksCompleted = Math.max(0, stats.tasksCompleted - 1);
                task.completed = false;
                task.completedAt = undefined;
                task.completionMood = undefined;
                yield taskRepo.save(task);
            }
            else {
                task.completed = true;
                task.completedAt = new Date();
                task.completionMood = types_1.MoodType.NEUTRAL;
                stats.totalPoints += task.points;
                stats.tasksCompleted += 1;
                yield taskRepo.save(task);
            }
            yield this.recalculateStreak(stats);
            yield statsRepo.save(stats);
            yield this.checkForBadges(stats);
            return task;
        });
    }
    recalculateStreak(stats) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
            const completedTasks = yield taskRepo.find({
                where: { completed: true },
                order: { completedAt: "DESC" },
            });
            if (completedTasks.length === 0) {
                stats.currentStreak = 0;
                stats.lastCompletedAt = undefined;
                stats.longestStreak = 0;
                return;
            }
            const tasksByDay = new Map();
            for (const task of completedTasks) {
                if (!task.completedAt)
                    continue;
                const date = new Date(task.completedAt);
                const dateString = date.toISOString().split("T")[0];
                tasksByDay.set(dateString, true);
            }
            const mostRecentTask = completedTasks[0];
            if (!mostRecentTask.completedAt) {
                stats.currentStreak = 0;
                stats.lastCompletedAt = undefined;
                return;
            }
            stats.lastCompletedAt = new Date(mostRecentTask.completedAt);
            const today = new Date();
            const todayString = today.toISOString().split("T")[0];
            let currentStreak = 0;
            let checkDate = new Date();
            let consecutiveDays = true;
            for (let i = 0; i < 366 && consecutiveDays; i++) {
                const dateString = checkDate.toISOString().split("T")[0];
                if (tasksByDay.has(dateString)) {
                    currentStreak++;
                }
                else if (dateString === todayString) {
                }
                else {
                    consecutiveDays = false;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }
            stats.currentStreak = currentStreak;
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
        });
    }
    checkForBadges(stats) {
        return __awaiter(this, void 0, void 0, function* () {
            const badgeRepo = data_source_1.AppDataSource.getRepository(Badge_1.Badge);
            yield badgeRepo.clear();
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
                    const badge = badgeRepo.create(Object.assign(Object.assign({}, badgeInfo), { requirement: `Complete ${badgeInfo.count} tasks`, earnedAt: new Date() }));
                    yield badgeRepo.save(badge);
                }
            }
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
                    const badge = badgeRepo.create(Object.assign(Object.assign({}, badgeInfo), { requirement: `Maintain a ${badgeInfo.count}-day streak`, earnedAt: new Date() }));
                    yield badgeRepo.save(badge);
                }
            }
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
                    const badge = badgeRepo.create(Object.assign(Object.assign({}, badgeInfo), { requirement: `Earn ${badgeInfo.count} points`, earnedAt: new Date() }));
                    yield badgeRepo.save(badge);
                }
            }
        });
    }
};
exports.TaskResolver = TaskResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [Task_1.Task]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "tasks", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "deleteAllTasks", null);
__decorate([
    (0, type_graphql_1.Query)(() => Task_1.Task, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.ID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "task", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Task_1.Task),
    __param(0, (0, type_graphql_1.Arg)("title")),
    __param(1, (0, type_graphql_1.Arg)("description", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("priority", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "createTask", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Task_1.Task),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Arg)("title", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("description", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("priority", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "updateTask", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Task_1.Task),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Arg)("mood", () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "completeTask", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Task_1.Task),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.ID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "deleteTask", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "resetEverything", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Task_1.Task),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.ID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "toggleTaskCompletion", null);
exports.TaskResolver = TaskResolver = __decorate([
    (0, type_graphql_1.Resolver)(Task_1.Task)
], TaskResolver);
//# sourceMappingURL=TaskResolver.js.map