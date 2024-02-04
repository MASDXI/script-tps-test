const fs = require('fs');
const { Wallet, JsonRpcProvider } = require('ethers');

const genesisFile = 'genesis.json';
const outputGenesisFileName = 'output.json';
const outputPrivateKeysFileName = 'privateKeys.json';
const numberOfAddresses = 10000;

// Object to store addresses and private keys
const addressesWithPrivateKeys = {};

// Read the genesis file
fs.promises.readFile(genesisFile, 'utf8')
  .then(data => {
    const genesis = JSON.parse(data);
    const allocations = genesis.alloc;

    // Generate new addresses and private keys
    for (let i = 0; i < numberOfAddresses; i++) {
      const wallet = Wallet.createRandom();
      const address = wallet.address;
      const privateKey = wallet.privateKey;

      // Add the new allocation to the genesis object
      allocations[address] = {
        balance: "1000000000000000000000000000" // Set the desired balance
      };

      // Store the private key in the object
      addressesWithPrivateKeys[address] = privateKey;
    }

    // Write the updated genesis object to the output file
    return Promise.all([
      fs.promises.writeFile(outputGenesisFileName, JSON.stringify(genesis, null, 2)),
      fs.promises.writeFile(outputPrivateKeysFileName, JSON.stringify(addressesWithPrivateKeys, null, 2))
    ]);
  })
  .then(() => {
    console.log(`Successfully generated ${numberOfAddresses} addresses and saved to ${outputGenesisFileName}`);
    console.log(`Private keys saved to ${outputPrivateKeysFileName}`);
  })
  .catch(err => {
    console.error('Error:', err);
  });
