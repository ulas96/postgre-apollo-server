import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Feedback } from "./entities/Feedback";


dotenv.config();

export default new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [Feedback],
    synchronize: true
})