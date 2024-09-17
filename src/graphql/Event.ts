import { extendType, objectType, stringArg, nonNull } from "nexus"; 
import { Context } from "../types/Context";
import { getXAVAXPriceByTransaction, getXAVAXPrice } from "../helpers/index";

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
        t.nonNull.string("createdAt")
    }
});

/**
 * @title Minted Tokens Type
 * @description Represents minted tokens information
 */
export const MintedTokensType = objectType({
    name: "MintedTokens",
    definition(t) {
    t.string("transactionHash");
      t.string("walletAddress");  
      t.string("mintedAmount"); 
      t.string("createdAt");
      t.string("cost");
      t.string("currentValue");
      t.string("pnlPercentage");
    },
  });

/**
 * @title Burned Tokens Type
 * @description Represents burned tokens information
 */
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

/**
 * @title Wallet Position Type
 * @description Represents a wallet's position information
 */
export const WalletPositionType = objectType({
  name: "WalletPosition",
  definition(t) {
    t.nonNull.string("walletAddress");
    t.nonNull.string("positionAmount");
    t.nonNull.string("averageEntryPrice");
    t.nonNull.string("positionValue");
    t.nonNull.string("pnlPercentage");
    t.nonNull.string("currentXAVAXPrice");
  },
});

/**
 * @title Transfer Type
 * @description Represents a transfer transaction
 */
export const TransferType = objectType({
  name: "Transfer",
  definition(t) {
    t.nonNull.string("transactionHash");
    t.nonNull.string("from");
    t.nonNull.string("to");
    t.nonNull.string("value");
    t.nonNull.string("createdAt");
  },
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

/**
 * @title Minted Tokens Query
 * @description Query to fetch minted tokens information, optionally filtered by wallet address
 * @param walletAddress - Optional wallet address to filter minted tokens
 * @returns List of MintedTokens objects
 */
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

                // Get current XAVAX price
                const currentXAVAXPrice = await getXAVAXPrice();

                // Calculate cost, current value, and PNL for each transaction
                const resultWithPNL = await Promise.all(result.map(async (row: any) => {
                    try {
                        const xavaxCost = await getXAVAXPriceByTransaction(row.transactionHash);
                        const cost = (parseFloat(row.mintedAmount) * xavaxCost).toFixed(6);
                        const currentValue = (parseFloat(row.mintedAmount) * currentXAVAXPrice).toFixed(6);
                        const pnlPercentage = ((currentXAVAXPrice / xavaxCost - 1) * 100).toFixed(2);
                        return { ...row, cost, currentValue, pnlPercentage };
                    } catch (error) {
                        console.error(`Error calculating PNL for transaction ${row.transactionHash}:`, error);
                        return { ...row, cost: '0', currentValue: '0', pnlPercentage: '0' };
                    }
                }));

                console.log('Minted Tokens Query Result:', resultWithPNL);
                return resultWithPNL;
            } catch (error) {
                console.error('Error executing minted tokens query:', error);
                throw new Error('Failed to fetch minted tokens');
            }
        },
      });
    },
  });

/**
 * @title Burned Tokens Query
 * @description Query to fetch burned tokens information, optionally filtered by wallet address
 * @param walletAddress - Optional wallet address to filter burned tokens
 * @returns List of BurnedTokens objects
 */
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

/**
 * @title Wallet Position Query
 * @description Query to fetch wallet positions for a specific wallet address
 * @param walletAddress - Required wallet address to fetch position
 * @returns WalletPosition object, including current xAVAX price
 */
