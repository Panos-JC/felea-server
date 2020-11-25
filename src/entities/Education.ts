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
import { Mentor } from "./Mentor";

@ObjectType()
@Entity()
export class Education extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  school!: string;

  @Field(() => String)
  @Column()
  startDate!: Date;

  @Field(() => String)
  @Column()
  endDate!: Date;

  @Field()
  @Column("text")
  description!: string;

  // relations
  @Field(() => Mentor)
  @ManyToOne(() => Mentor)
  mentor!: Mentor;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
