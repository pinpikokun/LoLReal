const OPGG_PATTERN = /^https:\/\/(www\.)?op\.gg\/summoners\/[a-z]+\/[^/]+/i;

export function validateOpggLink(url: string): boolean {
  if (!url) return true; // optional field
  return OPGG_PATTERN.test(url);
}

export function validateRiotId(riotId: string): boolean {
  // Riot ID format: GameName#TagLine
  const pattern = /^.{3,16}#[A-Za-z0-9]{3,5}$/;
  return pattern.test(riotId);
}

export function validateComment(comment: string): { valid: boolean; error?: string } {
  if (!comment || comment.trim().length === 0) {
    return { valid: false, error: 'commentRequired' };
  }
  if (comment.length > 500) {
    return { valid: false, error: 'commentTooLong' };
  }
  return { valid: true };
}

export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function parseRiotId(riotId: string): { gameName: string; tagLine: string } | null {
  const parts = riotId.split('#');
  if (parts.length !== 2) return null;
  return { gameName: parts[0], tagLine: parts[1] };
}

export function formatRiotId(gameName: string, tagLine: string): string {
  return `${gameName}#${tagLine}`;
}

const REGION_SET = new Set([
  'jp1', 'kr', 'na1', 'euw1', 'eune1', 'br1', 'la1', 'la2',
  'oc1', 'tr1', 'ru', 'ph2', 'sg2', 'th2', 'tw2', 'vn2',
]);

export function validateRegion(region: string): boolean {
  return REGION_SET.has(region);
}
