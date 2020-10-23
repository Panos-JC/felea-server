import { MiddlewareFn } from "type-graphql";
import { Mentor } from "../entities/Mentor";
import { MyContext } from "../types";

// checks if logged in user is a mentor
export const isMentorAuth: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const mentor = await Mentor.findOne({
    where: { user: { id: context.req.session.userId } },
  });

  if (!mentor) {
    throw new Error("not authenticated");
  }

  return next();
};
