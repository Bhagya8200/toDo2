import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { TaskPriority, MoodType } from "../shared/types";

@Entity()
@ObjectType()
export class Task {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column({ default: false })
  completed: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  completedAt?: Date;

  @Field(() => String)
  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Field()
  @Column({ default: 10 })
  points: number;

  @Field(() => String, { nullable: true })
  @Column({
    type: "enum",
    enum: MoodType,
    nullable: true,
  })
  completionMood?: MoodType;
}
