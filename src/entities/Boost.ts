import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()

export class Boost extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column()
    sjFriend: string;
  
    @Column()
    ptpCohort: string;
  
    @Column()
    totalBonus: number;
  
    @Column()
    firstCohort: boolean;
  
    @Column()
    secondCohort: number;
  
    @Column()
    thirdCohort: string;
  
    @Column()
    tasks75: number;

    @Column()
    tasks100: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
}