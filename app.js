require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const startCryptoJob = require('./jobs/cryptoJob');
const CryptoData = require('./models/CryptoData');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB Atlas
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Start the crypto job immediately
startCryptoJob();

// Routes

// 1. /stats endpoint
app.get('/api/stats', async (req, res) => {
    const { coin } = req.query;

    // Validate the query parameter
    if (!coin || !['bitcoin', 'matic-network', 'ethereum'].includes(coin)) {
        return res.status(400).json({ error: 'Invalid or missing coin parameter. Allowed values: bitcoin, matic-network, ethereum.' });
    }

    try {
        // Fetch the latest entry for the requested coin
        const latestData = await CryptoData.findOne({ coinId: coin })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .exec();

        if (!latestData) {
            return res.status(404).json({ error: 'No data found for the requested cryptocurrency.' });
        }

        // Format the response
        const response = {
            price: latestData.currentPrice,
            marketCap: latestData.marketCap,
            '24hChange': latestData.change24h,
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching stats:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// 2. /deviation endpoint
app.get('/api/deviation', async (req, res) => {
    const { coin } = req.query;

    // Validate the query parameter
    if (!coin || !['bitcoin', 'matic-network', 'ethereum'].includes(coin)) {
        return res.status(400).json({ error: 'Invalid or missing coin parameter. Allowed values: bitcoin, matic-network, ethereum.' });
    }

    try {
        // Fetch the last 100 records for the requested coin
        const records = await CryptoData.find({ coinId: coin })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .limit(100)
            .exec();

        if (records.length === 0) {
            return res.status(404).json({ error: 'No data found for the requested cryptocurrency.' });
        }

        // Extract the prices from the records
        const prices = records.map(record => record.currentPrice);

        // Calculate the standard deviation
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance =
            prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const standardDeviation = Math.sqrt(variance);

        // Respond with the standard deviation
        res.json({ deviation: parseFloat(standardDeviation.toFixed(2)) });
    } catch (error) {
        console.error('Error fetching deviation:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
