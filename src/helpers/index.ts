





import { createPublicClient, http } from 'viem';
import { avalanche } from 'viem/chains';

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
  chain: avalanche,
  transport: http(),
});


export async function getTokenTransfers(txHash: `0x${string}`) {
    // ERC-20 Transfer event ABI
// const transferEventAbi = parseAbi([
//     'event Transfer(address indexed from, address indexed to, uint256 value)',
//   ]);

  // Fetch transaction receipt
  const receipt = await client.getTransactionReceipt({ hash: txHash });
  
  // Process logs
  receipt.logs.forEach((log) => {
    // try {
    //   const decodedLog = decodeEventLog({
    //     abi: transferEventAbi,
    //     data: log.data,
    //     topics: log.topics,
    //   });
      
    //   if (log.address === '0x698c34bad17193af7e1b4eb07d1309ff6c5e715e') {
    //     console.log('Token Transfer:');
    //     console.log('From:', decodedLog.args.from);
    //     console.log('To:', decodedLog.args.to);
    //     console.log('Value:', decodedLog.args.value.toString());
    //     console.log('Token Contract:', log.address);
    //     console.log('---');
    //   }
    // } catch (error) {
    //   // This log is not a Transfer event, skip it
    // }
    console.log(log);
  });

  return receipt.logs;
}



async function main() {
    const txHash = '0x4179dd53efa998cf9148a949f97554b663c57f902fe70369d76dc8c314c6af82';
    const transfers = await getTokenTransfers(txHash);
    console.log(transfers);
}

main();


