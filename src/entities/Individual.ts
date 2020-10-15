import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
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

  @OneToOne(() => Users, (user) => user.individual)
  @JoinColumn({ name: "user_id" })
  user: Users;
}
