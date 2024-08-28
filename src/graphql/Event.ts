import { list, extendType, intArg, nonNull, objectType, stringArg } from "nexus"; 
import { Event } from "../entities/Event";
import { Context } from "../types/Context";
//import {NexusGenObjects} from "../../nexus-typegen"

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
        t.nonNull.string("createdAt")
    }
});

export const MintedTokensType = objectType({
    name: "MintedTokens",
    definition(t) {
      t.string("walletAddress");  
      t.string("totalMinted");  
    },
  });

export const PoolDepositsType = objectType({
    name: "PoolDeposits",
    definition(t) {
        t.nonNull.string("walletAddress");
        t.nonNull.string("poolAddress");
        t.nonNull.string("totalDeposits");
    }
})

export const EventsQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("events", {
            type: "Event",
            resolve(_parent, _args, context: Context, _info) {
                const { connection } = context;
                return connection.query(`SELECT * FROM event`);
            }
        })
    }
});

export const MintedTokensQuery = extendType({
    type: "Query",
    definition(t) {
      t.nonNull.list.field("mintedTokens", {  // Changed to nullable list items
        type: "MintedTokens",
        resolve(_parent, _args, context: Context, _info) {
          const { connection } = context;
          const query = `
            SELECT 
              "parsedData"[2] as "walletAddress",
              SUM(CAST("parsedData"[3] AS DECIMAL(65,0)))::TEXT as "totalMinted"
            FROM event
            WHERE 
              "eventName" = 'Transfer' AND
              "parsedData"[1] = '0x0000000000000000000000000000000000000000'
            GROUP BY "parsedData"[2]
          `;
          return connection.query(query);
        },
      });
    },
  });

  export const PoolDepositsQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("poolDeposits", {
            type: "PoolDeposits",
            async resolve(_parent, _args, context: Context, _info) {
                const { connection } = context;
                const query = `
                    SELECT 
                        "parsedData"[2] as "poolAddress",
                        "parsedData"[1] as "walletAddress",
                        SUM(CAST("parsedData"[3] AS DECIMAL(65,0)))::TEXT as "totalDeposits"
                    FROM event
                    WHERE 
                        "eventName" = 'Transfer' AND
                        "parsedData"[1] != '0x0000000000000000000000000000000000000000'
                    GROUP BY "parsedData"[2], "parsedData"[1]
                `;
                const result = await connection.query(query);
                console.log('Pool Deposits Query Result:', result);
                return result;
            }
        })
    }
});

export const CreateEventMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createEvent", {
            type: "Event",
            args: {
                id: nonNull(intArg()),
                eventName: nonNull(stringArg()),
                eventSignature: nonNull(stringArg()),
                eventData: nonNull(stringArg()),
                blockNumber: nonNull(intArg()),
                transactionHash: nonNull(stringArg()),
                logIndex: nonNull(intArg()),
                parsedData: nonNull(list(nonNull(stringArg()))),
                contractAddress: nonNull(stringArg()),
                appName: nonNull(stringArg()),
                createdAt: nonNull(stringArg())
            },
            resolve(_parent, args, _context, _info) {
                const { id, eventName, eventSignature, eventData, blockNumber, transactionHash, logIndex, parsedData, contractAddress, appName, createdAt } = args;
                
                return Event.create({ id, eventName, eventSignature, eventData, blockNumber, transactionHash, logIndex, parsedData, contractAddress, appName, createdAt: new Date(createdAt) }).save().then(event => ({
                    ...event,
                    createdAt: event.createdAt.toISOString()
                }));
            }
        })
    },
})