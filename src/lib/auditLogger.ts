import { PrismaClient, Prisma } from '@prisma/client';

// Re-use a single Prisma instance during dev to avoid exhausting database connections
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#re-using-a-single-prismaclient-instance
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Types for the helper input
export interface AuditLogInput {
  smartMenuId: bigint | number;
  actorId: bigint | number;
  action: string;
  diff: Record<string, unknown>;
}

/**
 * Persist an audit-log row capturing a SmartMenu change.
 *
 * Example usage:
 *   await recordAudit({
 *     smartMenuId: 42,
 *     actorId: 1,
 *     action: 'UPDATE',
 *     diff: { name: { old: 'Breakfast', new: 'Brunch' } }
 *   });
 */
export async function recordAudit({ smartMenuId, actorId, action, diff }: AuditLogInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      smartMenuId: BigInt(smartMenuId),
      actorId: BigInt(actorId),
      action,
      diff: diff as Prisma.JsonObject
    }
  });
}

// Convenience fetcher for UI/debugging ‑- not required but handy.
export async function fetchAuditLogs(smartMenuId: bigint | number) {
  return prisma.auditLog.findMany({
    where: { smartMenuId: BigInt(smartMenuId) },
    orderBy: { createdAt: 'desc' }
  });
}
