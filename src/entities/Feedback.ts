import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Feedback extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    userAddress!: string;

    @Column()
    q1: string;

    @Column()
    q2: string;

    @Column()
    q3: string;
}
