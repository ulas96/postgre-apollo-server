import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()

export class Event extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    eventName!: string;
  
    @Column()
    eventSignature!: string;
  
    @Column()
    eventSignatureHash!: string;
  
    @Column({ type: "text" })
    eventData!: string;
  
    @Column()
    blockNumber!: number;
  
    @Column()
    transactionHash!: string;
  
    @Column()
    logIndex!: number;
  
    @Column("text", { array: true})
    parsedData!: string[];
  
    @Column()
    contractAddress!: string;
  
    @Column()
    appName!: string;
  
    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

}