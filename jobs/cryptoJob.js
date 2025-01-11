const schedule = require('node-schedule');
const fetchCryptoData = require('../services/fetchCryptoData');
const saveCryptoData = require('../services/saveCryptoData');

async function startCryptoJob() {
    // Immediate execution when the server starts
    console.log('Fetching crypto data immediately after server start...');
    const data = await fetchCryptoData();
    if (data.length) {
        await saveCryptoData(data);
    }

    // Schedule the job to run every 2 hours
    schedule.scheduleJob('0 */2 * * *', async () => { // Every 2 hours
        console.log('Scheduled job: Fetching crypto data...');
        const data = await fetchCryptoData();
        if (data.length) {
            await saveCryptoData(data);
        }
    });
}

module.exports = startCryptoJob;
