import { extendType, objectType, stringArg, nonNull } from "nexus"; 
import { Context } from "../types/Context";
import { getXAVAXPriceByTransaction, getXAVAXPrice, getTimestamp } from "../helpers/index";


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
      t.string("cost");
      t.string("currentValue");
      t.string("pnlPercentage");
      t.string("createdAt"); 
      t.float("timestamp");
    },
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
            walletAddress: nonNull(stringArg()),
        },
        async resolve(_parent, args, context: Context, _info) {
            const { connection } = context;
            const { walletAddress } = args;

            let query = `
              SELECT 
                "transactionHash",
                "createdAt",
                "parsedData"[2] as "walletAddress",
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000)::TEXT as "mintedAmount",
                MAX("blockNumber") as "blockNumber"
              FROM event
              WHERE 
                "eventName" = 'Transfer' AND
                "parsedData"[1] = '0x0000000000000000000000000000000000000000'
            `;

            if (walletAddress) {
                query += ` AND "parsedData"[2] = $1`;
            }

            query += `
              GROUP BY "transactionHash", "createdAt", "parsedData"[2]
              ORDER BY MAX("blockNumber") DESC
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
                        const timestamp = await getTimestamp(row.blockNumber);
                        return { ...row, cost, currentValue, pnlPercentage, timestamp: timestamp.getTime() };
                    } catch (error) {
                        //console.error(`Error calculating PNL for transaction ${row.transactionHash}:`, error);
                        return { ...row, cost: '0', currentValue: '0', pnlPercentage: '0', timestamp: 0 };
                    }
                }));

                //console.log('Minted Tokens Query Result:', resultWithPNL);
                return resultWithPNL;
            } catch (error) {
                //console.error('Error executing minted tokens query:', error);
                throw new Error('Failed to fetch minted tokens');
            }
        },
      });
    },
  });