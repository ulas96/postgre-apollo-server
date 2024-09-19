import { extendType, objectType, stringArg, nonNull } from "nexus"; 
import { Context } from "../types/Context";
import { getTimestamp } from "../helpers/index";

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
      t.nonNull.float("timestamp");
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
            SELECT DISTINCT ON ("transactionHash")
              "transactionHash",
              "parsedData"[1] as "from",
              "parsedData"[2] as "to",
              (CAST("parsedData"[3] AS DECIMAL(65,0)) / 1000000000000000000)::TEXT as "value",
              "blockNumber"
            FROM event
            WHERE 
              "eventName" = 'Transfer' AND
              ("parsedData"[1] = $1 OR "parsedData"[2] = $1) AND
              "parsedData"[1] != '0x0000000000000000000000000000000000000000' AND
              "parsedData"[1] != '0x013b34DBA0d6c9810F530534507144a8646E3273' AND
              "parsedData"[2] != '0x0000000000000000000000000000000000000000' AND
              "parsedData"[2] != '0x013b34DBA0d6c9810F530534507144a8646E3273'
            ORDER BY "transactionHash", "blockNumber" DESC
          `;
  
          try {
            const result = await connection.query(query, [walletAddress]);
  
            // Calculate timestamp for each transfer
            const transfersWithTimestamp = await Promise.all(result.map(async (transfer: any) => {
              const timestamp = await getTimestamp(transfer.blockNumber);
              return { ...transfer, timestamp: timestamp.getTime() };
            }));
  
            console.log('Transfers Query Result:', transfersWithTimestamp);
            return transfersWithTimestamp;
          } catch (error) {
            console.error('Error executing transfers query:', error);
            throw new Error('Failed to fetch transfers');
          }
        },
      });
    },
  });