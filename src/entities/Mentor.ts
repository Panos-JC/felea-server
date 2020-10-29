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
import { Expertise } from "./Expertise";
import { Session } from "./Session";
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

  @Field({ nullable: true })
  @Column({ nullable: true })
  medium: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  facebook: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  linkedin: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  twitter: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  instagram: string;

  // Relations
  @Field(() => Users)
  @OneToOne(() => Users, (user) => user.mentor)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @Field(() => [WorkExperience])
  @OneToMany(() => WorkExperience, (workExperience) => workExperience.mentor)
  workExperience: WorkExperience[];

  @Field(() => [Session])
  @OneToMany(() => Session, (session) => session.mentor)
  sessions: Session[];

  @Field(() => [Expertise])
  @OneToMany(() => Expertise, (expertise) => expertise.mentor)
  expertises: Expertise[];

  // Count
  @Field(() => Int, { nullable: true })
  sessionCount: number;
}
