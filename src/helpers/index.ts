import axios from "axios";
import { createPublicClient, http, decodeEventLog, parseAbi } from 'viem';
import { avalanche } from 'viem/chains';


export const getAvaxPrice = async (date: Date) => {
    const graphqlUrl = "http://34.90.72.213:5151";

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

export const getTransactionTransfers = async (txHash: `0x${string}`) => {


    const client = createPublicClient({
        chain: avalanche,
        transport: http(),
    });

    const transferEventAbi = parseAbi([
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ]);

    const receipt = await client.getTransactionReceipt({ hash: txHash });
    console.log(receipt);

    receipt.logs.forEach((log) => {
        try {
          const decodedLog = decodeEventLog({
            abi: transferEventAbi,
            data: log.data,
            topics: log.topics,
          });
          
          if (decodedLog.eventName === 'Transfer') {
            console.log('Token Transfer:');
            console.log('From:', decodedLog.args.from);
            console.log('To:', decodedLog.args.to);
            console.log('Value:', decodedLog.args.value.toString());
            console.log('Token Contract:', log.address);
            console.log('---');
          }
        } catch (error) {
          // This log is not a Transfer event, skip it
        }
      });
}
