import { BaseEntity, Entity, PrimaryColumn, Column } from "typeorm";

@Entity()

export class VePTP extends BaseEntity {
    @PrimaryColumn()
    userAddress!: string;
  
    @Column()
    amount: number;
}