const fs = require('fs');

const TRANSACTIONS_FILE = 'Whitelisted Transactions.csv';
const TRANSACTION_BUNDLES_FOLDER = 'Transaction Bundles';
const MAX_TRANSACTIONS_PER_FILE = 30;

// Create Transaction Bundles folder if it doesn't exist
if (!fs.existsSync(TRANSACTION_BUNDLES_FOLDER)) {
    fs.mkdirSync(TRANSACTION_BUNDLES_FOLDER);
}

// Read transactions from Whitelisted Transactions.csv
fs.readFile(TRANSACTIONS_FILE, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading Whitelisted Transactions file:', err);
        return;
    }

    // Split transactions by lines
    const transactions = data.trim().split('\n');

    // Bundle transactions into multiple CSV files
    let transactionCount = 0;
    let bundleNumber = 1;
    let currentBundleTransactions = [];

    for (const transaction of transactions) {
        const transactionHash = transaction.trim();

        // Check if transaction hash is not a duplicate
        if (!currentBundleTransactions.includes(transactionHash)) {
            // Add transaction to current bundle
            currentBundleTransactions.push(transactionHash);
            transactionCount++;

            // Check if maximum transactions per file is reached
            if (transactionCount === MAX_TRANSACTIONS_PER_FILE) {
                // Write current bundle to CSV file
                const fileName = `Transactions ${bundleNumber * MAX_TRANSACTIONS_PER_FILE - MAX_TRANSACTIONS_PER_FILE + 1}-${bundleNumber * MAX_TRANSACTIONS_PER_FILE}.csv`;
                const filePath = `${TRANSACTION_BUNDLES_FOLDER}/${fileName}`;
                fs.writeFileSync(filePath, 'chain,transaction\n');
                currentBundleTransactions.forEach(hash => fs.appendFileSync(filePath, `base,${hash}\n`, 'utf8'));

                // Reset variables for next bundle
                transactionCount = 0;
                bundleNumber++;
                currentBundleTransactions = [];
            }
        }
    }

    // Write remaining transactions to last CSV file
    if (currentBundleTransactions.length > 0) {
        const fileName = `Transactions ${bundleNumber * MAX_TRANSACTIONS_PER_FILE - MAX_TRANSACTIONS_PER_FILE + 1}-${bundleNumber * MAX_TRANSACTIONS_PER_FILE}.csv`;
        const filePath = `${TRANSACTION_BUNDLES_FOLDER}/${fileName}`;
        fs.writeFileSync(filePath, 'chain,transaction\n');
        currentBundleTransactions.forEach(hash => fs.appendFileSync(filePath, `base,${hash}\n`, 'utf8'));
    }

    console.log('Transaction bundling complete.');
});
