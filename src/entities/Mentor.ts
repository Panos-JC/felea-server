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
import { Review } from "./Review";
import { SessionRequest } from "./SessionRequest";
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

  @Field()
  @Column({ name: "profile_complete", default: false })
  profileComplete!: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  motto!: string;

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
  availableDayFrom: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  availableDayUntill: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  availableTimeFrom: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  availableTimeUntill: Date;

  // Social Links
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

  @Field(() => [Expertise])
  @OneToMany(() => Expertise, (expertise) => expertise.mentor)
  expertises: Expertise[];

  @Field(() => [Review])
  @OneToMany(() => Review, (review) => review.mentor)
  reviews: Review[];

  @Field(() => [SessionRequest])
  @OneToMany(() => SessionRequest, (SessionRequest) => SessionRequest.mentor)
  sessionRequests: SessionRequest[];

  // Count
  @Field(() => Int, { nullable: true })
  sessionCount: number;
}
