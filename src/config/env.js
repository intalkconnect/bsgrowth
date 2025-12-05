const requiredEnv = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_BASE_URL',
  'BLIP_API_KEY'
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[WARN] Variável de ambiente ${key} não está definida.`);
  }
});

module.exports = {
  PORT: process.env.PORT || 3000,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET: process.env.R2_BUCKET,
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
  R2_PDF_BASE_FOLDER: process.env.R2_PDF_BASE_FOLDER || 'pdfs',
  BLIP_API_KEY: process.env.BLIP_API_KEY
};
