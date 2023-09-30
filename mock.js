// Define a function to generate a random transaction
function generateRandomTransaction() {
  const sender = "Address" + Math.floor(Math.random() * 10); // Generate random sender address
  const recipient = "Address" + Math.floor(Math.random() * 10); // Generate random recipient address
  const value = Math.floor(Math.random() * 10); // Generate random transaction value
  const data = null; // Data is null in this example

  return { sender, recipient, value, data };
}

// Generate a random number of transactions
const numTransactions = 500; // Adjust the number of transactions as needed
const transactions = [];

for (let i = 0; i < numTransactions; i++) {
  transactions.push(generateRandomTransaction());
}

// Initialize counters for conflicts and non-conflicts
let conflictCount = 0;
let nonConflictCount = 0;

// Compare transactions for conflicts
for (let i = 0; i < transactions.length - 1; i++) {
  for (let j = i + 1; j < transactions.length; j++) {
    const tx1 = transactions[i];
    const tx2 = transactions[j];

    // Check if sender and recipient are the same
    if (tx1.sender === tx2.sender || tx1.sender === tx2.recipient || tx1.recipient === tx2.sender || tx1.recipient === tx2.recipient) {
      // Conflict detected: transactions are going to read and write to the same value
      conflictCount++;
      // Handle conflict or record conflict information
    } else {
      // No conflict detected
      nonConflictCount++;
    }
  }
}

// Calculate conflict rate and non-conflict rate
const totalPairs = (numTransactions * (numTransactions - 1)) / 2; // Total possible pairs
const conflictRate = (conflictCount / totalPairs) * 100; // Conflict rate as a percentage
const nonConflictRate = (nonConflictCount / totalPairs) * 100; // Non-conflict rate as a percentage

// Print the results
console.log(`Total Transactions: ${numTransactions}`);
console.log(`Total Possible Transaction Pairs: ${totalPairs}`);
console.log(`Number of Conflicts Detected: ${conflictCount}`);
console.log(`Number of Non-Conflicts Detected: ${nonConflictCount}`);
console.log(`Conflict Rate: ${conflictRate.toFixed(2)}%`);
console.log(`Non-Conflict Rate: ${nonConflictRate.toFixed(2)}%`);
