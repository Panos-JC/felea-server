import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
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

  @Field(() => Company)
  @ManyToOne(() => Company, { nullable: true })
  company: Company;

  @Field(() => [SessionRequest])
  @OneToMany(() => SessionRequest, (session) => session.individual)
  sessionRequests: SessionRequest[];

  @Field(() => Int)
  sessionRequestsCount: number;
}
