import { MiddlewareFn } from "type-graphql";
import { Admin } from "../entities/Admin";
import { MyContext } from "../types";

// checks if logged in user is a mentor
export const isAdminAuth: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const admin = await Admin.findOne({
    where: { user: { id: context.req.session.userId } },
  });

  if (!admin) {
    throw new Error("not authenticated");
  }

  return next();
};
