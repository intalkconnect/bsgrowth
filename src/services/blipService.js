const axios = require('axios');
const { BLIP_API_KEY } = require('../config/env');

if (!BLIP_API_KEY) {
  console.warn('[WARN] BLIP_API_KEY não definido');
}

async function sendCommandToBlip(commandPayload) {
  if (!BLIP_API_KEY) {
    throw new Error('BLIP_API_KEY não configurado');
  }

  const url = 'https://boasafrasementes.http.msging.net/commands';

  const response = await axios.post(url, commandPayload, {
    headers: {
      Authorization: `${BLIP_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  return response.data;
}

module.exports = {
  sendCommandToBlip
};
