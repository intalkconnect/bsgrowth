const requiredEnv = [
  'AZURE_STORAGE_CONNECTION_STRING',
  'AZURE_STORAGE_CONTAINER',
  'BLIP_API_KEY',
  'API_TOKEN'
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[WARN] Variável de ambiente ${key} não está definida.`);
  }
});

module.exports = {
  PORT: process.env.PORT || 3000,
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER,
  BLIP_API_KEY: process.env.BLIP_API_KEY,
  API_TOKEN: process.env.API_TOKEN
};