export const WalletPositionQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("walletPosition", {
      type: "WalletPosition",
      args: {
        walletAddress: nonNull(stringArg()),
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
              "parsedData"[1] = '0x0000000000000000000000000000000000000000' AND
              "parsedData"[2] = $1
            GROUP BY "parsedData"[2]
          ),
          burned AS (
            SELECT 
              "parsedData"[1] as "walletAddress",
              SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "burnedAmount"
            FROM event
            WHERE 
              ("parsedData"[2] = '0x0000000000000000000000000000000000000000' OR
               "parsedData"[2] = '0x013b34DBA0d6c9810F530534507144a8646E3273') AND
              "parsedData"[1] = $1
            GROUP BY "parsedData"[1]
          ),
          transfers AS (
            SELECT 
              CASE 
                WHEN "parsedData"[1] = $1 THEN -1 * CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000
                ELSE CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000
              END as amount
            FROM event
            WHERE 
              "eventName" = 'Transfer' AND
              ("parsedData"[1] = $1 OR "parsedData"[2] = $1) AND
              "parsedData"[1] != '0x0000000000000000000000000000000000000000' AND
              "parsedData"[1] != '0x013b34DBA0d6c9810F530534507144a8646E3273' AND
              "parsedData"[2] != '0x0000000000000000000000000000000000000000' AND
              "parsedData"[2] != '0x013b34DBA0d6c9810F530534507144a8646E3273'
          ),
          transfer_balance AS (
            SELECT COALESCE(SUM(amount), 0) as "transferBalance"
            FROM transfers
          )
          SELECT 
            $1 as "walletAddress",
            (COALESCE(m."mintedAmount", 0) - COALESCE(b."burnedAmount", 0) + COALESCE(t."transferBalance", 0))::TEXT as "positionAmount",
            m."mintedAmount"::TEXT as "mintedAmount",
            m."transactionHashes",
            m."amounts"
          FROM (SELECT $1 as "walletAddress") w
          LEFT JOIN minted m ON w."walletAddress" = m."walletAddress"
          LEFT JOIN burned b ON w."walletAddress" = b."walletAddress"
          CROSS JOIN transfer_balance t
        `;

        try {
          console.log('Executing wallet position query for wallet:', walletAddress);
          const result = await connection.query(query, [walletAddress]);
          console.log('Query result:', result);

          if (result.length === 0) {
            console.log('No position found for wallet:', walletAddress);
            return null; // Return null if no position found for the wallet
          }

          const row = result[0];
          console.log('Row data:', row);

          // Get current XAVAX price
          const currentXAVAXPrice = await getXAVAXPrice();
          console.log('Current XAVAX price:', currentXAVAXPrice);

          // Check if position amount is 0
          if (parseFloat(row.positionAmount) === 0) {
            return {
              ...row,
              averageEntryPrice: '0',
              positionValue: '0',
              pnlPercentage: '0',
              currentXAVAXPrice: currentXAVAXPrice.toString()
            };
          }

          // Calculate average entry price based only on minted tokens
          if (row.transactionHashes && row.amounts) {
            let totalCost = 0;
            for (let i = 0; i < row.transactionHashes.length; i++) {
              const xavaxPrice = await getXAVAXPriceByTransaction(row.transactionHashes[i]);
              totalCost += row.amounts[i] * xavaxPrice;
            }
            const averageEntryPrice = parseFloat((totalCost / parseFloat(row.mintedAmount)).toFixed(6));
            const positionValue = (parseFloat(row.positionAmount) * currentXAVAXPrice).toFixed(6);
            const pnlPercentage = ((currentXAVAXPrice / averageEntryPrice - 1) * 100).toFixed(2);
            
            return { 
              ...row, 
              averageEntryPrice: averageEntryPrice.toString(), 
              positionValue, 
              pnlPercentage,
              currentXAVAXPrice: currentXAVAXPrice.toString()
            };
          }
          
          return { 
            ...row, 
            averageEntryPrice: '0', 
            positionValue: '0', 
            pnlPercentage: '0',
            currentXAVAXPrice: currentXAVAXPrice.toString()
          };
        } catch (error) {
          console.error('Error executing wallet position query:', error);
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
          throw new Error(`Failed to fetch wallet position: ${error.message}`);
        }
      },
    });
  },
});

/**
 * @title Transfers Query
 * @description Query to fetch transfers for a specific wallet address
 * @param walletAddress - Required wallet address to fetch transfers
 * @returns List of Transfer objects
 */
export const TransfersQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("transfers", {
      type: "Transfer",
      args: {
        walletAddress: nonNull(stringArg()),
      },
      async resolve(_parent, args, context: Context, _info) {
        const { connection } = context;
        const { walletAddress } = args;

        const query = `
          SELECT 
            "transactionHash",
            "parsedData"[1] as "from",
            "parsedData"[2] as "to",
            (CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000)::TEXT as "value",
            "createdAt"
          FROM event
          WHERE 
            "eventName" = 'Transfer' AND
            ("parsedData"[1] = $1 OR "parsedData"[2] = $1) AND
            "parsedData"[1] != '0x0000000000000000000000000000000000000000' AND
            "parsedData"[1] != '0x013b34DBA0d6c9810F530534507144a8646E3273' AND
            "parsedData"[2] != '0x0000000000000000000000000000000000000000' AND
            "parsedData"[2] != '0x013b34DBA0d6c9810F530534507144a8646E3273'
          ORDER BY "createdAt" DESC
        `;

        try {
          const result = await connection.query(query, [walletAddress]);
          console.log('Transfers Query Result:', result);
          return result;
        } catch (error) {
          console.error('Error executing transfers query:', error);
          throw new Error('Failed to fetch transfers');
        }
      },
    });
  },
});

export const types = [EventType, MintedTokensType, BurnedTokensType, WalletPositionType, TransferType];
export const queries = [EventsQuery, MintedTokensQuery, BurnedTokensQuery, WalletPositionQuery, TransfersQuery];