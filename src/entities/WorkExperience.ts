import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Industry } from "./Industry";
import { Mentor } from "./Mentor";

@ObjectType()
@Entity()
export class WorkExperience extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  role!: string;

  @Field()
  @Column({ name: "company_name" })
  companyName!: string;

  @Field()
  @Column("text")
  description!: string;

  @Field()
  @Column()
  from!: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  untill?: Date;

  @Field()
  @Column({ default: false })
  present!: boolean;

  @Field(() => [Industry], { nullable: true })
  @ManyToMany(() => Industry, (industries) => industries.workExperiences)
  @JoinTable()
  industries: Industry[];

  @ManyToOne(() => Mentor, (mentor) => mentor.workExperience)
  @JoinColumn({ name: "mentor_id" })
  mentor: Mentor;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
