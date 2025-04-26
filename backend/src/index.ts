import "reflect-metadata";
import express, { Application } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { AppDataSource } from "./data-source";
import cors from "cors";

import { createSchema } from "./schema/schema";

const main = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established");

    const app: Application = express();

    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      })
    );

    const schema = await createSchema();

    const apolloServer = new ApolloServer({ schema });

    await apolloServer.start();

    app.use("/graphql", express.json(), expressMiddleware(apolloServer));

    app.listen(4002, () => {
      console.log("Server started at http://localhost:4002/graphql");
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

main();
