const SimpleQueue = require('./Queue');
const { processCampaignJob } = require('../services/campaignProcessor');

const campaignQueue = new SimpleQueue(processCampaignJob);

// Logs básicos da fila
campaignQueue.on('completed', (job, result) => {
  console.log(
    '[QUEUE] Job de campanha concluído:',
    job?.id || '(sem id)',
    'PDF:',
    result?.pdfUrl
  );
});

campaignQueue.on('failed', (job, err) => {
  console.error(
    '[QUEUE] Job de campanha falhou:',
    job?.id || '(sem id)',
    err.message || err
  );
});

module.exports = campaignQueue;
