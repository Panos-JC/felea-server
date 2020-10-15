"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validator_1 = __importDefault(require("validator"));
exports.validateRegister = (options) => {
    if (!validator_1.default.isEmail(options.email)) {
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
//# sourceMappingURL=validateRegister.js.map