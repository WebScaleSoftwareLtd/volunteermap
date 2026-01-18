import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

const VALIDATION_PREFIX = 'volunteermap_user_validation=';

export async function verifyDomainOwnership(
  domain: string,
  userValidationId: string
): Promise<boolean> {
  const expectedRecord = `${VALIDATION_PREFIX}${userValidationId}`;

  try {
    // Try to resolve TXT records for the domain
    const records = await resolveTxt(domain);

    // records is an array of arrays (each TXT record can have multiple strings)
    for (const record of records) {
      const fullRecord = record.join('');
      if (fullRecord === expectedRecord) {
        return true;
      }
    }

    // Also try with _volunteermap subdomain
    try {
      const subdomainRecords = await resolveTxt(`_volunteermap.${domain}`);
      for (const record of subdomainRecords) {
        const fullRecord = record.join('');
        if (fullRecord === expectedRecord) {
          return true;
        }
      }
    } catch {
      // Subdomain doesn't exist, that's okay
    }

    return false;
  } catch (error) {
    // DNS resolution failed
    console.error(`DNS resolution failed for ${domain}:`, error);
    return false;
  }
}

export function getValidationRecord(userValidationId: string): string {
  return `${VALIDATION_PREFIX}${userValidationId}`;
}
