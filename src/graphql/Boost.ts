import { extendType, objectType, stringArg, nonNull, intArg, booleanArg } from "nexus"; 
import { Boost } from "../entities";

/**
 * @title Boost Type
 * @description Represents a boost in the system
 */
export const BoostType = objectType({
    name: "Boost",
    definition(t) {
        t.nonNull.string("userAddress"),
        t.boolean("sjFriend"),
        t.boolean("ptpCohort"),
        t.int("totalBonus"),
        t.boolean("firstCohort"),
        t.boolean("secondCohort"),
        t.boolean("thirdCohort"),
        t.boolean("tasks75"),
        t.boolean("tasks100"),
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
        t.field("boost", {
            type: "Boost",
            args: {
                walletAddress: nonNull(stringArg()),
            },
            async resolve(_parent, args) {
                return Boost.find({ where: { userAddress: args.walletAddress } });
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
        t.nonNull.field("createBoost", {
            type: "Boost",
            args: {
                userAddress: nonNull(stringArg()),
                sjFriend: booleanArg(),
                ptpCohort: booleanArg(),
                totalBonus: intArg(),
                firstCohort: booleanArg(),
                secondCohort: booleanArg(),
                thirdCohort: booleanArg(),
                tasks75: booleanArg(),
                tasks100: booleanArg(),
                createdAt: stringArg()
            },
            async resolve(_parent, args: Boost) {
                return Boost.create(args).save();
            }
        });
    }
});









