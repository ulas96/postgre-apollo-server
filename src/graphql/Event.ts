import { extendType, objectType, stringArg } from "nexus"; 
import { Context } from "../types/Context";
import { getXAVAXPriceByTransaction, getXAVAXPrice } from "../helpers/index";

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
      t.string("benefit");  
    },
  });

export const WalletPositionType = objectType({
  name: "WalletPosition",
  definition(t) {
    t.nonNull.string("walletAddress");
    t.nonNull.string("positionAmount");
    t.nonNull.string("averageEntryPrice");
    t.nonNull.string("positionValue");
    t.nonNull.string("pnlPercentage"); // Add this line
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
                ("parsedData"[2] = '0x0000000000000000000000000000000000000000' OR 
                "parsedData"[2] = '0x013b34DBA0d6c9810F530534507144a8646E3273')
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

                // Calculate benefit for each transaction
                const resultWithBenefit = await Promise.all(result.map(async (row: any) => {
                    try {
                        const xavaxCost = await getXAVAXPriceByTransaction(row.transactionHash);
                        const benefit = (parseFloat(row.burnedAmount) * xavaxCost).toFixed(6);
                        return { ...row, benefit };
                    } catch (error) {
                        console.error(`Error calculating benefit for transaction ${row.transactionHash}:`, error);
                        return { ...row, benefit: '0' };
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
              SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "mintedAmount",
              array_agg("transactionHash") as "transactionHashes",
              array_agg(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "amounts"
            FROM event
            WHERE 
              "eventName" = 'Transfer' AND
              "parsedData"[1] = '0x0000000000000000000000000000000000000000'
            ${walletAddress ? `AND "parsedData"[2] = $1` : ''}
            GROUP BY "parsedData"[2]
          ),
          burned AS (
            SELECT 
              "parsedData"[1] as "walletAddress",
              SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "burnedAmount"
            FROM event
            WHERE 
             ( "parsedData"[2] = '0x0000000000000000000000000000000000000000' OR
              "parsedData"[2] = '0x013b34DBA0d6c9810F530534507144a8646E3273')
            ${walletAddress ? `AND "parsedData"[1] = $1` : ''}
            GROUP BY "parsedData"[1]
          )
          SELECT 
            COALESCE(m."walletAddress", b."walletAddress") as "walletAddress",
            (COALESCE(m."mintedAmount", 0) - COALESCE(b."burnedAmount", 0))::TEXT as "positionAmount",
            m."transactionHashes",
            m."amounts"
          FROM minted m
          FULL OUTER JOIN burned b ON m."walletAddress" = b."walletAddress"
          ${walletAddress ? `WHERE COALESCE(m."walletAddress", b."walletAddress") = $1` : ''}
        `;

        try {
          let result;
          if (walletAddress) {
            result = await connection.query(query, [walletAddress]);
          } else {
            result = await connection.query(query);
          }

          // Get current XAVAX price
          const currentXAVAXPrice = await getXAVAXPrice();

          // Calculate average entry price, current value, and PNL for each wallet
          const resultWithCalculations = await Promise.all(result.map(async (row: any) => {
            if (row.transactionHashes && row.amounts) {
              let totalCost = 0;
              for (let i = 0; i < row.transactionHashes.length; i++) {
                const xavaxPrice = await getXAVAXPriceByTransaction(row.transactionHashes[i]);
                totalCost += row.amounts[i] * xavaxPrice;
              }
              const averageEntryPrice = parseFloat((totalCost / parseFloat(row.positionAmount)).toFixed(6));
              const positionValue = (parseFloat(row.positionAmount) * currentXAVAXPrice).toFixed(6);
              const pnlPercentage = ((currentXAVAXPrice / averageEntryPrice - 1) * 100).toFixed(2);
              
              return { 
                ...row, 
                averageEntryPrice: averageEntryPrice.toString(), 
                positionValue, 
                pnlPercentage 
              };
            }
            return { 
              ...row, 
              averageEntryPrice: '0', 
              positionValue: '0', 
              pnlPercentage: '0' 
            };
          }));

          console.log('Wallet Positions Query Result:', resultWithCalculations);
          return resultWithCalculations;
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