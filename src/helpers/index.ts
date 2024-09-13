import axios from "axios";
import { createPublicClient, http, decodeEventLog, parseAbi } from 'viem';
import { avalanche } from 'viem/chains';
import { graphqlUrl, wsAVAXContractAddress, xAVAXContractAddress, aUSDContractAddress, xAVAXAbi } from "../constants/index";

interface Transfer {
  from: string;
  to: string;
  value: string;
  tokenContract: string;
  timestamp: Date;
}

export const weiToEth = (wei: number) => {
    return wei/ 10 ** 18;
}


const getAvaxPrice = async (date: Date) => {
    try {
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
        
        if (response.data && response.data.data && response.data.data.prices && response.data.data.prices.length > 0) {
            return parseFloat(response.data.data.prices[0].price);
        } else {
            console.error(`No price data found for date: ${formattedDate}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching AVAX price for date ${date}:`, error);
        return null;
    }
}

const getTransactionTransfers = async (txHash: `0x${string}`): Promise<Transfer[]> => {
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

const getBlockTimestamp = async (blockNumber: number): Promise<Date> => {
    const client = createPublicClient({
        chain: avalanche,
        transport: http(),
    });

    const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
    return new Date(Number(block.timestamp) * 1000); // Convert seconds to milliseconds
}

// Function to display all transfers
// export const displayAllTransfers = async (txHash: `0x${string}`) => {
//     const transfers = await getTransactionTransfers(txHash);
//     console.log(`Total transfers found: ${transfers.length}`);
//     for (let i = 0; i < transfers.length; i++) {
//         const transfer = transfers[i];
//         console.log(`\nTransfer #${i + 1}:`);
//         console.log(`From: ${transfer.from}`);
//         console.log(`To: ${transfer.to}`);
//         console.log(`Value: ${transfer.value}`);
//         console.log(`Token Contract: ${transfer.tokenContract}`);
//         console.log(`Timestamp: ${transfer.timestamp.toISOString()}`);
//     }
// }

export const getXAVAXPriceByTransaction = async (txHash: `0x${string}`) => {
    try {
        const transfers = await getTransactionTransfers(txHash);

        if (transfers.length === 0) {
            console.error(`No transfers found for transaction: ${txHash}`);
            return 0;
        }

        const wsAVAXTransfer = transfers.find(transfer => transfer.tokenContract === wsAVAXContractAddress.toLowerCase());
        const xAVAXTransfer = transfers.find(transfer => transfer.tokenContract === xAVAXContractAddress.toLowerCase());

        if (!wsAVAXTransfer || !xAVAXTransfer) {
            console.error(`Missing required transfers for transaction: ${txHash}`);
            return 0;
        }

        const wsAVAXPrice = await getAvaxPrice(wsAVAXTransfer.timestamp);

        if (wsAVAXPrice === null) {
            console.error(`Failed to get AVAX price for transaction: ${txHash}`);
            return 0;
        }

        const aUSDTransfer = transfers.find(transfer => transfer.tokenContract === aUSDContractAddress.toLowerCase());

        const price = aUSDTransfer
            ? (wsAVAXPrice * Number(wsAVAXTransfer.value) / 2) / Number(xAVAXTransfer.value)
            : (wsAVAXPrice * Number(wsAVAXTransfer.value)) / Number(xAVAXTransfer.value);

        return price;
    } catch (error) {
        console.error(`Error calculating xAVAX price for transaction ${txHash}:`, error);
        return 0;
    }
}

export const getXAVAXPrice = async () => {
    const client = createPublicClient({
        chain: avalanche,
        transport: http(),
    });

    const nav = await client.readContract({
        address: xAVAXContractAddress,
        abi: xAVAXAbi,
        functionName: 'nav',
    });

    return weiToEth(Number(nav));
}
