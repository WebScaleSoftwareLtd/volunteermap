import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { uploadUserAvatar } from '@/lib/services/s3';
import sharp from 'sharp';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const AVATAR_SIZE = 512;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const form = await request.formData();
    const file = form.get('avatar');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing avatar file' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Avatar must be a PNG, JPEG, or WebP image' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Avatar must be 5MB or smaller' },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let processedBytes: Uint8Array;
    try {
      // Center-crop to a square and normalize size for consistent avatars.
      const out = await sharp(Buffer.from(bytes))
        .rotate() // respect EXIF orientation
        .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'center' })
        .webp({ quality: 90 })
        .toBuffer();
      processedBytes = new Uint8Array(out);
    } catch {
      return NextResponse.json(
        { error: 'Could not process image. Please upload a valid PNG, JPEG, or WebP.' },
        { status: 400 }
      );
    }

    const { url } = await uploadUserAvatar({
      userId: user.id,
      bytes: processedBytes,
      contentType: 'image/webp',
    });

    await db
      .update(users)
      .set({ avatarUrl: url, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, avatarUrl: url });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();

    await db
      .update(users)
      .set({ avatarUrl: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Avatar delete error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

