import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()

export class Boost extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column()
    sjFriend: boolean;
  
    @Column()
    ptpCohort: boolean;
  
    @Column()
    totalBonus: number;
  
    @Column()
    firstCohort: boolean;
  
    @Column()
    secondCohort: boolean;
  
    @Column()
    thirdCohort: boolean;
  
    @Column()
    tasks75: boolean;

    @Column()
    tasks100: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
}