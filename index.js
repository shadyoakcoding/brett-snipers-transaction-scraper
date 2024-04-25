const fs = require('fs');
//const fetch = require('node-fetch');

const BASESCAN_API_STRING = `https://api.basescan.org/api?module=account&action=tokentx&contractaddress=0x532f27101965dd16442e59d40670faf5ebb142e4&address=`;
const SNIPER_LIST_FILE = 'Sniper List.csv';
const WHITELISTED_TRANSACTIONS_FILE = 'Whitelisted Transactions.csv';

// Read the Sniper List CSV file
fs.readFile(SNIPER_LIST_FILE, 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading Sniper List file:', err);
        return;
    }

    // Split CSV data by lines
    const addresses = data.trim().split('\n');

    // Process each Ethereum address
    for (const address of addresses) {
        const apiString = `${BASESCAN_API_STRING}${address}&page=1&offset=100&startblock=0&endblock=10985727&sort=asc&apikey=${process.env.BASESCANAPIKEY}`;

        // Fetch transaction data from BaseScan API
        try {
            const response = await fetch(apiString);
            const responseData = await response.json();

            // Check if API response is successful
            if (responseData.status === '1') {
                const transactions = responseData.result;

                // Extract transaction hashes
                const transactionHashes = transactions.map(tx => tx.hash);

                // Append transaction hashes to the Whitelisted Transactions CSV file
                fs.appendFileSync(WHITELISTED_TRANSACTIONS_FILE, transactionHashes.join('\n') + '\n', 'utf8');
            } else {
                console.error('API request unsuccessful:', responseData.message);
            }
        } catch (error) {
            console.error('Error fetching or processing data for address', address, error);
        }

        // Wait 5 seconds before making the next API call
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
});