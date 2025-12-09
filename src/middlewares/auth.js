// src/middlewares/auth.js
const { API_TOKEN } = require('../config/env');

if (!API_TOKEN) {
  console.error('[AUTH] API_TOKEN não definido nas variáveis de ambiente');
  throw new Error('API_TOKEN não definido. Configure a variável de ambiente API_TOKEN.');
}

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // 1) Header obrigatório
  if (!authHeader) {
    return res.status(401).json({
      error: 'Não autorizado. Envie o header Authorization: Bearer <TOKEN>.'
    });
  }

  // 2) Tem que estar no formato "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({
      error: 'Formato inválido de Authorization. Use: Bearer <TOKEN>.'
    });
  }

  const [scheme, token] = parts;

  // 3) Scheme obrigatoriamente "Bearer" (case-insensitive)
  if (scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({
      error: 'Formato inválido de Authorization. Use: Bearer <TOKEN>.'
    });
  }

  // 4) Token obrigatório e igual ao configurado
  if (!token || token !== API_TOKEN) {
    return res.status(401).json({
      error: 'Não autorizado. Token inválido.'
    });
  }

  return next();
};
