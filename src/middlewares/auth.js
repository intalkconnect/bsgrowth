// src/middlewares/auth.js
const { API_TOKEN } = require('../config/env');

module.exports = (req, res, next) => {
  // Se não tiver token configurado, não trava a API (mas avisa)
  if (!API_TOKEN) {
    console.warn('[AUTH] API_TOKEN não configurado; rota liberada sem autenticação');
    return next();
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader; // permite enviar só o token puro também

  if (!token || token !== API_TOKEN) {
    return res.status(401).json({
      error: 'Não autorizado. Envie o header Authorization: Bearer <TOKEN>.'
    });
  }

  return next();
};
