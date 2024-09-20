/**
 * @file index.ts
 * @description Helper functions for XAVAX price calculations and transaction analysis.
 */

import axios from "axios";
import dotenv from "dotenv";
import { createPublicClient, http, decodeEventLog, parseAbi } from 'viem';
import { avalanche } from 'viem/chains';
import { wsAVAXContractAddress, xAVAXContractAddress, aUSDContractAddress, xAVAXAbi } from "../constants/index";

dotenv.config();

/**
 * @typedef Transfer
 * @description Represents a token transfer event.
 */
interface Transfer {
  from: string;
  to: string;
  value: string;
  tokenContract: string;
  timestamp: Date;
}

/**
 * @notice Converts wei to ETH
 * @param wei The amount in wei
 * @returns The equivalent amount in ETH
 */
export const weiToEth = (wei: number) => {
    return wei / 10 ** 18;
}

/**
 * @notice Fetches the AVAX price for a given date
 * @param date The date for which to fetch the price
 * @returns The AVAX price or null if not found
 */
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

        const response = await axios.post(process.env.GRAPHQL_URL as string, { query });
        
        if (response.data && response.data.data && response.data.data.prices && response.data.data.prices.length > 0) {
            return parseFloat(response.data.data.prices[0].price);
        } else {
            //console.error(`No price data found for date: ${formattedDate}`);
            return null;
        }
    } catch (error) {
        //console.error(`Error fetching AVAX price for date ${date}:`, error);
        return null;
    }
}

/**
 * @notice Retrieves all transfer events from a transaction
 * @param txHash The transaction hash
 * @returns An array of Transfer objects
 */
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
                    timestamp: await getTimestamp(Number(log.blockNumber))
                });
            }
        } catch (error) {}
    }

    return transfers;
}

/**
 * @notice Fetches the timestamp of a block
 * @param blockNumber The block number
 * @returns The timestamp of the block as a Date object
 */
export const getTimestamp = async (blockNumber: number) => {
    const client = createPublicClient({
        chain: avalanche,
        transport: http(),
    });

    const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
    return new Date(Number(block.timestamp) * 1000);
}

/**
 * @notice Calculates the XAVAX price for a given transaction
 * @param txHash The transaction hash
 * @returns The calculated XAVAX price or 0 if calculation fails
 */
export const getXAVAXPriceByTransaction = async (txHash: `0x${string}`) => {
    try {
        const transfers = await getTransactionTransfers(txHash);

        if (transfers.length === 0) {
            //console.error(`No transfers found for transaction: ${txHash}`);
            return 0;
        }

        const wsAVAXTransfer = transfers.find(transfer => transfer.tokenContract === wsAVAXContractAddress.toLowerCase());
        const xAVAXTransfer = transfers.find(transfer => transfer.tokenContract === xAVAXContractAddress.toLowerCase());

        if (!wsAVAXTransfer || !xAVAXTransfer) {
            //console.error(`Missing required transfers for transaction: ${txHash}`);
            return 0;
        }

        const wsAVAXPrice = await getAvaxPrice(wsAVAXTransfer.timestamp);

        if (wsAVAXPrice === null) {
            //console.error(`Failed to get AVAX price for transaction: ${txHash}`);
            return 0;
        }

        const aUSDTransfer = transfers.find(transfer => transfer.tokenContract === aUSDContractAddress.toLowerCase());

        const price = aUSDTransfer
            ? (wsAVAXPrice * Number(wsAVAXTransfer.value) / 2) / Number(xAVAXTransfer.value)
            : (wsAVAXPrice * Number(wsAVAXTransfer.value)) / Number(xAVAXTransfer.value);

        return price;
    } catch (error) {
        //console.error(`Error calculating xAVAX price for transaction ${txHash}:`, error);
        return 0;
    }
}

/**
 * @notice Fetches the current XAVAX price
 * @returns The current XAVAX price in ETH
 */
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
