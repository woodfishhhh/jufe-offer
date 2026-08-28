export const VISITOR_COUNT_KEY = "visitor-count";
export const VISITOR_COUNT_BASELINE = 675;

export type VisitorCounterBackend = {
  find: () => Promise<number | null>;
  increment: () => Promise<number>;
};

function normalizeCount(value: number | null) {
  if (value === null || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

const prismaBackend: VisitorCounterBackend = {
  async find() {
    const { prisma } = await import("@/lib/prisma");
    const metric = await prisma.siteMetric.findUnique({
      where: { key: VISITOR_COUNT_KEY },
      select: { value: true },
    });

    return metric?.value ?? VISITOR_COUNT_BASELINE;
  },
  async increment() {
    const { prisma } = await import("@/lib/prisma");
    const metric = await prisma.siteMetric.upsert({
      where: { key: VISITOR_COUNT_KEY },
      create: { key: VISITOR_COUNT_KEY, value: VISITOR_COUNT_BASELINE + 1 },
      update: { value: { increment: 1 } },
      select: { value: true },
    });

    return metric.value;
  },
};

export function createVisitorCounter(backend: VisitorCounterBackend = prismaBackend) {
  return {
    async read() {
      return normalizeCount(await backend.find());
    },
    async visit() {
      return normalizeCount(await backend.increment());
    },
  };
}

export function isAutomatedVisitor(userAgent: string | null) {
  if (!userAgent) return true;

  return /bot\b|crawler|spider|preview|facebookexternalhit|slackbot|discordbot|whatsapp|curl\b|wget\b|headlesschrome|lighthouse/i.test(
    userAgent,
  );
}

const visitorCounter = createVisitorCounter();

export function readVisitorCount() {
  return visitorCounter.read();
}

export function countVisitor() {
  return visitorCounter.visit();
}
