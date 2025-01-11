const CryptoData = require('../models/CryptoData');

async function saveCryptoData(data) {
    try {
        for (const entry of data) {
            await CryptoData.create(entry);
        }
        console.log('Crypto data saved successfully');
    } catch (error) {
        console.error('Error saving data to database:', error.message);
    }
}

module.exports = saveCryptoData;
