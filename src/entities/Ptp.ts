import { BaseEntity, Entity, PrimaryColumn, Column } from "typeorm";

@Entity()

export class Ptp extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column()
    amount: number;
}