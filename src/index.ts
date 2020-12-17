import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { AdminResolver } from "./resolvers/admin/admin.resolver";
import { ExpertiseResolver } from "./resolvers/expertise/expertise.resolver";
import { IndividualResolver } from "./resolvers/individual/individual";
import { IndustryResolver } from "./resolvers/industry";
import { MentorResolver } from "./resolvers/mentor/mentor.resolver";
import { ReviewResolver } from "./resolvers/review";
import { SkillResolver } from "./resolvers/skill/skill.resolver";
import { WorkExperienceResolver } from "./resolvers/workExperience/workExperience.resolver";
import { SessionRequestResolver } from "./resolvers/sessionRequest/sessionRequest.resolver";
import { CompanyResolver } from "./resolvers/company/company.resolver";
import { RegisterResolver } from "./resolvers/users/register/register.resolver";
import { AvatarResolver } from "./resolvers/users/avatar/avatar.resolver";
import { ChangePasswordResolver } from "./resolvers/users/changePassword/changePassword.resolver";
import { LoginResolver } from "./resolvers/users/login/login.resolver";
import { MeResolver } from "./resolvers/users/me/me.resolver";
import { UpdateIndividualInfoResolver } from "./resolvers/individual/updateIndividualInfo/updateIndividualInfo.resolver";
import { UpdateAdminInfoResolver } from "./resolvers/admin/updateAdminInfo/updateAdminInfo.resolver";
import { EducationResolver } from "./resolvers/education/education.resolver";
import { CertificateResolver } from "./resolvers/certificate/certificate.resolver";
import { MentorDetailsResolver } from "./resolvers/mentor/mentorDetails/mentorDetails.resolver";
import { SessionRequestActionsResolver } from "./resolvers/sessionRequest/sessionRequestActions/sessionRequestActions.resolver";
import { ConfirmUserResolver } from "./resolvers/users/confirmUser/confirmUser.resolver";
import { AdminMentorInfoResolver } from "./resolvers/admin/mentorInfo/mentorInfo.resolver";
import { DeleteIndividualResolver } from "./resolvers/individual/deleteIndividual/deleteIndividual.resolver";
import { DeleteMentorResolver } from "./resolvers/mentor/deleteMentor/deleteMentor.resolver";

const main = async () => {
  await createConnection();

  // express app
  const app = express();

  // redis store
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );

  app.set("trust proxy", 1);
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
        sameSite: __prod__ ? "none" : "lax",
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || "thisisasecret", // Should be hidden
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        DeleteMentorResolver,
        DeleteIndividualResolver,
        AdminMentorInfoResolver,
        ConfirmUserResolver,
        SessionRequestActionsResolver,
        MentorDetailsResolver,
        CertificateResolver,
        EducationResolver,
        UpdateAdminInfoResolver,
        UpdateIndividualInfoResolver,
        AvatarResolver,
        ChangePasswordResolver,
        LoginResolver,
        MeResolver,
        RegisterResolver,
        RegisterResolver,
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
    bodyParserConfig: {
      limit: "50mb",
    },
  });

  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    console.log(`Server started on port ${port}...`);
  });
};

main().catch((err) => console.log(err));
