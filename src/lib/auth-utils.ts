/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'lifesaver-secure-auth-jwt-token-2026';

/**
 * Securely hashes a password using PBKDF2 with a unique random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored secure hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (err) {
    console.error('Password verification failed:', err);
    return false;
  }
}

/**
 * Generates a signed JWT-like session token
 */
export function generateToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  // Expires in 7 days
  const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7);
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies and decodes a signed session token
 */
export function verifyToken(token: string): any | null {
  try {
    if (!token) return null;
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decodedBody.exp < Math.floor(Date.now() / 1000)) {
      console.warn('Session token has expired.');
      return null;
    }
    
    return decodedBody;
  } catch (err) {
    console.error('Session token verification failed:', err);
    return null;
  }
}
