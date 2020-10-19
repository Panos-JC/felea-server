import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  // @Field(() => [WorkExperienceIndustries])
  // @OneToMany(
  //   () => WorkExperienceIndustries,
  //   (workExperienceIndustry) => workExperienceIndustry.industry
  // )
  // workExperienceIndustries: WorkExperienceIndustries[];

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
