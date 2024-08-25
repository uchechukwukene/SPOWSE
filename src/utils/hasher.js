import crypto from 'crypto';
import cryptojs from 'crypto-js';

export const sha1haserAlgorithm = async ({ string2hash }) => {
  const hash = crypto.createHash('sha1');

  hash.update(string2hash);

  const output = hash.digest('hex');

  return output;
};

export const jsonAESEncrypter = async (jsonObj, key) => {
  // The data to be encrypted
  const data = JSON.stringify(jsonObj);
  const bufferData = Buffer.from(data, 'utf8');

  // Convert the key to a buffer
  const keyBuffer = Buffer.from(key, 'utf8');

  // Generate a random initialization vector (IV)
  const iv = Buffer.from(key, 'utf8');

  // Initialize the cipher with the key and IV
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, iv);

  // Encrypt the data
  let encryptedData = cipher.update(bufferData, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');

  return encryptedData;
};
