import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
// import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { AdminResolver } from "./resolvers/admin";
import { ExpertiseResolver } from "./resolvers/expertise";
import { IndividualResolver } from "./resolvers/individual";
import { IndustryResolver } from "./resolvers/industry";
import { MentorResolver } from "./resolvers/mentor";
import { ReviewResolver } from "./resolvers/review";
import { SkillResolver } from "./resolvers/skill";
import { UsersResolver } from "./resolvers/user";
import { WorkExperienceResolver } from "./resolvers/workExperience";
import { SessionRequestResolver } from "./resolvers/sessionRequest";
import { CompanyResolver } from "./resolvers/company";

const main = async () => {
  await createConnection();

  // express app
  const app = express();

  // redis store
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.enable("trust proxy");
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      proxy: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: false,
        sameSite: "lax",
        secure: true, // __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "thisisasecret", // Should be hidden
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
        IndividualResolver,
        AdminResolver,
        SkillResolver,
        ExpertiseResolver,
        ReviewResolver,
        SessionRequestResolver,
        CompanyResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false, // OR { origin: "http://localhost:3000" },
  });

  app.listen(process.env.PORT || 4000, () => {
    console.log("Server started on port 4000...");
  });
};

main().catch((err) => console.log(err));
