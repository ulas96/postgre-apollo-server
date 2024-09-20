
import { extendType, objectType, stringArg, nonNull } from "nexus"; 
import { Context } from "../types/Context";
import { getXAVAXPriceByTransaction, getTimestamp } from "../helpers/index";

/**
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
      t.string("benefit");  
      t.string("createdAt");    
      t.float("timestamp");
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
            walletAddress: nonNull(stringArg()),
        },
        async resolve(_parent, args, context: Context, _info) {
            const { connection } = context;
            const { walletAddress } = args;

            let query = `
              SELECT
                "transactionHash",
                "createdAt",
                "parsedData"[1] as "walletAddress",
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000)::TEXT as "burnedAmount",
                MAX("blockNumber") as "blockNumber"
              FROM event
              WHERE 
                ("parsedData"[2] = '0x0000000000000000000000000000000000000000' OR 
                "parsedData"[2] = '0x013b34DBA0d6c9810F530534507144a8646E3273')
            `;

            if (walletAddress) {
                query += ` AND "parsedData"[1] = $1`;
            }

            query += `
              GROUP BY "transactionHash", "createdAt", "parsedData"[1]
              ORDER BY MAX("blockNumber") DESC
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
                        const timestamp = await getTimestamp(row.blockNumber);
                        return { ...row, benefit, timestamp: timestamp.getTime() };
                    } catch (error) {
                        console.error(`Error calculating benefit for transaction ${row.transactionHash}:`, error);
                        return { ...row, benefit: '0', timestamp: 0 };
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