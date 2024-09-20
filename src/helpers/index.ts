import { createPublicClient, http } from 'viem';
import { avalanche } from 'viem/chains';

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