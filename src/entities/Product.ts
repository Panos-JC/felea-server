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
export class Product extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  subtitle?: string;

  @Field()
  @Column()
  image!: string;

  @Field()
  @Column()
  imagePublicId!: string;

  @Field()
  @Column()
  descriptionRichText!: string;

  @Field()
  @Column()
  description!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  price!: number;

  // created at & updated at
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
