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
exports.UserStatsResolver = void 0;
const type_graphql_1 = require("type-graphql");
const UserStats_1 = require("../entity/UserStats");
const data_source_1 = require("../data-source");
let UserStatsResolver = class UserStatsResolver {
    userStats() {
        return __awaiter(this, void 0, void 0, function* () {
            let stats = yield data_source_1.AppDataSource.getRepository(UserStats_1.UserStats).findOne({ where: {} });
            if (!stats) {
                stats = data_source_1.AppDataSource.getRepository(UserStats_1.UserStats).create({
                    totalPoints: 0,
                    tasksCompleted: 0,
                    currentStreak: 0,
                    longestStreak: 0
                });
                yield data_source_1.AppDataSource.getRepository(UserStats_1.UserStats).save(stats);
            }
            return stats;
        });
    }
};
exports.UserStatsResolver = UserStatsResolver;
__decorate([
    (0, type_graphql_1.Query)(() => UserStats_1.UserStats, { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserStatsResolver.prototype, "userStats", null);
exports.UserStatsResolver = UserStatsResolver = __decorate([
    (0, type_graphql_1.Resolver)(UserStats_1.UserStats)
], UserStatsResolver);
//# sourceMappingURL=UserStatsResolver.js.map