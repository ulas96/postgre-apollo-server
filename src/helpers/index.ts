import axios from "axios";
import { createPublicClient, http, decodeEventLog, parseAbi } from 'viem';
import { avalanche } from 'viem/chains';
import { graphqlUrl/*, wsAVAXContractAddress, xAVAXContractAddress, aUSDCContractAddress*/ } from "../constants";

interface Transfer {
  from: string;
  to: string;
  value: string;
  tokenContract: string;
  timestamp: Date;
}

export const getAvaxPrice = async (date: Date) => {
    // Format the date to YYYY-MM-DDTHH:mm:00.000Z
    const formattedDate = date.toISOString().replace(/:\d{2}\.\d{3}Z$/, ':00.000Z');

    const query = `
        query {
            prices(date: "${formattedDate}") {
                date    
                price
            }
        }
    `;

    const response = await axios.post(graphqlUrl, { query });
    console.log(response.data.data.prices[0].price);
}

export const getTransactionTransfers = async (txHash: `0x${string}`): Promise<Transfer[]> => {
    const client = createPublicClient({
        chain: avalanche,
        transport: http(),
    });

    const transferEventAbi = parseAbi([
        'event Transfer(address indexed from, address indexed to, uint256 value)',
    ]);
    
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    const transfers: Transfer[] = [];

    for (const log of receipt.logs) {
        try {
            const decodedLog = decodeEventLog({
                abi: transferEventAbi,
                data: log.data,
                topics: log.topics,
            });
          
            if (decodedLog.eventName === 'Transfer') {
                transfers.push({
                    from: decodedLog.args.from,
                    to: decodedLog.args.to,
                    value: decodedLog.args.value.toString(),
                    tokenContract: log.address,
                    timestamp: await getBlockTimestamp(Number(log.blockNumber))
                });
            }
        } catch (error) {
            // This log is not a Transfer event, skip it
        }
    }

    return transfers;
}

export const getBlockTimestamp = async (blockNumber: number): Promise<Date> => {
    const client = createPublicClient({
        chain: avalanche,
        transport: http(),
    });

    const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
    return new Date(Number(block.timestamp) * 1000); // Convert seconds to milliseconds
}

// Function to display all transfers
const displayAllTransfers = async (txHash: `0x${string}`) => {
    const transfers = await getTransactionTransfers(txHash);
    console.log(`Total transfers found: ${transfers.length}`);
    for (let i = 0; i < transfers.length; i++) {
        const transfer = transfers[i];
        console.log(`\nTransfer #${i + 1}:`);
        console.log(`From: ${transfer.from}`);
        console.log(`To: ${transfer.to}`);
        console.log(`Value: ${transfer.value}`);
        console.log(`Token Contract: ${transfer.tokenContract}`);
        console.log(`Timestamp: ${transfer.timestamp.toISOString()}`);
    }
}

// Call the function with your transaction hash
displayAllTransfers("0x4179dd53efa998cf9148a949f97554b663c57f902fe70369d76dc8c314c6af82");