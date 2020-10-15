"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Users_1 = require("../entities/Users");
const validateRegister_1 = require("../utils/validateRegister");
const RegisterInput_1 = require("./inputTypes/RegisterInput");
const argon2_1 = __importDefault(require("argon2"));
const Individual_1 = require("../entities/Individual");
const Type_1 = require("../entities/Type");
const Mentor_1 = require("../entities/Mentor");
const constants_1 = require("../constants");
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => Users_1.Users, { nullable: true }),
    __metadata("design:type", Users_1.Users)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let UsersResolver = class UsersResolver {
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const _user = yield Users_1.Users.findOne({ id: req.session.userId }, { relations: ["type"] });
            if (!_user) {
                console.log("ME QUERY ERROR");
                return null;
            }
            const user = yield typeorm_1.getConnection()
                .getRepository(Users_1.Users)
                .createQueryBuilder("u")
                .innerJoinAndSelect(`u.${_user.type.name}`, _user.type.name)
                .where("u.id = :id", { id: _user.id })
                .getOne();
            console.log(user);
            return user;
        });
    }
    registerIndividual(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = validateRegister_1.validateRegister(options);
            if (errors)
                return { errors };
            const result = yield Users_1.Users.findOne({ email: options.email });
            if (result) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "Email already exists",
                        },
                    ],
                };
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            const user = yield typeorm_1.getManager().transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                let type = yield Type_1.Type.findOne({ name: "individual" });
                if (!type) {
                    type = new Type_1.Type();
                    type.name = "individual";
                    yield transactionalEntityManager.save(type);
                }
                const user = new Users_1.Users();
                user.email = options.email;
                user.password = hashedPassword;
                user.type = type;
                yield transactionalEntityManager.save(user);
                const individual = new Individual_1.Individual();
                individual.firstName = options.firstName;
                individual.lastName = options.lastName;
                individual.user = user;
                yield transactionalEntityManager.save(individual);
                const individualUser = yield transactionalEntityManager
                    .getRepository(Users_1.Users)
                    .createQueryBuilder("u")
                    .where("u.id = :id", { id: user.id })
                    .innerJoinAndSelect("u.individual", "individual")
                    .getOne();
                console.log(individualUser);
                return individualUser;
            }));
            return { user };
        });
    }
    registerMentor(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = validateRegister_1.validateRegister(options);
            if (errors)
                return { errors };
            const result = yield Users_1.Users.findOne({ email: options.email });
            if (result) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "Email already exists",
                        },
                    ],
                };
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            const user = yield typeorm_1.getManager().transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                let type = yield Type_1.Type.findOne({ name: "mentor" });
                if (!type) {
                    type = new Type_1.Type();
                    type.name = "mentor";
                    yield transactionalEntityManager.save(type);
                }
                const user = new Users_1.Users();
                user.email = options.email;
                user.password = hashedPassword;
                user.type = type;
                yield transactionalEntityManager.save(user);
                const mentor = new Mentor_1.Mentor();
                mentor.firstName = options.firstName;
                mentor.lastName = options.lastName;
                mentor.user = user;
                yield transactionalEntityManager.save(mentor);
                const mentorUser = yield transactionalEntityManager
                    .getRepository(Users_1.Users)
                    .createQueryBuilder("u")
                    .where("u.id = :id", { id: user.id })
                    .innerJoinAndSelect("u.mentor", "mentor")
                    .getOne();
                console.log(mentorUser);
                return mentorUser;
            }));
            return { user };
        });
    }
    login(email, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _user = yield Users_1.Users.findOne({ email }, { relations: ["type"] });
            console.log(_user === null || _user === void 0 ? void 0 : _user.type.name);
            if (!_user) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "User does not exist",
                        },
                    ],
                };
            }
            const valid = yield argon2_1.default.verify(_user.password, password);
            if (!valid) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "Incorrect password",
                        },
                    ],
                };
            }
            const user = yield typeorm_1.getConnection()
                .getRepository(Users_1.Users)
                .createQueryBuilder("u")
                .innerJoinAndSelect(`u.${_user.type.name}`, _user.type.name)
                .where("u.id = :id", { id: _user.id })
                .getOne();
            if (!user) {
                return {
                    errors: [
                        {
                            field: "general",
                            message: "Something went wrong",
                        },
                    ],
                };
            }
            req.session.userId = user.id;
            console.log(user);
            return { user };
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
};
__decorate([
    type_graphql_1.Query(() => Users_1.Users, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("options", () => RegisterInput_1.RegisterInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "registerIndividual", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("options", () => RegisterInput_1.RegisterInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "registerMentor", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Arg("password")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersResolver.prototype, "logout", null);
UsersResolver = __decorate([
    type_graphql_1.Resolver()
], UsersResolver);
exports.UsersResolver = UsersResolver;
//# sourceMappingURL=user.js.map