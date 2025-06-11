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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const data_source_1 = require("./data-source");
const cors_1 = __importDefault(require("cors"));
const schema_1 = require("./schema/schema");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield data_source_1.AppDataSource.initialize();
        console.log("Database connection established");
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)({
            origin: "http://localhost:5173",
            credentials: true,
        }));
        const schema = yield (0, schema_1.createSchema)();
        const apolloServer = new server_1.ApolloServer({ schema });
        yield apolloServer.start();
        app.use("/graphql", express_1.default.json(), (0, express4_1.expressMiddleware)(apolloServer));
        app.listen(4002, () => {
            console.log("Server started at http://localhost:4002/graphql");
        });
    }
    catch (error) {
        console.error("Error starting the server:", error);
    }
});
main();
//# sourceMappingURL=index.js.map