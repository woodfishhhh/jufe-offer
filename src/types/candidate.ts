import type {
  CandidateCategoryValue,
  CandidateIngestDispositionValue,
  CandidateSourceTypeValue,
  CandidateStatusValue,
} from "@/data/candidates";

export type CandidateDto = {
  id: string;
  externalId: string;
  category: CandidateCategoryValue;
  title: string;
  summary: string;
  sourceType: CandidateSourceTypeValue;
  sourceName: string;
  sourceUrl: string;
  officialUrl: string | null;
  deadline: string | null;
  tags: string[];
  rawExcerpt: string | null;
  discoveredAt: string;
  ingestDisposition: CandidateIngestDispositionValue;
  status: CandidateStatusValue;
  reviewNote: string | null;
  reviewedAt: string | null;
  resourceId: string | null;
  createdAt: string;
  updatedAt: string;
};
