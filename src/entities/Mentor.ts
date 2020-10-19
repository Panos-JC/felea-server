import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { WorkExperience } from "./WorkExperience";

@ObjectType()
@Entity()
export class Mentor extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ name: "first_name" })
  firstName!: string;

  @Field()
  @Column({ name: "last_name" })
  lastName!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  location!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  languages!: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  bio!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  rate: string;

  // Relations
  @Field()
  @OneToOne(() => Users, (user) => user.mentor)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @Field(() => WorkExperience)
  @OneToMany(() => WorkExperience, (workExperience) => workExperience.mentor)
  workExperience: WorkExperience[];
}
