import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { WorkExperience } from "./WorkExperience";

@ObjectType()
@Entity()
export class Industry extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column({ unique: true, name: "name_lowercase" })
  nameLowercase!: string;

  @Field(() => [WorkExperience])
  @ManyToMany(
    () => WorkExperience,
    (workExperience) => workExperience.industries
  )
  workExperiences: WorkExperience[];

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
