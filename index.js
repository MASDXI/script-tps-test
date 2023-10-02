const { ethers  } = require('ethers');
require('dotenv').config()

const DEFAULT_RPC_URL = `http://localhost:8545`;
const DEFAULT_PRIVATE_KEY = `0x6eb3c9df7e91b6c96050a929b6e459138af6ae7934b21e073af8adc7b4e4db25`;
const DEFAULT_TRANSACTIONS = 250

// Replace with your Ethereum RPC_URL, PRIVATE_KEY and TRANSACTIONS in .env file
let RPC_URL = process.env.RPC_URL ? process.env.RPC_URL : DEFAULT_RPC_URL;
let PRIVATE_KEY = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : DEFAULT_PRIVATE_KEY;
let TRANSACTIONS = process.env.TRANSACTIONS ? process.env.TRANSACTIONS : DEFAULT_TRANSACTIONS;

const prepareTransactionPromise = async (privateKey, nTransactions) => {
    const wallet = new ethers.Wallet(privateKey);
    // Create an array to store promises for signing transactions
    const signingPromises = [];
    const startTime = Date.now();
    // Create and sign transactions concurrently
    for (let i = 0; i < nTransactions; i++) {
      signingPromises.push(
        (async () => {
          const tx = {
            chainId: 235,
            to: ethers.Wallet.createRandom().address,
            value: ethers.utils.parseEther("0.01"),
            nonce: i,
            gasLimit: 21000
          };
          const signedTx = await wallet.signTransaction(tx);
          console.log(`Preparing transaction: ${i}`);
          return signedTx;
        })()
      );
    }
    
    const preparedTx = await Promise.all(signingPromises);
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    console.log(`Prepare transaction time: ${durationInSeconds}`)
    console.log(`Transaction preparation successful.`);
  
    return preparedTx;
  };


const sendTransaction = async (batchSignedTx, providerUrl, nTransactions) => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const promises = [];
    for (let i = 0; i < nTransactions; i++) {
        const txResponse = await provider.sendTransaction(batchSignedTx[i]);
        // await txResponse.wait();
        promises.push(txResponse);
        console.log(`Transaction hash: ${txResponse.hash}`);
    }
    await Promise.all(promises);
    console.log(`Send Transaction successful.`);
}

const benchmarkTPS = async (privatekey, providerUrl ,nTransactions) => {
    const preppredTxs = await prepareTransactionPromise(privatekey, nTransactions);
    const startTime = Date.now();
    await sendTransaction(preppredTxs, providerUrl, nTransactions);
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const tps = nTransactions / durationInSeconds;
    console.log(`Benchmark complete.`);
    console.log(`Transactions per second: ${tps.toFixed(3)}`);
}

// Start benchmarking
benchmarkTPS(PRIVATE_KEY, RPC_URL, TRANSACTIONS).catch((error) => {
  console.error('Error:', error);
});

// Testing prepare transaction
// prepareTransactionPromise(PRIVATE_KEY, TRANSACTIONS).catch((error) => {
//   console.error('Error:', error);
// });

