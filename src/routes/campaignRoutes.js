const express = require('express');
const router = express.Router();
const campaignQueue = require('../queue/campaignQueue');

// POST /api/campaign-pdf
// Body esperado:
// {
//   "nomeProdutor": "",
//   "ticket": "",
//   "nf": "",
//   "placa": "",
//   "telefone": "",
//   "dataHoraEnvio": "",
//   "base64": ""
// }
router.post('/growth', async (req, res) => {
  const {
    nomeProdutor,
    ticket,
    nf,
    placa,
    telefone,
    dataHoraEnvio,
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
      // Se quiser debugar o payload enviado para o BLiP, pode incluir:
      // blipCommand: result.blipCommand
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
