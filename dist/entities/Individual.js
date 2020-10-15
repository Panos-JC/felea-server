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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Individual = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Users_1 = require("./Users");
let Individual = class Individual extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Individual.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ name: "first_name" }),
    __metadata("design:type", String)
], Individual.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ name: "last_name" }),
    __metadata("design:type", String)
], Individual.prototype, "lastName", void 0);
__decorate([
    typeorm_1.OneToOne(() => Users_1.Users, (user) => user.individual),
    typeorm_1.JoinColumn({ name: "user_id" }),
    __metadata("design:type", Users_1.Users)
], Individual.prototype, "user", void 0);
Individual = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Individual);
exports.Individual = Individual;
//# sourceMappingURL=Individual.js.map