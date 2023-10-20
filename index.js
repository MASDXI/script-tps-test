const { JsonRpcProvider, Wallet, parseEther, ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

const DEFAULT_RPC_URL = `http://localhost:8545`;
const DEFAULT_PRIVATE_KEY = `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`;
const DEFAULT_TRANSACTIONS = 1428;
const DEFAULT_BLOCKTIME = 12;

let RPC_URL = process.env.RPC_URL ? process.env.RPC_URL : DEFAULT_RPC_URL;
let PRIVATE_KEY = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : DEFAULT_PRIVATE_KEY;
let TRANSACTIONS = process.env.TRANSACTIONS ? process.env.TRANSACTIONS : DEFAULT_TRANSACTIONS;
let BLOCK_TIME = process.env.BLOCK_TIME ? process.env.BLOCK_TIME: DEFAULT_BLOCKTIME;

const prepareTransactionPromise = async (privateKey, providerUrl) => {
    const provider = new JsonRpcProvider(providerUrl);
    const wallet = new Wallet(privateKey, providerUrl);
    const gasPrice = (await provider.getFeeData()).gasPrice;
    const chainId = (await provider.getNetwork()).chainId;
    let nonce = await provider.getTransactionCount(wallet.getAddress());

    const signingPromises = [];
    const startTime = Date.now();

    for (let i = 0; i < TRANSACTIONS; i++) {
        let tx = {
            chainId: chainId,
            to: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
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

const sendBatch = async (signedTx) => {
    const axiosConfig = {
      method: 'post',
      url: RPC_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: signedTx,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    };
    axios(axiosConfig);
};

const sendTxs = async (transactions) => {  
    const startTime = Date.now();
    const datas = [];
    for (let i = 0; i < transactions.length; i++) {
      // Ensure you set http max connect.
      datas.push({
          jsonrpc: '2.0',
          method: 'eth_sendRawTransaction',
          params: [transactions[i]], // Replace with your signed transaction
          id: 1,
        })
    }

    await sendBatch(datas);
  
    // Wait for all batchPromises to resolve
  
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const txs = TRANSACTIONS / durationInSeconds;
    const tps = TRANSACTIONS / BLOCK_TIME;
    console.log(`Benchmark complete.`);
    console.log(`Transaction amount: ${TRANSACTIONS}`);
    console.log(`Target Transactions per second: ${tps.toFixed(3)} tx/s`);
    console.log(`Duration: ${durationInSeconds} seconds`)
    console.log(`Broadcast Transactions per second: ${txs.toFixed(3)} tx/s`);
};

const benchmarkTPS = async (privateKey, providerUrl) => {
    const transactions = await prepareTransactionPromise(privateKey, providerUrl);
    await sendTxs(transactions)
    // @TODO get tx lenght in block to ensure tx are append in block?
}

// Start benchmarking
benchmarkTPS(PRIVATE_KEY, RPC_URL).catch((error) => {
    console.error('Error:', error);
});
