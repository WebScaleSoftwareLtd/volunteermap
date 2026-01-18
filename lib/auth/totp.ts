import * as OTPAuth from 'otpauth';

const ISSUER = 'VolunteerMap';
const PERIOD = 30;
const DIGITS = 6;
const ALGORITHM = 'SHA1';

export function generateTotpSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

export function createTotp(secret: string, username: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: username,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

export function verifyTotpCode(secret: string, code: string, username: string): boolean {
  const totp = createTotp(secret, username);
  // Allow 1 period (30s) of drift in either direction
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

export function getTotpUri(secret: string, username: string): string {
  const totp = createTotp(secret, username);
  return totp.toString();
}

export async function generateQrCodeDataUrl(secret: string, username: string): Promise<string> {
  const uri = getTotpUri(secret, username);
  const QRCode = await import('qrcode');
  return QRCode.toDataURL(uri);
}
