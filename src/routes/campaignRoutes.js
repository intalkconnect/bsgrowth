const express = require('express');
const router = express.Router();
const campaignQueue = require('../queue/campaignQueue');

router.post('/growth', async (req, res) => {
  const {
    nomeProdutor,
    ticket,
    nf,
    placa,
    telefone,
    base64
  } = req.body || {};

  if (!base64) {
    return res.status(400).json({
      error: 'Campo "base64" é obrigatório (PDF em base64).'
    });
  }

  if (!telefone) {
    return res.status(400).json({
      error: 'Campo "telefone" é obrigatório (recipient do WhatsApp).'
    });
  }

  const jobId = `job-${Date.now()}`;

  try {
    const result = await campaignQueue.add({
      id: jobId,
      payload: {
        nomeProdutor,
        ticket,
        nf,
        placa,
        telefone,
        dataHoraEnvio,
        base64
      }
    });

    return res.json({
      message: 'Campanha processada e enviada ao BLiP com PDF',
      jobId,
      pdfUrl: result.pdfUrl,
      pdfSize: result.pdfSize,
      blipResult: result.blipResult
    });
  } catch (err) {
    console.error('Erro ao processar campanha:', err?.message || err);

    return res.status(500).json({
      error: 'Falha ao processar campanha com PDF',
      details: err?.message || String(err)
    });
  }
});

module.exports = router;
