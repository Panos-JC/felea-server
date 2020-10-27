import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Admin } from "./Admin";
import { Individual } from "./Individual";
import { Mentor } from "./Mentor";

@ObjectType()
@Entity()
export class Session extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  date: Date;

  @Field(() => Individual)
  @ManyToOne(() => Individual)
  @JoinColumn({ name: "individual_id" })
  individual: Individual;

  @Field(() => Mentor)
  @ManyToOne(() => Mentor, (mentor) => mentor.sessions)
  @JoinColumn({ name: "mentor_id" })
  mentor: Mentor;

  @Field(() => Admin)
  @ManyToOne(() => Admin)
  @JoinColumn({ name: "admin_id" })
  creator: Admin;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
