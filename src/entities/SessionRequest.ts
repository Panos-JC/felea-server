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
import { Individual } from "./Individual";
import { Mentor } from "./Mentor";

@ObjectType()
@Entity()
export class SessionRequest extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  objective: string;

  @Field()
  @Column()
  headline: string;

  @Field()
  @Column()
  communicationTool: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  communicationToolId: string;

  @Field()
  @Column("text")
  message: string;

  @Field()
  @Column({ default: "pending" })
  status: string;

  @Field()
  @Column()
  ammount: number;

  @Field()
  @Column()
  stripePaymentIntentId: string;

  // Relations
  @Field(() => Individual)
  @ManyToOne(() => Individual)
  individual: Individual;

  @Field(() => Mentor)
  @ManyToOne(() => Mentor)
  mentor: Mentor;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
