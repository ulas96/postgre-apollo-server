import { extendType, objectType, stringArg, nonNull } from "nexus"; 
import { Context } from "../types/Context";



/**
 * @title Liquidation History Type
 * @description Represents liquidation history information for a wallet
 */
export const LiquidationHistoryType = objectType({
  name: "LiquidationHistory",
  definition(t) {
    t.nonNull.boolean("isLiquidated");
    t.int("lastLiquidation");
  },
});


/**
 * @title Liquidation History Query
 * @description Query to fetch liquidation history for a specific wallet address
 * @param walletAddress - Required wallet address to fetch liquidation history
 * @returns LiquidationHistory object
 */
export const LiquidationHistoryQuery = extendType({
    type: "Query",
    definition(t) {
      t.field("liquidationHistory", {
        type: "LiquidationHistory",
        args: {
          walletAddress: nonNull(stringArg()),
        },
        async resolve(_parent, args, context: Context, _info) {
          const { connection } = context;
          const { walletAddress } = args;
  
          const query = `
            WITH all_transactions AS (
              SELECT
                "blockNumber",
                CASE
                  WHEN "eventName" = 'Transfer' AND "parsedData"[1] = '0x0000000000000000000000000000000000000000' THEN CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000
                  WHEN "eventName" = 'Transfer' AND "parsedData"[2] = '0x0000000000000000000000000000000000000000' THEN -CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000
                  WHEN "eventName" = 'Transfer' AND "parsedData"[1] = $1 THEN -CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000
                  WHEN "eventName" = 'Transfer' AND "parsedData"[2] = $1 THEN CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000
                  ELSE 0
                END as amount
              FROM event
              WHERE
                ("parsedData"[1] = $1 OR "parsedData"[2] = $1)
              ORDER BY "blockNumber"
            ),
            running_balance AS (
              SELECT
                "blockNumber",
                amount,
                SUM(amount) OVER (ORDER BY "blockNumber") as balance
              FROM all_transactions
            ),
            liquidation_events AS (
              SELECT
                "blockNumber",
                balance
              FROM running_balance
              WHERE balance <= 0.01
            )
            SELECT
              CASE WHEN COUNT(*) > 0 THEN true ELSE false END as "isLiquidated",
              MAX("blockNumber") as "lastLiquidation"
            FROM liquidation_events
          `;
  
          try {
            const result = await connection.query(query, [walletAddress]);
            //console.log('Liquidation History Query Result:', result);
            if (result.length === 0) {
              return { isLiquidated: false, lastLiquidation: null };
            }
            return {
              isLiquidated: result[0].isLiquidated,
              lastLiquidation: result[0].isLiquidated ? result[0].lastLiquidation : null,
            };
          } catch (error) {
            //console.error('Error executing liquidation history query:', error);
            throw new Error('Failed to fetch liquidation history');
          }
        },
      });
    },
  });
  