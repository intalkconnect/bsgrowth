const { BlobServiceClient } = require('@azure/storage-blob');
const {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER
} = require('../config/env');

if (!AZURE_STORAGE_CONNECTION_STRING) {
  console.warn('[WARN] AZURE_STORAGE_CONNECTION_STRING não definido');
}
if (!AZURE_STORAGE_CONTAINER) {
  console.warn('[WARN] AZURE_STORAGE_CONTAINER não definido');
}

let blobServiceClient;
if (AZURE_STORAGE_CONNECTION_STRING) {
  blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
}

/**
 * Faz upload de um PDF em buffer para o Azure Blob Storage.
 * Retorna { uri, size }.
 *
 * Observação: Para que a URL seja acessível diretamente,
 * o container deve permitir leitura (nível Blob ou Container),
 * ou você deve gerar SAS se usar container privado.
 */
async function uploadPdfToAzure(buffer, fileName = 'documento.pdf') {
  if (!blobServiceClient) {
    throw new Error('BlobServiceClient não configurado (connection string ausente)');
  }

  const containerClient = blobServiceClient.getContainerClient(
    AZURE_STORAGE_CONTAINER
  );

  // Garante que o container exista (idempotente)
  await containerClient.createIfNotExists();

  const blobName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: 'application/pdf'
    }
  });

  return {
    uri: blockBlobClient.url,
    size: buffer.length
  };
}

module.exports = {
  uploadPdfToAzure
};
