import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@Entity()
@ObjectType()
export class UserStats {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ default: 0 })
  totalPoints: number;

  @Field()
  @Column({ default: 0 })
  tasksCompleted: number;

  @Field()
  @Column({ default: 0 })
  currentStreak: number;

  @Field()
  @Column({ default: 0 })
  longestStreak: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastCompletedAt?: Date;
}