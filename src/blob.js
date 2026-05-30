const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const connectionString = process.env.STORAGE_CONNECTION_STRING;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

const containerName = "covers";

let containerClient;

// initialize container
async function initContainer() {
  if (!containerClient) {
    containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({
      access: "blob"
    });
  }
}

// UPLOAD FUNCTION (THIS MUST MATCH YOUR IMPORT)
async function uploadImage(fileBuffer, fileName, mimeType) {
  await initContainer();

  const blockBlobClient =
    containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType
    }
  });

  return blockBlobClient.url;
}

// IMPORTANT EXPORT (THIS FIXES YOUR ERROR)
module.exports = { uploadImage };