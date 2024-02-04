const { JsonRpcProvider, Wallet, parseEther } = require('ethers');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const DEFAULT_RPC_URL = `http://localhost:8545`;
const DEFAULT_TRANSACTIONS = 1428;
const DEFAULT_BLOCKTIME = 12;

let RPC_URL = process.env.RPC_URL ? process.env.RPC_URL : DEFAULT_RPC_URL;
let TRANSACTIONS = process.env.TRANSACTIONS ? process.env.TRANSACTIONS : DEFAULT_TRANSACTIONS;
let BLOCK_TIME = process.env.BLOCK_TIME ? process.env.BLOCK_TIME : DEFAULT_BLOCKTIME;

const loadRecipientPrivateKeys = () => {
  try {
    const data = fs.readFileSync('privateKeys.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading privateKeys.json:', error);
    process.exit(1);
  }
};

const prepareAndSendTransactions = async (privateKeys, providerUrl) => {
  const provider = new JsonRpcProvider(providerUrl);
  let noncePromises = [];

  Object.keys(privateKeys).forEach(async (address) => {
    const privateKey = privateKeys[address];
    const wallet = new Wallet(privateKey, providerUrl);
    noncePromises.push(provider.getTransactionCount(wallet.address));
  });

  const nonces = await Promise.all(noncePromises);
  const gasPrice = (await provider.getFeeData()).gasPrice;
  const chainId = (await provider.getNetwork()).chainId;

  const startTime = Date.now();
  const signingPromises = [];

  for (let i = 0; i < TRANSACTIONS; i++) {
    Object.keys(privateKeys).forEach(async (address, index) => {
      const nonce = nonces[index];
      const privateKey = privateKeys[address];

      const wallet = new Wallet(privateKey, providerUrl);
      const tx = {
        chainId: chainId,
        to: address,
        value: parseEther('0.001'),
        nonce: nonce,
        gasLimit: 21000,
        gasPrice: gasPrice,
        data: '0x',
      };
      nonces[index]++;

      // Sign the transaction
      const signingPromise = wallet.signTransaction(tx);
      signingPromises.push(signingPromise);
    });
  }

  const signedTransactions = await Promise.all(signingPromises);
  console.log("🚀 ~ file: index.js:65 ~ prepareAndSendTransactions ~ signedTransactions:", signedTransactions)
  const endTime = Date.now();
  const durationInSeconds = (endTime - startTime) / 1000;
  console.log(`Prepare and send transaction time: ${durationInSeconds} sec`);
  console.log('Transaction preparation successful.');
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
    maxBodyLength: Infinity,
  };
  await axios(axiosConfig);
};

const sendTxs = async (transactions) => {
  const startTime = Date.now();
  const datas = [];

  for (let i = 0; i < 1000; i++) {
    datas.push({
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [transactions[i]],
      id: 1,
    });
  }

  await sendBatch(datas);
  const endTime = Date.now();
  const durationInSeconds = (endTime - startTime) / 1000;
  const txs = TRANSACTIONS / durationInSeconds;
  const tps = TRANSACTIONS / BLOCK_TIME;
  console.log('Benchmark complete.');
  console.log(`Transaction amount: ${TRANSACTIONS}`);
  console.log(`Target Transactions per second: ${tps.toFixed(3)} tx/s`);
  console.log(`Duration: ${durationInSeconds} seconds`);
  console.log(`Broadcast Transactions per second: ${txs.toFixed(3)} tx/s`);
};

const benchmarkTPS = async (providerUrl) => {
  const privateKeys = loadRecipientPrivateKeys();
  const transactions = await prepareAndSendTransactions(privateKeys, providerUrl);
  await sendTxs(transactions);
};

// Start benchmarking
benchmarkTPS(RPC_URL).catch((error) => {
  console.error('Error:', error);
});