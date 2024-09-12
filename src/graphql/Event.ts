import { extendType, objectType, stringArg } from "nexus"; 
import { Context } from "../types/Context";
import { getXAVAXPriceByTransaction } from "../helpers/index";

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
    t.string("transactionHash");
      t.string("walletAddress");  
      t.string("mintedAmount"); 
      t.string("createdAt");
      t.string("cost");
    },
  });

export const BurnedTokensType = objectType({
    name: "BurnedTokens",
    definition(t) {
      t.string("transactionHash");
      t.string("walletAddress");  
      t.string("burnedAmount");  
      t.string("createdAt");
      t.string("benefit");  // Add this line to include the cost field
    },
  });

export const WalletPositionType = objectType({
  name: "WalletPosition",
  definition(t) {
    t.nonNull.string("walletAddress");
    t.nonNull.string("position");
  },
});

export const EventsQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("events", {
            type: "Event",
            args: {
                walletAddress: stringArg(), // Optional argument
            },
            async resolve(_parent, args, context: Context, _info) {
                const { connection } = context;
                const { walletAddress } = args;

                let query = `SELECT * FROM event`;

                if (walletAddress) {
                    query += ` WHERE "parsedData"[1] = $1 OR "parsedData"[2] = $1`;
                }

                try {
                    let result;
                    if (walletAddress) {
                        result = await connection.query(query, [walletAddress]);
                    } else {
                        result = await connection.query(query);
                    }
                    console.log('Events Query Result:', result);
                    return result;
                } catch (error) {
                    console.error('Error executing events query:', error);
                    throw new Error('Failed to fetch events');
                }
            }
        });
    }
});

export const MintedTokensQuery = extendType({
    type: "Query",
    definition(t) {
      t.nonNull.list.field("mintedTokens", {
        type: "MintedTokens",
        args: {
            walletAddress: stringArg(),
        },
        async resolve(_parent, args, context: Context, _info) {
            const { connection } = context;
            const { walletAddress } = args;

            let query = `
              SELECT 
                "transactionHash",
                "parsedData"[2] as "walletAddress",
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000)::TEXT as "mintedAmount",
                MAX("createdAt") as "createdAt"
              FROM event
              WHERE 
                "eventName" = 'Transfer' AND
                "parsedData"[1] = '0x0000000000000000000000000000000000000000'
            `;

            if (walletAddress) {
                query += ` AND "parsedData"[2] = $1`;
            }

            query += `
              GROUP BY "transactionHash", "parsedData"[2]
              ORDER BY MAX("createdAt") DESC
            `;

            try {
                let result;
                if (walletAddress) {
                    result = await connection.query(query, [walletAddress]);
                } else {
                    result = await connection.query(query);
                }

                // Calculate cost for each transaction
                const resultWithCost = await Promise.all(result.map(async (row: any) => {
                    try {
                        const xavaxCost = await getXAVAXPriceByTransaction(row.transactionHash);
                        const cost = (parseFloat(row.mintedAmount) * xavaxCost).toFixed(6);
                        return { ...row, cost };
                    } catch (error) {
                        console.error(`Error calculating cost for transaction ${row.transactionHash}:`, error);
                        return { ...row, cost: '0' };
                    }
                }));

                console.log('Minted Tokens Query Result:', resultWithCost);
                return resultWithCost;
            } catch (error) {
                console.error('Error executing minted tokens query:', error);
                throw new Error('Failed to fetch minted tokens');
            }
        },
      });
    },
  });

export const BurnedTokensQuery = extendType({
    type: "Query",
    definition(t) {
      t.nonNull.list.field("burnedTokens", {
        type: "BurnedTokens",
        args: {
            walletAddress: stringArg(),
        },
        async resolve(_parent, args, context: Context, _info) {
            const { connection } = context;
            const { walletAddress } = args;

            let query = `
              SELECT 
                "transactionHash",
                "parsedData"[1] as "walletAddress",
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000)::TEXT as "burnedAmount",
                MAX("createdAt") as "createdAt"
              FROM event
              WHERE 
                "eventName" = 'Transfer' AND
                "parsedData"[2] = '0x0000000000000000000000000000000000000000'
            `;

            if (walletAddress) {
                query += ` AND "parsedData"[1] = $1`;
            }

            query += `
              GROUP BY "transactionHash", "parsedData"[1]
              ORDER BY MAX("createdAt") DESC
            `;

            try {
                let result;
                if (walletAddress) {
                    result = await connection.query(query, [walletAddress]);
                } else {
                    result = await connection.query(query);
                }

                // Calculate cost for each transaction
                const resultWithBenefit = await Promise.all(result.map(async (row: any) => {
                    try {
                        const xavaxCost = await getXAVAXPriceByTransaction(row.transactionHash);
                        const benefit = (parseFloat(row.burnedAmount) * xavaxCost).toFixed(6);
                        return { ...row, benefit };
                    } catch (error) {
                        console.error(`Error calculating cost for transaction ${row.transactionHash}:`, error);
                        return { ...row, cost: '0' };
                    }
                }));

                console.log('Burned Tokens Query Result:', resultWithBenefit);
                return resultWithBenefit;
            } catch (error) {
                console.error('Error executing burned tokens query:', error);
                throw new Error('Failed to fetch burned tokens');
            }
        },
      });
    },
  });

export const WalletPositionQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("walletPositions", {
      type: "WalletPosition",
      args: {
        walletAddress: stringArg(),
      },
      async resolve(_parent, args, context: Context, _info) {
        const { connection } = context;
        const { walletAddress } = args;

        let query = `
          WITH minted AS (
            SELECT 
              "parsedData"[2] as "walletAddress",
              SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "mintedAmount"
            FROM event
            WHERE 
              "eventName" = 'Transfer' AND
              "parsedData"[1] = '0x0000000000000000000000000000000000000000'
            GROUP BY "parsedData"[2]
          ),
          burned AS (
            SELECT 
              "parsedData"[1] as "walletAddress",
              SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "burnedAmount"
            FROM event
            WHERE 
              "eventName" = 'Transfer' AND
              "parsedData"[2] = '0x0000000000000000000000000000000000000000'
            GROUP BY "parsedData"[1]
          )
          SELECT 
            COALESCE(m."walletAddress", b."walletAddress") as "walletAddress",
            (COALESCE(m."mintedAmount", 0) - COALESCE(b."burnedAmount", 0))::TEXT as "position"
          FROM minted m
          FULL OUTER JOIN burned b ON m."walletAddress" = b."walletAddress"
        `;

        if (walletAddress) {
          query += ` WHERE m."walletAddress" = $1 OR b."walletAddress" = $1`;
        }

        try {
          let result;
          if (walletAddress) {
            result = await connection.query(query, [walletAddress]);
          } else {
            result = await connection.query(query);
          }

          console.log('Wallet Positions Query Result:', result);
          return result;
        } catch (error) {
          console.error('Error executing wallet positions query:', error);
          throw new Error('Failed to fetch wallet positions');
        }
      },
    });
  },
});

export const types = [EventType, MintedTokensType, BurnedTokensType, WalletPositionType];
export const queries = [EventsQuery, MintedTokensQuery, BurnedTokensQuery, WalletPositionQuery];