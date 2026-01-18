import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { generateTotpSecret, verifyTotpCode, generateQrCodeDataUrl } from '@/lib/auth/totp';
import { generateBackupCodes, saveBackupCodes } from '@/lib/auth/backup-codes';

// GET - Generate new TOTP secret and QR code
export async function GET() {
  try {
    const user = await requireAuth();

    // Check if 2FA is already enabled
    const [currentUser] = await db
      .select({ twoFaToken: users.twoFaToken })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (currentUser.twoFaToken) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Generate new secret
    const secret = generateTotpSecret();
    const qrCode = await generateQrCodeDataUrl(secret, user.username);

    return NextResponse.json({
      secret,
      qrCode,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('2FA setup GET error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST - Verify code and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { secret, code } = body;

    if (!secret || !code) {
      return NextResponse.json(
        { error: 'Secret and code are required' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = verifyTotpCode(secret, code.replace(/\s/g, ''), user.username);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid code. Please try again.' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Save 2FA secret and backup codes
    await db
      .update(users)
      .set({ twoFaToken: secret, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await saveBackupCodes(user.id, backupCodes);

    return NextResponse.json({
      success: true,
      backupCodes,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('2FA setup POST error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { code } = body;

    // Get current user with 2FA token
    const [currentUser] = await db
      .select({ twoFaToken: users.twoFaToken })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!currentUser.twoFaToken) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = verifyTotpCode(currentUser.twoFaToken, code.replace(/\s/g, ''), user.username);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid code. Please try again.' },
        { status: 400 }
      );
    }

    // Disable 2FA
    await db
      .update(users)
      .set({ twoFaToken: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Delete backup codes
    await saveBackupCodes(user.id, []);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
