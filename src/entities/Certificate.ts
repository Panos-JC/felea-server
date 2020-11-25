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
export class Certificate extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  organization!: string;

  @Field(() => String)
  @Column()
  date!: Date;

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
