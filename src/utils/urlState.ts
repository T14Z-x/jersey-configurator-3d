import { ATHLETIC_SWATCHES, BUILTIN_LOGOS, DEFAULT_JERSEY_CONFIG, findColorSlug } from '../data/presets';
import { CutId, JerseyConfig, SportId } from '../types/jersey';

const VALID_SPORTS: SportId[] = ['baseball', 'basketball', 'soccer', 'rugby'];
const VALID_CUTS: CutId[] = ['men', 'women', 'youth'];

function toBase64Url(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

function fromBase64Url(b64: string): string | null {
  try {
    let padded = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4 !== 0) padded += '=';
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function buildDesignHash(config: JerseyConfig): string {
  const colorSlug = findColorSlug(config.colors.primary);
  // Strip large uploaded data-URI images from the hash to keep URLs shareable
  const compactLogos = config.logos
    .map((l) => {
      const builtin = BUILTIN_LOGOS.find((b) => b.src === l.src);
      if (builtin) {
        return { ...l, src: `builtin:${builtin.id}` };
      }
      if (l.src.length < 2000) return l;
      return null;
    })
    .filter(Boolean);

  const payload = { ...config, logos: compactLogos };
  const encoded = toBase64Url(JSON.stringify(payload));
  return `#/sport/${config.sport}/cut/${config.cut}/color/${colorSlug}/${encoded}`;
}

export function parseDesignHash(hash: string): JerseyConfig {
  if (!hash || !hash.startsWith('#/')) {
    return structuredClone(DEFAULT_JERSEY_CONFIG);
  }

  const parts = hash.slice(2).split('/').filter(Boolean);
  // Format: sport/<sport>/cut/<cut>/color/<color>/<encoded?>
  const base = structuredClone(DEFAULT_JERSEY_CONFIG);

  const sportIdx = parts.indexOf('sport');
  if (sportIdx !== -1 && parts[sportIdx + 1]) {
    const s = parts[sportIdx + 1] as SportId;
    if (VALID_SPORTS.includes(s)) base.sport = s;
  }

  const cutIdx = parts.indexOf('cut');
  if (cutIdx !== -1 && parts[cutIdx + 1]) {
    const c = parts[cutIdx + 1] as CutId;
    if (VALID_CUTS.includes(c)) base.cut = c;
  }

  const colorIdx = parts.indexOf('color');
  if (colorIdx !== -1 && parts[colorIdx + 1]) {
    const slug = parts[colorIdx + 1].toLowerCase();
    const swatch = ATHLETIC_SWATCHES.find((sw) => sw.slug === slug);
    if (swatch) {
      base.colors.primary = swatch.hex;
      base.colors.collar = swatch.hex;
    } else if (/^[0-9a-f]{6}$/i.test(slug)) {
      base.colors.primary = `#${slug}`;
      base.colors.collar = `#${slug}`;
    }

    // If there is an encoded payload right after color/<slug>/<payload>
    const payloadStr = parts[colorIdx + 2];
    if (payloadStr && payloadStr.length > 16) {
      const decoded = fromBase64Url(payloadStr);
      if (decoded) {
        try {
          const parsed = JSON.parse(decoded) as Partial<JerseyConfig>;
          const restoredLogos = (parsed.logos ?? base.logos).map((l) => {
            if (l.src.startsWith('builtin:')) {
              const id = l.src.replace('builtin:', '');
              const found = BUILTIN_LOGOS.find((b) => b.id === id);
              return { ...l, src: found ? found.src : BUILTIN_LOGOS[0].src };
            }
            return l;
          });
          return {
            ...base,
            ...parsed,
            colors: { ...base.colors, ...(parsed.colors ?? {}) },
            teamName: { ...base.teamName, ...(parsed.teamName ?? {}) },
            frontNumber: { ...base.frontNumber, ...(parsed.frontNumber ?? {}) },
            playerName: { ...base.playerName, ...(parsed.playerName ?? {}) },
            backNumber: { ...base.backNumber, ...(parsed.backNumber ?? {}) },
            logos: restoredLogos,
          };
        } catch {
          return base;
        }
      }
    }
  }

  return base;
}
