import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Mentor } from "./entities/Mentor";
import { Type } from "./entities/Type";
import { Users } from "./entities/Users";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UsersResolver } from "./resolvers/user";
import { Individual } from "./entities/Individual";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { WorkExperience } from "./entities/WorkExperience";
import { WorkExperienceResolver } from "./resolvers/workExperience";
import { Industry } from "./entities/Industry";
import { IndustryResolver } from "./resolvers/industry";
import { MentorResolver } from "./resolvers/mentor";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "feleatest",
    username: "postgres",
    password: "postgres",
    logging: !__prod__,
    synchronize: !__prod__,
    entities: [
      Users,
      Mentor,
      Type,
      Individual,
      WorkExperience,
      Industry,
      // WorkExperienceIndustries,
    ],
    migrations: [path.join(__dirname, "/migrations/*")],
    migrationsRun: true,
  });

  // await conn.runMigrations();

  // express app
  const app = express();

  // redis store
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: false,
        sameSite: "lax",
        secure: false, // __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "thisisasecret", // Should be hidden
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UsersResolver,
        WorkExperienceResolver,
        IndustryResolver,
        MentorResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false, // OR { origin: "http://localhost:3000" },
  });

  app.listen(4000, () => {
    console.log("Server started on port 4000...");
  });
};

main().catch((err) => console.log(err));
