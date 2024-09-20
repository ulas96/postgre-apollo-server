import { extendType, objectType, stringArg, nonNull } from "nexus"; 
import { Context } from "../types/Context";
import { getXAVAXPriceByTransaction, getXAVAXPrice, } from "../helpers/index";
/**
 * @title Wallet Position Type
 * @description Represents a wallet's position information
 */
export const WalletPositionType = objectType({
    name: "WalletPosition",
    definition(t) {
      t.nonNull.string("walletAddress");
      t.nonNull.string("positionAmount");
      t.nonNull.string("mintedAmount");
      t.nonNull.string("burnedAmount");
      t.nonNull.string("transfersIn");
      t.nonNull.string("transfersOut");
      t.nonNull.string("averageEntryPrice");
      t.nonNull.string("positionValue");
      t.nonNull.string("pnlPercentage");
      t.nonNull.string("currentXAVAXPrice");
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
  
          // First, check for liquidation history
          const liquidationQuery = `
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
  
          let lastLiquidationBlock = null;
          try {
            const liquidationResult = await connection.query(liquidationQuery, [walletAddress]);
            if (liquidationResult[0].isLiquidated) {
              lastLiquidationBlock = liquidationResult[0].lastLiquidation;
            }
          } catch (error) {
            console.error('Error executing liquidation history query:', error);
            throw new Error('Failed to fetch liquidation history');
          }
  
          // Now, modify the main query to consider the liquidation date and correct the position calculation
          const query = `
            WITH minted AS (
              SELECT 
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "mintedAmount",
                array_agg(DISTINCT "transactionHash") as "transactionHashes", 
                array_agg(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "amounts"
              FROM (
                SELECT DISTINCT ON ("transactionHash") *
                FROM event
                WHERE 
                  "eventName" = 'Transfer' AND
                  "parsedData"[1] = '0x0000000000000000000000000000000000000000' AND
                  "parsedData"[2] = $1
                  ${lastLiquidationBlock ? `AND "blockNumber" > $2` : ''}
              ) AS distinct_events
            ),
            burned AS (
              SELECT 
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "burnedAmount",
                array_agg(DISTINCT "transactionHash") as "burnedTransactionHashes"  
              FROM (
                SELECT DISTINCT ON ("transactionHash") *
                FROM event
                WHERE 
                  "eventName" = 'Transfer' AND
                  "parsedData"[1] = $1 AND
                  ("parsedData"[2] = '0x0000000000000000000000000000000000000000' OR
                   "parsedData"[2] = '0x013b34DBA0d6c9810F530534507144a8646E3273')
                  ${lastLiquidationBlock ? `AND "blockNumber" > $2` : ''}
              ) AS distinct_events
            ),
            transfers_in AS (
              SELECT 
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "transfersIn",
                array_agg(DISTINCT "transactionHash") as "transfersInTransactionHashes"  
              FROM (
                SELECT DISTINCT ON ("transactionHash") *
                FROM event
                WHERE 
                  "eventName" = 'Transfer' AND
                  "parsedData"[2] = $1 AND
                  "parsedData"[1] != '0x0000000000000000000000000000000000000000'
                  ${lastLiquidationBlock ? `AND "blockNumber" > $2` : ''}
              ) AS distinct_events
            ),
            transfers_out AS (
              SELECT 
                SUM(CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000) as "transfersOut"
              FROM event
              WHERE 
                "eventName" = 'Transfer' AND
                "parsedData"[1] = $1 AND
                "parsedData"[2] != '0x0000000000000000000000000000000000000000' AND
                "parsedData"[2] != '0x013b34DBA0d6c9810F530534507144a8646E3273'
                ${lastLiquidationBlock ? `AND "blockNumber" > $2` : ''}
            )
            SELECT 
              $1 as "walletAddress",
              (COALESCE(m."mintedAmount", 0) + COALESCE(ti."transfersIn", 0) - COALESCE(b."burnedAmount", 0) - COALESCE(to_out."transfersOut", 0))::TEXT as "positionAmount",
              COALESCE(m."mintedAmount", 0)::TEXT as "mintedAmount",
              COALESCE(b."burnedAmount", 0)::TEXT as "burnedAmount",
              m."transactionHashes",
              m."amounts",
              COALESCE(ti."transfersIn", 0)::TEXT as "transfersIn",
              COALESCE(to_out."transfersOut", 0)::TEXT as "transfersOut"
            FROM (SELECT $1 as "walletAddress") w
            LEFT JOIN minted m ON true
            LEFT JOIN burned b ON true
            LEFT JOIN transfers_in ti ON true
            LEFT JOIN transfers_out to_out ON true
          `;
  
          try {
            //console.log('Executing wallet position query for wallet:', walletAddress);
            let result;
            if (lastLiquidationBlock) {
              result = await connection.query(query, [walletAddress, lastLiquidationBlock]);
            } else {
              result = await connection.query(query, [walletAddress]);
            }
            //console.log('Query result:', result);
  
            if (result.length === 0) {
              //console.log('No position found for wallet:', walletAddress);
              return null; // Return null if no position found for the wallet
            }
  
            const row = result[0];
            //console.log('Row data:', row);
  
            // Get current XAVAX price
            const currentXAVAXPrice = await getXAVAXPrice();
            //console.log('Current XAVAX price:', currentXAVAXPrice);
  
            // Check if position amount is 0
            if (parseFloat(row.positionAmount) < 0.1) {
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
            //console.error('Error executing wallet position query:', error);
            //console.error('Error details:', error.message);
            //console.error('Error stack:', error.stack);
            throw new Error(`Failed to fetch wallet position: ${error.message}`);
          }
        },
      });
    },
  });