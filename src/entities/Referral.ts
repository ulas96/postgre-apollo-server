import { BaseEntity, Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()

export class Referral extends BaseEntity {
    @PrimaryColumn()
    refereeAddress!: string;
  
    @Column()
    referrerAddress!: string;

    @Column('numeric', { precision: 18, scale: 0, default: 0 })
    dailyPoints: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

}