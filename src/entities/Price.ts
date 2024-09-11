import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Price {
    @PrimaryColumn() // Use this for composite key
    date: string;

    @Column("float") // Change this to "float" or "decimal"
    price: number;
}