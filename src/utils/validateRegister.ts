import validator from "validator";
import { RegisterInput } from "../resolvers/users/register/register.input";

export const validateRegister = (options: RegisterInput) => {
  if (!validator.isEmail(options.email)) {
    return [
      {
        field: "email",
        message: "Please enter a valid email.",
      },
    ];
  }

  if (options.firstName.length < 2) {
    return [
      {
        field: "firstName",
        message: "The name should be at least 2 characters",
      },
    ];
  }

  if (options.lastName.length < 2) {
    return [
      {
        field: "lastName",
        message: "The name should be at least 2 characters",
      },
    ];
  }

  if (options.password.length < 8) {
    return [
      {
        field: "password",
        message: "The password must be at least 8 characters",
      },
    ];
  }

  return null;
};
