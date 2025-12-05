const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2');
const {
  R2_BUCKET,
  R2_PUBLIC_BASE_URL,
  R2_PDF_BASE_FOLDER
} = require('../config/env');

async function uploadPdfToR2(buffer, fileName = 'documento') {
  if (!R2_BUCKET || !R2_PUBLIC_BASE_URL) {
    throw new Error('Config R2 faltando (R2_BUCKET ou R2_PUBLIC_BASE_URL)');
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const safeFileName = String(fileName).replace(/[^a-zA-Z0-9_.@-]/g, '_');
  const key = `${safeFileName}.pdf`;

  const putCommand = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf'
  });

  await r2Client.send(putCommand);

  const publicUrl = `${R2_PUBLIC_BASE_URL}/${key}`;

  return {
    uri: publicUrl,
    size: buffer.length
  };
}

module.exports = {
  uploadPdfToR2
};
