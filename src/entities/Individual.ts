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

  @Field()
  @Column({ default: false })
  premium!: boolean;

  @Field()
  @Column({ nullable: true, name: "stripe_customer_id" })
  stripeCustomerId!: string;

  @Field()
  @Column({ nullable: true, name: "stripe_payment_method_id" })
  stripePaymentMethodId!: string;

  @Field()
  @Column({ nullable: true, name: "subscription_id" })
  subscriptionId!: string;

  // Relations
  @Field(() => Users)
  @OneToOne(() => Users, (user) => user.individual)
  @JoinColumn({ name: "user_id" })
  user: Users;
}
