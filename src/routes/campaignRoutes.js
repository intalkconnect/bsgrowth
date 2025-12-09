const express = require('express');
const router = express.Router();
const campaignQueue = require('../queue/campaignQueue');

/**
 * @swagger
 * /api/growth:
 *   post:
 *     summary: Processa campanha e envia PDF ao BLiP.
 *     tags:
 *       - Campaign
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telefone
 *               - base64
 *             properties:
 *               nomeProdutor:
 *                 type: string
 *                 description: Nome do produtor.
 *               ticket:
 *                 type: string
 *                 description: Número do ticket.
 *               nf:
 *                 type: string
 *                 description: Número da nota fiscal.
 *               placa:
 *                 type: string
 *                 description: Placa do veículo.
 *               telefone:
 *                 type: string
 *                 description: Número do WhatsApp do destinatário (com DDD).
 *                 example: "5511999999999"
 *               base64:
 *                 type: string
 *                 description: PDF em base64.
 *     responses:
 *       200:
 *         description: Campanha processada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 jobId:
 *                   type: string
 *                 pdfUrl:
 *                   type: string
 *                 pdfSize:
 *                   type: integer
 *       400:
 *         description: Erro de validação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campoObrigatorio:
 *                 summary: Campo obrigatório ausente
 *                 value:
 *                   error: "Campo 'telefone' é obrigatório."
 *       401:
 *         description: Não autorizado (problema com o header Authorization).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               semHeader:
 *                 summary: Sem header Authorization
 *                 value:
 *                   error: "Não autorizado. Envie o header Authorization: Bearer <TOKEN>."
 *               formatoInvalido:
 *                 summary: Authorization sem Bearer
 *                 value:
 *                   error: "Formato inválido de Authorization. Use: Bearer <TOKEN>."
 *               tokenInvalido:
 *                 summary: Token incorreto
 *                 value:
 *                   error: "Não autorizado. Token inválido."
 *       500:
 *         description: Erro interno ao processar a campanha.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               erroGenerico:
 *                 summary: Erro inesperado
 *                 value:
 *                   error: "Erro interno ao processar a campanha."
 */

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
