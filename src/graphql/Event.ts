import { extendType, objectType, stringArg } from "nexus"; 
import { Context } from "../types/Context";
import { getTimestamp } from "../helpers/index";

/**
 * @title Event Type
 * @description Represents an event in the system
 */
export const EventType = objectType({
    name: "Event",
    definition(t) {
        t.nonNull.int("id"),
        t.nonNull.string("eventName"),
        t.nonNull.string("eventSignature"),
        t.nonNull.string("eventData"),
        t.nonNull.int("blockNumber"),
        t.nonNull.string("transactionHash"),
        t.nonNull.int("logIndex"),
        t.nonNull.list.nonNull.string("parsedData"),
        t.nonNull.string("contractAddress"),
        t.nonNull.string("appName"),
        t.nonNull.float("timestamp")
    }
});



/**
 * @title Events Query
 * @description Query to fetch events, optionally filtered by wallet address
 * @param walletAddress - Optional wallet address to filter events
 * @returns List of Event objects
 */
export const EventsQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("events", {
            type: "Event",
            args: {
                walletAddress: stringArg(),
            },
            async resolve(_parent, args, context: Context, _info) {
                const { connection } = context;
                const { walletAddress } = args;

                let query = `
                    SELECT DISTINCT ON ("transactionHash") *
                    FROM event
                `;

                if (walletAddress) {
                    query += ` WHERE "parsedData"[1] = $1 OR "parsedData"[2] = $1`;
                }

                query += ` ORDER BY "transactionHash", "blockNumber" DESC`;

                try {
                    let result;
                    if (walletAddress) {
                        result = await connection.query(query, [walletAddress]);
                    } else {
                        result = await connection.query(query);
                    }

                    // Calculate timestamp for each event
                    const eventsWithTimestamp = await Promise.all(result.map(async (event: any) => {
                        const timestamp = await getTimestamp(event.blockNumber);
                        return { ...event, timestamp: timestamp.getTime() };
                    }));

                    console.log('Unique Events Query Result:', eventsWithTimestamp);
                    return eventsWithTimestamp;
                } catch (error) {
                    console.error('Error executing unique events query:', error);
                    throw new Error('Failed to fetch unique events');
                }
            }
        });
    }
});








