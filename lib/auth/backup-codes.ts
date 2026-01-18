import { db, userBackupCodes } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// Word lists for generating human-readable backup codes
const ADJECTIVES = [
  'happy', 'brave', 'swift', 'calm', 'bold', 'keen', 'wise', 'fair',
  'warm', 'cool', 'soft', 'hard', 'tall', 'deep', 'wild', 'free',
  'true', 'pure', 'kind', 'rich', 'fast', 'slow', 'dark', 'light',
  'old', 'new', 'big', 'small', 'high', 'low', 'long', 'short',
  'red', 'blue', 'green', 'gold', 'silver', 'coral', 'amber', 'jade',
  'spicy', 'sunny', 'lucky', 'fuzzy', 'shiny', 'quiet', 'loud', 'gentle',
];

const NOUNS = [
  'tiger', 'eagle', 'wolf', 'bear', 'hawk', 'lion', 'deer', 'fox',
  'whale', 'shark', 'crow', 'swan', 'dove', 'owl', 'robin', 'finch',
  'oak', 'pine', 'maple', 'birch', 'cedar', 'palm', 'willow', 'elm',
  'moon', 'star', 'sun', 'cloud', 'wind', 'rain', 'snow', 'storm',
  'river', 'lake', 'ocean', 'mountain', 'valley', 'forest', 'desert', 'meadow',
  'proton', 'atom', 'quark', 'photon', 'electron', 'neutron', 'plasma', 'nova',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateBackupCode(): string {
  // Format: "adjective noun adjective noun adjective noun"
  return [
    getRandomElement(ADJECTIVES),
    getRandomElement(NOUNS),
    getRandomElement(ADJECTIVES),
    getRandomElement(NOUNS),
    getRandomElement(ADJECTIVES),
    getRandomElement(NOUNS),
  ].join(' ');
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateBackupCode());
  }
  return codes;
}

export async function saveBackupCodes(userId: number, codes: string[]): Promise<void> {
  // Delete existing codes
  await db.delete(userBackupCodes).where(eq(userBackupCodes.userId, userId));

  // Insert new codes
  if (codes.length > 0) {
    await db.insert(userBackupCodes).values(
      codes.map((code) => ({
        userId,
        backupCode: code,
      }))
    );
  }
}

export async function verifyAndConsumeBackupCode(
  userId: number,
  code: string
): Promise<boolean> {
  const normalizedCode = code.toLowerCase().trim();

  const result = await db
    .select({ id: userBackupCodes.id })
    .from(userBackupCodes)
    .where(
      and(
        eq(userBackupCodes.userId, userId),
        eq(userBackupCodes.backupCode, normalizedCode)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return false;
  }

  // Consume the code by deleting it
  await db.delete(userBackupCodes).where(eq(userBackupCodes.id, result[0].id));

  return true;
}

export async function getBackupCodeCount(userId: number): Promise<number> {
  const result = await db
    .select({ id: userBackupCodes.id })
    .from(userBackupCodes)
    .where(eq(userBackupCodes.userId, userId));

  return result.length;
}
