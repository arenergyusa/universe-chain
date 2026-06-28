import { unstable_cache } from 'next/cache';
import { db } from './db';

/**
 * Cached function to get all system configs.
 * Statically cached by Next.js until 'system-configs' tag is revalidated.
 * Prevents hitting the Neon Database for configs on every API request.
 */
export const getSystemConfigs = unstable_cache(
  async () => {
    const configs = await db.systemConfig.findMany();
    
    // Reduce array to a key-value object for easy O(1) lookup
    return configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);
  },
  ['system-configs-cache'],
  { tags: ['system-configs'], revalidate: 3600 } // Revalidate every hour or via webhook
);

/**
 * Get a specific configuration value by key with a fallback default.
 */
export async function getConfig(key: string, defaultValue: string | number): Promise<string> {
  const configs = await getSystemConfigs();
  return configs[key] ?? String(defaultValue);
}
