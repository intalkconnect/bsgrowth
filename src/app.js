const express = require('express');
const campaignRoutes = require('./routes/campaignRoutes');

const app = express();

app.use(express.json({ limit: '20mb' })); // base64 pode ser grande

// Rotas
app.use('/api', campaignRoutes);

// Healthcheck básico
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
