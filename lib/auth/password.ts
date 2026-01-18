import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Constant-time comparison to prevent timing attacks
export async function safeVerifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) {
    // Perform a hash operation anyway to prevent timing attacks
    await bcrypt.hash(password, SALT_ROUNDS);
    return false;
  }
  return bcrypt.compare(password, hash);
}
