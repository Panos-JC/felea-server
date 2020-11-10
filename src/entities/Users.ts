import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Admin } from "./Admin";
import { Individual } from "./Individual";
import { Mentor } from "./Mentor";

@ObjectType()
@Entity()
export class Users extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @Column({ default: false })
  activated!: boolean;

  @Field()
  @Column()
  type!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar!: string;

  @Column({ nullable: true })
  avatarPublicId!: string;

  // relations
  @Field(() => Mentor, { nullable: true })
  @OneToOne(() => Mentor, (mentor) => mentor.user)
  mentor: Mentor;

  @Field(() => Individual, { nullable: true })
  @OneToOne(() => Individual, (individual) => individual.user)
  individual: Individual;

  @Field(() => Admin, { nullable: true })
  @OneToOne(() => Admin, (admin) => admin.user)
  admin: Admin;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
