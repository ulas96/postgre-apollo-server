import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()

export class Referral extends BaseEntity {
    @PrimaryColumn()
    refereeAddress!: string;
  
    @Column()
    referralAddress!: string;

    @Column()
    dailyPoints: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

}