import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()

export class Main extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column()
    totalPoints!: number;
  
    @Column()
    rebPool: number;
  
    @Column()
    holdXAVAX: number;
  
    @Column()
    traderJoe: number;
  
    @Column()
    pharaoh: number;
  
    @Column()
    bonus: number;
  
    @Column()
    referral: string;

    @Column({ type: "text" })
    referralUsed: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @Column()
    firstEpochPoints: number;
}