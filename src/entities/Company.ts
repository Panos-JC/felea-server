import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Admin } from "./Admin";

@ObjectType()
@Entity()
export class Company extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  boughtAccounts: number;

  @Field()
  @Column()
  remainingAccounts: number;

  @Field()
  @Column({ unique: true })
  code: string;

  @Field(() => Admin)
  @ManyToOne(() => Admin)
  admin: Admin;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
