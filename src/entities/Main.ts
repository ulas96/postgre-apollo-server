import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Main extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    totalPoints: number;
  
    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    rebPool: number;
  
    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    holdAUSD: number;

    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    holdXAVAX: number;
  
    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    traderJoe: number;
  
    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    pharaoh: number;

    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    pangolin: number;
  
    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    bonus: number;

    @Column({ nullable: true })
    referral: string;

    @Column({ nullable: true })
    referralUsed: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    firstEpochPoints: number;

    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    secondEpochPoints: number;
}