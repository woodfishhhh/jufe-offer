import "server-only";

import {
  CandidateStatus,
  Prisma,
  ResourceOrigin,
  type Candidate,
  type Resource,
} from "@prisma/client";
import {
  CANDIDATE_RESOURCE_CATEGORY,
  type CandidateCategoryValue,
} from "@/data/candidates";
import { prisma } from "@/lib/prisma";
import { parseTags, stringifyTags } from "@/lib/tags";
import type { CandidateIngestInput } from "@/schemas/candidate";
import type { CandidateDto } from "@/types/candidate";

export class CandidateNotFoundError extends Error {}
export class CandidateStateConflictError extends Error {}
export class CandidateResourceConflictError extends Error {
  constructor(public readonly resourceId: string) {
    super("A resource with the same URL already exists");
  }
}

export type CandidateIngestAction = "duplicate" | "published";

export type CandidateIngestResult = {
  candidateId: string;
  action: CandidateIngestAction;
  created: boolean;
};

type TransactionClient = Prisma.TransactionClient;

function candidateData(input: CandidateIngestInput) {
  return {
    externalId: input.externalId,
    dedupeKey: input.dedupeKey,
    category: input.category,
    title: input.title,
    summary: input.summary,
    sourceType: input.sourceType,
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    officialUrl: input.officialUrl ?? null,
    deadline: input.deadline ? new Date(input.deadline) : null,
    tags: stringifyTags(input.tags),
    rawExcerpt: input.rawExcerpt || null,
    discoveredAt: new Date(input.discoveredAt),
    // Review has been retired. Keep accepting the legacy field at the API
    // boundary, but persist the policy that was actually applied.
    ingestDisposition: "AUTO_PUBLISH" as const,
  };
}

function sameDate(left: Date | null, right: Date | null) {
  return left?.getTime() === right?.getTime();
}

function isExactIngestReplay(candidate: Candidate, input: CandidateIngestInput) {
  const data = candidateData(input);

  return (
    candidate.externalId === data.externalId &&
    candidate.dedupeKey === data.dedupeKey &&
    candidate.category === data.category &&
    candidate.title === data.title &&
    candidate.summary === data.summary &&
    candidate.sourceType === data.sourceType &&
    candidate.sourceName === data.sourceName &&
    candidate.sourceUrl === data.sourceUrl &&
    candidate.officialUrl === data.officialUrl &&
    sameDate(candidate.deadline, data.deadline) &&
    candidate.tags === data.tags &&
    candidate.rawExcerpt === data.rawExcerpt &&
    candidate.discoveredAt.getTime() === data.discoveredAt.getTime() &&
    candidate.ingestDisposition === data.ingestDisposition
  );
}

function resourceUrlVariants(value: string) {
  const url = new URL(value);
  url.hash = "";
  const canonical = url.toString();
  const variants = new Set([value, canonical]);

  if (!url.search) {
    const withoutTrailingSlash = canonical.endsWith("/")
      ? canonical.slice(0, -1)
      : canonical;
    variants.add(withoutTrailingSlash);
    variants.add(`${withoutTrailingSlash}/`);
  }

  return Array.from(variants);
}

async function findResourceByUrl(tx: TransactionClient, url: string) {
  return tx.resource.findFirst({
    where: { url: { in: resourceUrlVariants(url) } },
    orderBy: { createdAt: "asc" },
  });
}

function resourceData(candidate: Candidate) {
  return {
    title: candidate.title,
    description: candidate.summary,
    url: candidate.officialUrl ?? candidate.sourceUrl,
    category: CANDIDATE_RESOURCE_CATEGORY[candidate.category as CandidateCategoryValue],
    tags: candidate.tags,
    isFeatured: false,
    origin: ResourceOrigin.OPENCLAW,
    startsAt: null,
    deadlineAt: candidate.deadline,
  };
}

async function publishCandidate(
  tx: TransactionClient,
  candidate: Candidate,
  duplicatePolicy: "mark" | "reject",
) {
  const data = resourceData(candidate);
  const existingResource = await findResourceByUrl(tx, data.url);

  if (existingResource) {
    if (duplicatePolicy === "reject") {
      throw new CandidateResourceConflictError(existingResource.id);
    }

    const marked = await tx.candidate.updateMany({
      where: { id: candidate.id, status: CandidateStatus.PENDING },
      data: {
        status: CandidateStatus.DUPLICATE,
        reviewNote: "正式资源中已存在相同 URL（自动判重）。",
        reviewedAt: new Date(),
        resourceId: existingResource.id,
      },
    });
    if (marked.count !== 1) {
      throw new CandidateStateConflictError();
    }

    return { action: "duplicate" as const, resource: existingResource };
  }

  const resource = await tx.resource.create({ data });
  const approved = await tx.candidate.updateMany({
    where: { id: candidate.id, status: CandidateStatus.PENDING },
    data: {
      status: CandidateStatus.APPROVED,
      reviewNote: "OpenClaw 自动采集并直接发布。",
      reviewedAt: new Date(),
      resourceId: resource.id,
    },
  });
  if (approved.count !== 1) {
    throw new CandidateStateConflictError();
  }

  return { action: "published" as const, resource };
}

