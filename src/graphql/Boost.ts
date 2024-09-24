import { extendType, objectType, stringArg, nonNull, intArg, booleanArg } from "nexus"; 
import { Context } from "../types/Context";
import { Boost } from "../entities/Boost";

/**
 * @title Boost Type
 * @description Represents a boost in the system
 */
export const BoostType = objectType({
    name: "Boost",
    definition(t) {
        t.nonNull.string("userAddress"),
        t.string("sjFriend"),
        t.string("ptpCohort"),
        t.int("totalBonus"),
        t.boolean("firstCohort"),
        t.int("secondCohort"),
        t.string("thirdCohort"),
        t.int("tasks75"),
        t.int("tasks100"),
        t.string("createdAt")
    }
});

/**
 * @title Boosts Query
 * @description Query to fetch boosts, optionally filtered by wallet address
 * @param walletAddress - Optional wallet address to filter boosts
 * @returns List of Boost objects
 */
export const BoostsQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("boosts", {
            type: "Boost",
            args: {
                walletAddress: nonNull(stringArg()),
            },
            async resolve(_parent, args, context: Context, _info) {
                const { connection } = context;
                const { walletAddress } = args;

                let query = `
                    SELECT DISTINCT ON ("userAddress") *
                    FROM boost
                    WHERE "userAddress" = $1
                `;

                try {
                    const result = await connection.query(query, [walletAddress]);
                    return result;
                } catch (error) {
                    throw new Error('Failed to fetch unique boosts');
                }
            }
        });
    }
});

/**
 * @title Add Boost Mutation
 * @description Mutation to add a new boost entry to the database
 * @param userAddress - User address
 * @param sjFriend - SJ friend
 * @param ptpCohort - PTP cohort
 * @param totalBonus - Total bonus
 * @param firstCohort - First cohort
 * @param secondCohort - Second cohort
 * @param thirdCohort - Third cohort
 * @param tasks75 - Tasks 75
 * @param tasks100 - Tasks 100
 * @param createdAt - Created at
 * @returns The newly created Boost object
 */
export const AddBoostMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("addBoost", {
            type: "Boost",
            args: {
                userAddress: nonNull(stringArg()),
                sjFriend: stringArg(),
                ptpCohort: stringArg(),
                totalBonus: intArg(),
                firstCohort: booleanArg(),
                secondCohort: intArg(),
                thirdCohort: stringArg(),
                tasks75: intArg(),
                tasks100: intArg(),
                createdAt: stringArg()
            },
            async resolve(_parent, args, _context, _info) {
                const {
                    userAddress,
                    sjFriend,
                    ptpCohort,
                    totalBonus,
                    firstCohort,
                    secondCohort,
                    thirdCohort,
                    tasks75,
                    tasks100,
                    createdAt
                } = args;

                return Boost.create({
                    userAddress,
                    sjFriend,
                    ptpCohort,
                    totalBonus,
                    firstCohort,
                    secondCohort,
                    thirdCohort,
                    tasks75,
                    tasks100,
                    createdAt
                }).save();
            }
        });
    }
});









