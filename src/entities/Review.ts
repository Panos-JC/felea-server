import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Individual } from "./Individual";
import { Mentor } from "./Mentor";

@ObjectType()
@Entity()
export class Review extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column("text")
  message!: string;

  @Field()
  @Column()
  rating!: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @Field(() => Mentor)
  @ManyToOne(() => Mentor, (mentor) => mentor.reviews)
  mentor!: Mentor;

  @Field(() => Individual)
  @ManyToOne(() => Individual)
  individual!: Individual;
}
