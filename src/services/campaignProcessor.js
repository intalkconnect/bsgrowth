const { uploadPdfToAzure } = require('./azureStorage');
const { sendCommandToBlip } = require('./blipService');
const { v4: uuidv4 } = require('uuid');

// Gera um id UUID v4
function generateId() {
  return uuidv4();
}

// Formata data em ddmmaahhmmss
function formatDateDdMMAAhhmmss(dateInput) {
  let d;
  if (dateInput) {
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }
  if (!d) {
    d = new Date();
  }

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const aa = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `${dd}${mm}${aa}${hh}${min}${ss}`;
}

async function processCampaignJob(job) {
  const payload = job.payload || {};

  const {
    nomeProdutor,
    ticket,
    nf,
    placa,
    telefone,
    base64
  } = payload;

  if (!base64) {
    throw new Error('Campo "base64" (PDF em base64) é obrigatório no corpo.');
  }

  if (!telefone) {
    throw new Error('Campo "telefone" é obrigatório (recipient do WhatsApp).');
  }

  // 1) base64 -> Buffer (PDF)
  let pdfBuffer;
  try {
    pdfBuffer = Buffer.from(base64, 'base64');
  } catch (e) {
    throw new Error(
      'Valor de "base64" inválido (não foi possível decodificar).'
    );
  }

  // 2) Nome "amigável" do arquivo: Ticket_$ticket_hhmmss
  const safeTicket = ticket || 'romaneio';

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const timePart = `${hh}${min}${ss}`;

  const fileName = `Ticket_${safeTicket}_${timePart}.pdf`;

  // 3) Upload no Azure
  const { uri: pdfUrl, size } = await uploadPdfToAzure(pdfBuffer, fileName);

  // 4) Montar payload para o BLiP

  const id = job.id || generateId();

  // usa data/hora atual para o sufixo do nome da campanha
  const dateSuffix = formatDateDdMMAAhhmmss();
  const campaignName = `Romaneio - ${safeTicket} | ${dateSuffix}`;

  // data/hora atual para ativo_enviado_em
  const nowIso = now.toISOString();

  const commandPayload = {
    id,
    to: 'postmaster@activecampaign.msging.net',
    method: 'set',
    uri: '/campaign/full',
    type: 'application/vnd.iris.activecampaign.full-campaign+json',
    resource: {
      campaign: {
        name: campaignName,
        campaignType: 'Individual',
        flowId: '06506f42-d196-42af-8d28-a9edcfb4f53d',
        stateId: '1615d083-1ee2-46b6-9f7d-2e7f40150541',
        masterstate: 'principal493@msging.net',
        channelType: 'WhatsApp'
      },
      audience: {
        recipient: telefone,
        messageParams: {
          '1': pdfUrl,        // URL do PDF
          '2': nomeProdutor,
          '3': ticket,
          '4': nf,
          '5': placa,
          ativo_enviado_em: nowIso
        }
      },
      message: {
        messageTemplate: 'romaneio_file',
        messageParams: ['1', '2', '3', '4', '5'],
        channelType: 'WhatsApp'
      }
    }
  };

  const blipResult = await sendCommandToBlip(commandPayload);

  return {
    pdfUrl,
    pdfSize: size,
    blipResult,
    blipCommand: commandPayload
  };
}

module.exports = {
  processCampaignJob
};
