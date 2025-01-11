const axios = require('axios');

const COINS = ['bitcoin', 'matic-network', 'ethereum'];

async function fetchCryptoData() {
    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(
            ','
        )}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`;
        const response = await axios.get(url);

        return Object.keys(response.data).map(coinId => ({
            coinId,
            name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
            currentPrice: response.data[coinId].usd,
            marketCap: response.data[coinId].usd_market_cap,
            change24h: response.data[coinId].usd_24h_change,
        }));
    } catch (error) {
        console.error('Error fetching data from CoinGecko:', error.message);
        return [];
    }
}

module.exports = fetchCryptoData;
