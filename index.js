const { ethers } = require('ethers');
require('dotenv').config();

const DEFAULT_RPC_URL = `http://localhost:8545`;
const DEFAULT_PRIVATE_KEY = `0x6eb3c9df7e91b6c96050a929b6e459138af6ae7934b21e073af8adc7b4e4db25`;
const DEFAULT_TRANSACTIONS = 10000;

let RPC_URL = process.env.RPC_URL ? process.env.RPC_URL : DEFAULT_RPC_URL;
let PRIVATE_KEY = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : DEFAULT_PRIVATE_KEY;
let TRANSACTIONS = process.env.TRANSACTIONS ? process.env.TRANSACTIONS : DEFAULT_TRANSACTIONS;

const prepareTransactionPromise = async (privateKey, providerUrl, nTransactions) => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const gasPrice = await provider.getGasPrice();
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("🚀 ~ file: index.js:16 ~ prepareTransactionPromise ~ wallet:", wallet.address)
    let nonce = await wallet.getTransactionCount();
    let noncePending = await provider.getTransactionCount(wallet.address, "pending");
    console.log("🚀 ~ file: index.js:17 ~ prepareTransactionPromise ~ nonce:", nonce);
    console.log("🚀 ~ file: index.js:20 ~ prepareTransactionPromise ~ noncePending:", noncePending);
    
    // const signingPromises = [];
    const startTime = Date.now();

    for (let i = 0; i < nTransactions; i++) {
        // nonce++; // Increment nonce for each transaction

        const tx = {
            chainId: 235,
            to: "0x6f7090364d4aE2C1819693D6382b74C7D004b4B8",
            value: ethers.utils.parseEther("1"),
            // nonce: nonce,
            gasLimit: 21000,
            gasPrice: gasPrice.add(1)
        };

        // Sign the transaction
        await wallet.sendTransaction(tx);

        // Send the transaction
        // const txResponse = await provider.sendTransaction(signedTx);

        // Wait for the transaction to be mined
        // await txResponse.wait();

        console.log(`Preparing and sending transaction: ${i}`);
    }

    const endTime = Date.now();
    const durationInSeconds = (((endTime - startTime) / 1000) / (process.env.BLOCK_TIME * 1000));
    console.log(`Prepare and send transaction time: ${durationInSeconds}`);
    console.log(`Transaction preparation and sending successful.`);

    return;
};

const benchmarkTPS = async (privateKey, providerUrl, nTransactions) => {
    const startTime = Date.now();
    await prepareTransactionPromise(privateKey, providerUrl, nTransactions);
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const tps = nTransactions / durationInSeconds;
    console.log(`Benchmark complete.`);
    console.log(`Transaction amount: ${nTransactions}`)
    console.log(`Transactions per second: ${tps.toFixed(3)}`);
}

// Start benchmarking
benchmarkTPS(PRIVATE_KEY, RPC_URL, TRANSACTIONS).catch((error) => {
    console.error('Error:', error);
});
