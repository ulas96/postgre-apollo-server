import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Boost } from "./entities/Boost";
import { Main } from "./entities/Main";
import { VePTP } from "./entities/VePTP";
import { Referral } from "./entities/Referral";
import { PtpDeposit } from "./entities/PtpDeposit";

dotenv.config();

export default new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [Boost, Main, VePTP, Referral, PtpDeposit],
    synchronize: true
})