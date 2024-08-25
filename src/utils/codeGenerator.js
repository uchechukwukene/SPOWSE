import crypto from 'crypto';

export const codeGenerator = async (length, alpha) => {
  const numeric = '1234567890';
  let result = '';

  if (alpha) {
    for (let i = 0; i < length; i++) {
      result += alpha.charAt(Math.floor(Math.random() * alpha.length));
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += numeric.charAt(Math.floor(Math.random(new Date().getTime()) * numeric.length));
    }
  }

  return result;
};

export const generateEnterpriseCredentials = async (organization) => {
  let str = organization.toUpperCase().split(' ').join('');

  const match = /[!@#\$%\^\&*\)\(+=._-]+/g.exec(str);

  if (match && match.index >= 0 && match.index < 4) {
    const index = match.index;
    function spliceSlice(str, index, count, add = '') {
      // We cannot pass negative indexes directly to the 2nd slicing operation.
      if (index < 0) {
        index = str.length + index;
        if (index < 0) {
          index = 0;
        }
      }

      return str.slice(0, index) + add + str.slice(index + count);
    }
    str = spliceSlice(str, index, 1);
  }
  let username = str.substr(0, 4);

  const password = await codeGenerator(
    8,
    'ABCDEFGHJKLMNPQRSTUWXYZ23456789abcdefghjklmnpqrstuvwxyz*%&#'
  );
  const shortCode = await codeGenerator(7, 'ABCDEFGGHIJKLM12345678910');
  username = username.toUpperCase();
  const company_code = `${username}-M${shortCode}`;

  return { company_code, password };
};

export const buildOtpHash = (email, otp, key, expiresAfter, algorithm = 'sha256') => {
  const ttl = expiresAfter * 60 * 1000; // Expires in minutes, converted to miliseconds
  const expires = Date.now() + ttl; // timestamp to 5 minutes in the future
  const data = `${email}.${otp}.${expires}`; // email.otp.expiry_timestamp
  const hashBase = crypto.createHmac(algorithm, key).update(data).digest('hex'); // creating SHA256 hash of the data
  const hash = `${hashBase}.${expires}`; // Hash.expires, format to send to the user
  return hash;
};

export const verifyOTP = (email, otp, hash, key, algorithm = 'sha256') => {
  if (!hash.match('.')) return false; // Hash should have at least one dot
  // Seperate Hash value and expires from the hash returned from the user(
  const [hashValue, expires] = hash.split('.');
  // Check if expiry time has passed
  const now = Date.now();
  if (now > expires) return false;
  // Calculate new hash with the same key and the same algorithm
  const data = `${email}.${otp}.${expires}`;
  const newCalculatedHash = crypto.createHmac(algorithm, key).update(data).digest('hex');
  // Match the hashes
  if (newCalculatedHash === hashValue) {
    return hash;
  }
  return false;
};
