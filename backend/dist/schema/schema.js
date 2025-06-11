"use strict";
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
exports.createSchema = void 0;
const type_graphql_1 = require("type-graphql");
const TaskResolver_1 = require("../resolvers/TaskResolver");
const BadgeResolver_1 = require("../resolvers/BadgeResolver");
const UserStatsResolver_1 = require("../resolvers/UserStatsResolver");
const createSchema = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, type_graphql_1.buildSchema)({
        resolvers: [TaskResolver_1.TaskResolver, BadgeResolver_1.BadgeResolver, UserStatsResolver_1.UserStatsResolver],
        emitSchemaFile: true,
        validate: true,
    });
});
exports.createSchema = createSchema;
//# sourceMappingURL=schema.js.map