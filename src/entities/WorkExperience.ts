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

  // @Field()
  // @Column({ nullable: true })
  // link: string;

  @Field()
  @Column("text")
  description!: string;

  @Field()
  @Column()
  from!: string;

  @Field()
  @Column()
  untill!: string;

  @Field(() => [Industry])
  @ManyToMany(() => Industry)
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