async function ingestCandidateOnce(
  input: CandidateIngestInput,
): Promise<CandidateIngestResult> {
  return prisma.$transaction(async (tx) => {
    const byExternalId = await tx.candidate.findUnique({
      where: { externalId: input.externalId },
    });
    const byDedupeKey = await tx.candidate.findUnique({
      where: { dedupeKey: input.dedupeKey },
    });

    if (byExternalId && byExternalId.status !== CandidateStatus.PENDING) {
      if (isExactIngestReplay(byExternalId, input)) {
        if (
          byExternalId.status === CandidateStatus.APPROVED &&
          byExternalId.ingestDisposition === "AUTO_PUBLISH"
        ) {
          return {
            candidateId: byExternalId.id,
            action: "published",
            created: false,
          };
        }

        if (byExternalId.status === CandidateStatus.DUPLICATE) {
          return {
            candidateId: byExternalId.id,
            action: "duplicate",
            created: false,
          };
        }
      }

      throw new CandidateStateConflictError();
    }

    if (byDedupeKey && byDedupeKey.externalId !== input.externalId) {
      return {
        candidateId: byDedupeKey.id,
        action: "duplicate",
        created: false,
      };
    }

    const candidate = byExternalId
      ? await tx.candidate.update({
          where: { id: byExternalId.id },
          data: candidateData(input),
        })
      : await tx.candidate.create({
          data: {
            ...candidateData(input),
            status: CandidateStatus.PENDING,
          },
        });

    const published = await publishCandidate(tx, candidate, "mark");
    return {
      candidateId: candidate.id,
      action: published.action,
      created: !byExternalId,
    };
  });
}

export async function ingestCandidate(input: CandidateIngestInput) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await ingestCandidateOnce(input);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt === 0
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new CandidateStateConflictError();
}

export async function approveCandidate(candidateId: string) {
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) {
      throw new CandidateNotFoundError();
    }
    if (candidate.status !== CandidateStatus.PENDING) {
      throw new CandidateStateConflictError();
    }

    const result = await publishCandidate(tx, candidate, "reject");
    const updated = await tx.candidate.findUniqueOrThrow({
      where: { id: candidate.id },
    });
    return { candidate: updated, resource: result.resource };
  });
}

export async function closeCandidate(
  candidateId: string,
  status: "REJECTED" | "DUPLICATE",
  reviewNote?: string,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.candidate.findUnique({ where: { id: candidateId } });
    if (!existing) {
      throw new CandidateNotFoundError();
    }
    if (existing.status !== CandidateStatus.PENDING) {
      throw new CandidateStateConflictError();
    }

    const updated = await tx.candidate.updateMany({
      where: { id: candidateId, status: CandidateStatus.PENDING },
      data: {
        status,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
      },
    });
    if (updated.count !== 1) {
      throw new CandidateStateConflictError();
    }

    return tx.candidate.findUniqueOrThrow({ where: { id: candidateId } });
  });
}

export function toCandidateDto(candidate: Candidate): CandidateDto {
  return {
    id: candidate.id,
    externalId: candidate.externalId,
    category: candidate.category,
    title: candidate.title,
    summary: candidate.summary,
    sourceType: candidate.sourceType,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    officialUrl: candidate.officialUrl,
    deadline: candidate.deadline?.toISOString() ?? null,
    tags: parseTags(candidate.tags),
    rawExcerpt: candidate.rawExcerpt,
    discoveredAt: candidate.discoveredAt.toISOString(),
    ingestDisposition: candidate.ingestDisposition,
    status: candidate.status,
    reviewNote: candidate.reviewNote,
    reviewedAt: candidate.reviewedAt?.toISOString() ?? null,
    resourceId: candidate.resourceId,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  };
}

export function toPublishedResourceDto(resource: Resource) {
  return {
    id: resource.id,
    title: resource.title,
    url: resource.url,
  };
}
