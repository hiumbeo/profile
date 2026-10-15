/**
 * Convert Discord Snowflake ID to exact creation Date
 * Formula: (snowflake >> 22) + 1420070400000 (Discord Epoch: Jan 1, 2015)
 */
export function getDiscordCreationDate(snowflakeId: string): Date | null {
  try {
    const cleanId = snowflakeId.trim();
    if (!/^\d{17,20}$/.test(cleanId)) return null;
    const idBigInt = BigInt(cleanId);
    const timestampMs = Number((idBigInt >> 22n) + 1420070400000n);
    return new Date(timestampMs);
  } catch {
    return null;
  }
}

export function formatDiscordDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
