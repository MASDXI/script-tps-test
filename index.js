const { JsonRpcProvider, Wallet, parseEther, ethers } = require('ethers');
require('dotenv').config();

const DEFAULT_RPC_URL = `http://localhost:8545`;
const DEFAULT_PRIVATE_KEY = `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`;
const DEFAULT_TRANSACTIONS = 250;
const DEFAULT_BLOCKTIME = 15;

let RPC_URL = process.env.RPC_URL ? process.env.RPC_URL : DEFAULT_RPC_URL;
let PRIVATE_KEY = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : DEFAULT_PRIVATE_KEY;
let TRANSACTIONS = process.env.TRANSACTIONS ? process.env.TRANSACTIONS : DEFAULT_TRANSACTIONS;
let BLOCK_TIME = process.env.BLOCK_TIME ? process.env.BLOCK_TIME: DEFAULT_BLOCKTIME;

const prepareTransactionPromise = async (privateKey, providerUrl) => {
    const provider = new JsonRpcProvider(providerUrl);
    const wallet = new Wallet(privateKey, provider);
    const gasPrice = (await provider.getFeeData()).gasPrice
    const chainId = (await provider.getNetwork()).chainId 
    let nonce = await provider.getTransactionCount(wallet.getAddress())

    const signingPromises = [];
    const startTime = Date.now();

    for (let i = 0; i < TRANSACTIONS; i++) {
        let tx = {
            chainId: chainId,
            to: "0x6f7090364d4aE2C1819693D6382b74C7D004b4B8",
            value: parseEther("1"),
            nonce: nonce,
            gasLimit: 21000,
            gasPrice: gasPrice,
            data: "0x"
        }
        nonce++
        // Sign the transaction
        const signingPromise = await wallet.signTransaction(tx);
        signingPromises.push(signingPromise);
    }
    const signedTransactions = await Promise.all(signingPromises);
    const endTime = Date.now();
    const durationInSeconds = (((endTime - startTime) / 1000));
    console.log(`Prepare and send transaction time: ${durationInSeconds} sec`);
    console.log(`Transaction preparation successful.`);
    return signedTransactions;
};

const sendTxs = async (providerUrl, transactions) => {
    const provider = new JsonRpcProvider(providerUrl);
    const txPromises = [];
    for (let i = 0; i < TRANSACTIONS; i++) {
        const signingPromise = await provider.broadcastTransaction(transactions[i])
        txPromises.push(signingPromise);
    }
    await Promise.all(txPromises);
    // @TODO sendSignedTx
}

const benchmarkTPS = async (privateKey, providerUrl) => {
    const startTime = Date.now();
    const transactions = await prepareTransactionPromise(privateKey, providerUrl);
    await sendTxs(providerUrl, transactions)
    const endTime = Date.now();
    const durationInSeconds = (((endTime - startTime) / 1000) / (BLOCK_TIME * 1000));
    const tps = TRANSACTIONS / durationInSeconds;
    console.log(`Benchmark complete.`);
    console.log(`Transaction amount: ${TRANSACTIONS}`)
    console.log(`Transactions per second: ${tps.toFixed(3)} sec`);
}

// Start benchmarking
benchmarkTPS(PRIVATE_KEY, RPC_URL).catch((error) => {
    console.error('Error:', error);
});
