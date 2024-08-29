import { list, extendType, intArg, nonNull, objectType, stringArg } from "nexus"; 
import { Event } from "../entities/Event";
import { Context } from "../types/Context";

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

export const PoolDepositType = objectType({
    name: "PoolDeposit",
    definition(t) {
        t.nonNull.string("walletAddress");
        t.nonNull.string("totalDeposits");
    }
})

export const PoolUnlockType = objectType({
    name: "PoolUnlock",
    definition(t) {
        t.nonNull.string("walletAddress");
        t.nonNull.string("totalUnlocks");
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
        args: {
            walletAddress: stringArg(), // Optional argument
        },
        async resolve(_parent, args, context: Context, _info) {
            const { connection } = context;
            const { walletAddress } = args;

            let query = `
              SELECT 
                "parsedData"[2] as "walletAddress",
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)))::TEXT as "totalMinted"
              FROM event
              WHERE 
                "eventName" = 'Transfer' AND
                "parsedData"[1] = '0x0000000000000000000000000000000000000000'
            `;

            // Add wallet address filter if provided
            if (walletAddress) {
                query += ` AND "parsedData"[2] = '${walletAddress}'`;
            }

            query += ` GROUP BY "parsedData"[2]`;

            try {
                const result = await connection.query(query);
                console.log('Minted Tokens Query Result:', result);
                return result;
            } catch (error) {
                console.error('Error executing minted tokens query:', error);
                throw new Error('Failed to fetch minted tokens');
            }
        },
      });
    },
  });

  export const PoolDepositsQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("poolDeposits", {
            type: "PoolDeposit",
            args: {
                walletAddress: stringArg(), // Optional argument
            },
            async resolve(_parent, args, context: Context, _info) {
                const { connection } = context;
                const { walletAddress } = args;

                let query = `
                    SELECT 
                        "parsedData"[2] as "walletAddress",
                        SUM(CAST("parsedData"[3] AS DECIMAL(65,0)))::TEXT as "totalDeposits"
                    FROM event
                    WHERE 
                        ("parsedData"[1] = '0x934cf521743903D27e388d7E8517c636f3Cc4D54' OR
                        "parsedData"[1] = '0x1a66208180c20cc893ac5092d0cce95994cb1ae0' OR
                        "parsedData"[1] = '0x0363a3deBe776de575C36F524b7877dB7dd461Db') AND
                        "parsedData"[2] != '0x0000000000000000000000000000000000000000'
                `;

                // Add wallet address filter if provided
                if (walletAddress) {
                    query += ` AND "parsedData"[2] = '${walletAddress}'`;
                }

                query += ` GROUP BY "parsedData"[2]`;

                try {
                    const result = await connection.query(query);
                    console.log('Pool Deposits Query Result:', result);
                    return result;
                } catch (error) {
                    console.error('Error executing pool deposits query:', error);
                    throw new Error('Failed to fetch pool deposits');
                }
            }
        })
    }
});

export const PoolUnlocksQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("poolUnlocks", {
            type: "PoolUnlock",
            args: {
                walletAddress: stringArg(), // Optional argument
            },
            async resolve(_parent, args, context: Context, _info) {
                const { connection } = context;
                const { walletAddress } = args;

                let query = `
                    SELECT 
                        "parsedData"[2] as "walletAddress",
                        SUM(CAST("parsedData"[3] AS DECIMAL(65,0)))::TEXT as "totalUnlocks"
                    FROM event
                    WHERE 
                        ("parsedData"[1] = '0x934cf521743903D27e388d7E8517c636f3Cc4D54' OR
                        "parsedData"[1] = '0x1a66208180c20cc893ac5092d0cce95994cb1ae0' OR
                        "parsedData"[1] = '0x0363a3deBe776de575C36F524b7877dB7dd461Db') AND
                        "parsedData"[2] != '0x0000000000000000000000000000000000000000'
                `;

                // Add wallet address filter if provided
                if (walletAddress) {
                    query += ` AND "parsedData"[2] = '${walletAddress}'`;
                }

                query += ` GROUP BY "parsedData"[2]`;

                try {
                    const result = await connection.query(query);
                    console.log('Pool Unlocks Query Result:', result);
                    return result;
                } catch (error) {
                    console.error('Error executing pool unlocks query:', error);
                    throw new Error('Failed to fetch pool unlocks');
                }
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