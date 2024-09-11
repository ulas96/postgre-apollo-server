import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Price } from "./entities/Price";
dotenv.config();


export default new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        entities: [Price],
        synchronize: true
})