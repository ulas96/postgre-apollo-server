import { BaseEntity, Entity, PrimaryColumn, Column } from "typeorm";

@Entity()

export class PtpDeposit extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column()
    amount: number;
}