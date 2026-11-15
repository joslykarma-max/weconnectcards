// What a module's public page (/m/<username>/<type>) may send to the visitor's browser.
// Codes checked by the server (loyalty stamp code, access-zone PIN, medical PIN) never leave it.
import { publicMedicalConfig } from './medical';

export function publicModuleConfig(type: string, config: Record<string, unknown>): Record<string, unknown> {
  switch (type) {
    case 'medical':
      return publicMedicalConfig(config);
    case 'loyalty': {
      // The merchant says the code aloud after a purchase: it must not be readable in the page
      const { stampCode, ...rest } = config;
      return { ...rest, hasStampCode: typeof stampCode === 'string' && stampCode.trim().length > 0 };
    }
    case 'access': {
      const zones = Array.isArray(config.zones) ? config.zones : [];
      return {
        ...config,
        zones: zones.map((z) => {
          const { pinHash, ...zone } = (z ?? {}) as Record<string, unknown>;
          return { ...zone, hasPin: typeof pinHash === 'string' && pinHash.length > 0 };
        }),
      };
    }
    default:
      return config;
  }
}
