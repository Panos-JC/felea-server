import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Admin } from "./entities/Admin";
import { Expertise } from "./entities/Expertise";
import { Individual } from "./entities/Individual";
import { Industry } from "./entities/Industry";
import { Mentor } from "./entities/Mentor";
import { Review } from "./entities/Review";
import { Skill } from "./entities/Skill";
import { Users } from "./entities/Users";
import { WorkExperience } from "./entities/WorkExperience";
import { AdminResolver } from "./resolvers/admin";
import { ExpertiseResolver } from "./resolvers/expertise";
import { IndividualResolver } from "./resolvers/individual";
import { IndustryResolver } from "./resolvers/industry";
import { MentorResolver } from "./resolvers/mentor";
import { ReviewResolver } from "./resolvers/review";
import { SkillResolver } from "./resolvers/skill";
import { UsersResolver } from "./resolvers/user";
import { WorkExperienceResolver } from "./resolvers/workExperience";
import { SessionRequest } from "./entities/SessionRequest";
import { SessionRequestResolver } from "./resolvers/sessionRequest";
import { Company } from "./entities/Company";
import { CompanyResolver } from "./resolvers/company";

const main = async () => {
  await createConnection({
    type: "postgres",
    // database: "feleatest2",
    // username: "postgres",
    // password: "postgres",
    url: process.env.DATABASE_URL,
    logging: !__prod__,
    synchronize: !__prod__,
    entities: [
      Users,
      Mentor,
      Individual,
      Admin,
      WorkExperience,
      Industry,
      Skill,
      Expertise,
      Review,
      SessionRequest,
      Company,
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
