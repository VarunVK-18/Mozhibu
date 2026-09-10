const crypto = require('crypto');

// The encryption key MUST be exactly 32 bytes (256 bits) for AES-256
// We use a fallback key here for development ONLY if it's missing in .env
// In production, this should throw an error if ENCRYPTION_KEY is not defined.
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes_long!';
  // Hash it to ensure it's exactly 32 bytes long regardless of what's passed
  return crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
};

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts plain text into an IV + Encrypted Data + Auth Tag string
 */
exports.encrypt = (text) => {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

/**
 * Decrypts a previously encrypted string
 */
exports.decrypt = (hash) => {
  if (!hash) return hash;
  
  try {
    const parts = hash.split(':');
    if (parts.length !== 3) return null; // Invalid format
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null; // Don't throw, just return null if decryption fails (e.g. key changed)
  }
};

/**
 * Helper to mask sensitive data (e.g. account numbers)
 * "123456789" -> "xxxxx6789"
 */
exports.maskData = (str, visibleChars = 4) => {
  if (!str) return str;
  if (str.length <= visibleChars) return '****' + str;
  return '*'.repeat(Math.max(4, str.length - visibleChars)) + str.slice(-visibleChars);
};
