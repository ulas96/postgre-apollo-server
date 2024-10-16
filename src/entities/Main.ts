import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()

export class Main extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column()
    totalPoints: number;
  
    @Column()
    rebPool: number;
  
    @Column()
    holdAUSD: number;

    @Column()
    holdXAVAX: number;
  
    @Column()
    traderJoe: number;
  
    @Column()
    pharaoh: number;

    @Column()
    pangolin: number;
  
    @Column()
    bonus: number;

    @Column()
    referral: string;

    @Column()
    referralUsed: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @Column()
    firstEpochPoints: number;

    @Column()
    secondEpochPoints: number;
}