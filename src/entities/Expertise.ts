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
import { Mentor } from "./Mentor";
import { Skill } from "./Skill";

@ObjectType()
@Entity()
export class Expertise extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column("text")
  description: string;

  // relations
  @Field()
  @ManyToOne(() => Skill)
  @JoinColumn({ name: "skill_id" })
  skill: Skill;

  @Field(() => Mentor)
  @ManyToOne(() => Mentor, (mentor) => mentor.expertises)
  @JoinColumn({ name: "mentor_id" })
  mentor: Mentor;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
