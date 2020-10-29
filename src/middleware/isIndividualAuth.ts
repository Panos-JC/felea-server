import { MiddlewareFn } from "type-graphql";
import { Individual } from "../entities/Individual";
import { MyContext } from "../types";

// checks if logged in user is a mentor
export const isIndividualAuth: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const individual = await Individual.findOne({
    where: { user: { id: context.req.session.userId } },
  });

  if (!individual) {
    throw new Error("not authenticated");
  }

  return next();
};
