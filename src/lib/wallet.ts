import crypto from 'crypto';
import { HDNodeWallet, Mnemonic } from 'ethers';

const ENCRYPTION_KEY = process.env.AES_ENCRYPTION_KEY || 'f4a9b2c8e3d7f1a5c6e8d2b9a1c3f5e7'; // Must be 32 bytes/characters
const MNEMONIC = process.env.HD_WALLET_MNEMONIC || '';

// AES-256-GCM Encryption
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  // Key must be exactly 32 bytes. If it's a hex string of 32 chars, we pad it or hash it.
  // Let's create a 32-byte buffer from the key.
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:encrypted:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

// AES-256-GCM Decryption
export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedHex, authTagHex] = encryptedText.split(':');
  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export interface DerivedWallet {
  address: string;
  privateKey: string;
}

/**
 * Derives a hierarchical deterministic (HD) wallet from the master mnemonic using BIP-44 path.
 * Path: m/44'/60'/0'/0/index
 */
export function deriveWalletAtIndex(index: number): DerivedWallet {
  if (!MNEMONIC) {
    throw new Error('HD_WALLET_MNEMONIC environment variable is not configured.');
  }
  
  const mnemonicInstance = Mnemonic.fromPhrase(MNEMONIC);
  const childNode = HDNodeWallet.fromMnemonic(mnemonicInstance, `m/44'/60'/0'/0/${index}`);
  
  return {
    address: childNode.address,
    privateKey: childNode.privateKey,
  };

}
