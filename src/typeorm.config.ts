import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Event } from "./entities/Event";

dotenv.config();


export default new DataSource({
        type: "postgres",
        url: process.env.DATABASE_URL,
        entities: [Event],
        synchronize: true
})