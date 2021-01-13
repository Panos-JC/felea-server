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
import { Product } from "./Product";

@ObjectType()
@Entity()
export class Order extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ default: "pending" })
  status!: string;

  // relations
  @Field(() => Individual)
  @ManyToOne(() => Individual)
  individual!: Individual;

  @Field(() => Product)
  @ManyToOne(() => Product)
  product!: Product;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
