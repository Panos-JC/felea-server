import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Admin } from "./Admin";
import { Company } from "./Company";
import { SessionRequest } from "./SessionRequest";
import { Users } from "./Users";

@ObjectType()
@Entity()
export class Individual extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ name: "first_name" })
  firstName!: string;

  @Field()
  @Column({ name: "last_name" })
  lastName!: string;

  @Field()
  @Column({ default: false })
  premium!: boolean;

  // Relations
  @Field(() => Users)
  @OneToOne(() => Users, (user) => user.individual)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, { nullable: true })
  company: Company;

  @Field(() => Admin, { nullable: true })
  @ManyToOne(() => Admin, { nullable: true })
  facilitator: Admin;

  @Field(() => [SessionRequest])
  @OneToMany(() => SessionRequest, (session) => session.individual)
  sessionRequests: SessionRequest[];

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Int)
  sessionRequestsCount: number;
}
