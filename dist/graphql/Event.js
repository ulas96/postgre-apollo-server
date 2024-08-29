"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventMutation = exports.PoolUnlocksQuery = exports.PoolDepositsQuery = exports.MintedTokensQuery = exports.EventsQuery = exports.PoolUnlockType = exports.PoolDepositType = exports.MintedTokensType = exports.EventType = void 0;
const nexus_1 = require("nexus");
const Event_1 = require("../entities/Event");
exports.EventType = (0, nexus_1.objectType)({
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
            t.nonNull.string("createdAt");
    }
});
exports.MintedTokensType = (0, nexus_1.objectType)({
    name: "MintedTokens",
    definition(t) {
        t.string("walletAddress");
        t.string("totalMinted");
    },
});
exports.PoolDepositType = (0, nexus_1.objectType)({
    name: "PoolDeposit",
    definition(t) {
        t.nonNull.string("walletAddress");
        t.nonNull.string("totalDeposits");
    }
});
exports.PoolUnlockType = (0, nexus_1.objectType)({
    name: "PoolUnlock",
    definition(t) {
        t.nonNull.string("walletAddress");
        t.nonNull.string("totalUnlocks");
    }
});
exports.EventsQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("events", {
            type: "Event",
            resolve(_parent, _args, context, _info) {
                const { connection } = context;
                return connection.query(`SELECT * FROM event`);
            }
        });
    }
});
exports.MintedTokensQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.list.field("mintedTokens", {
            type: "MintedTokens",
            args: {
                walletAddress: (0, nexus_1.stringArg)(),
            },
            async resolve(_parent, args, context, _info) {
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
                if (walletAddress) {
                    query += ` AND "parsedData"[2] = '${walletAddress}'`;
                }
                query += ` GROUP BY "parsedData"[2]`;
                try {
                    const result = await connection.query(query);
                    console.log('Minted Tokens Query Result:', result);
                    return result;
                }
                catch (error) {
                    console.error('Error executing minted tokens query:', error);
                    throw new Error('Failed to fetch minted tokens');
                }
            },
        });
    },
});
exports.PoolDepositsQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("poolDeposits", {
            type: "PoolDeposit",
            args: {
                walletAddress: (0, nexus_1.stringArg)(),
            },
            async resolve(_parent, args, context, _info) {
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
                if (walletAddress) {
                    query += ` AND "parsedData"[2] = '${walletAddress}'`;
                }
                query += ` GROUP BY "parsedData"[2]`;
                try {
                    const result = await connection.query(query);
                    console.log('Pool Deposits Query Result:', result);
                    return result;
                }
                catch (error) {
                    console.error('Error executing pool deposits query:', error);
                    throw new Error('Failed to fetch pool deposits');
                }
            }
        });
    }
});
exports.PoolUnlocksQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("poolUnlocks", {
            type: "PoolUnlock",
            args: {
                walletAddress: (0, nexus_1.stringArg)(),
            },
            async resolve(_parent, args, context, _info) {
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
                if (walletAddress) {
                    query += ` AND "parsedData"[2] = '${walletAddress}'`;
                }
                query += ` GROUP BY "parsedData"[2]`;
                try {
                    const result = await connection.query(query);
                    console.log('Pool Unlocks Query Result:', result);
                    return result;
                }
                catch (error) {
                    console.error('Error executing pool unlocks query:', error);
                    throw new Error('Failed to fetch pool unlocks');
                }
            }
        });
    }
});
exports.CreateEventMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createEvent", {
            type: "Event",
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
                eventName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                eventSignature: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                eventData: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                blockNumber: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
                transactionHash: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                logIndex: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
                parsedData: (0, nexus_1.nonNull)((0, nexus_1.list)((0, nexus_1.nonNull)((0, nexus_1.stringArg)()))),
                contractAddress: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                appName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                createdAt: (0, nexus_1.nonNull)((0, nexus_1.stringArg)())
            },
            resolve(_parent, args, _context, _info) {
                const { id, eventName, eventSignature, eventData, blockNumber, transactionHash, logIndex, parsedData, contractAddress, appName, createdAt } = args;
                return Event_1.Event.create({ id, eventName, eventSignature, eventData, blockNumber, transactionHash, logIndex, parsedData, contractAddress, appName, createdAt: new Date(createdAt) }).save().then(event => (Object.assign(Object.assign({}, event), { createdAt: event.createdAt.toISOString() })));
            }
        });
    },
});
//# sourceMappingURL=Event.js.map