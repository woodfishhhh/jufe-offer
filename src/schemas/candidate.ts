import { z } from "zod";
import {
  CANDIDATE_CATEGORY_VALUES,
  CANDIDATE_INGEST_DISPOSITION_VALUES,
  CANDIDATE_SOURCE_TYPE_VALUES,
  CANDIDATE_STATUS_VALUES,
} from "@/data/candidates";

const httpsUrl = z
  .string()
  .trim()
  .min(1, "链接不能为空")
  .max(1000, "链接最多 1000 个字符")
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        Boolean(url.hostname) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "链接必须是 HTTPS URL，且不能包含用户名或密码");

const isoDateTime = z
  .string()
  .trim()
  .max(64, "时间格式过长")
  .datetime({ offset: true, message: "时间必须是带时区的 ISO 8601 格式" });

const candidateTag = z
  .string()
  .trim()
  .min(1, "标签不能为空")
  .max(20, "单个标签最多 20 个字");

const candidateIngestObjectSchema = z.strictObject({
  externalId: z
    .string()
    .trim()
    .min(1, "externalId 不能为空")
    .max(200, "externalId 最多 200 个字符"),
  dedupeKey: z.string().regex(/^[a-f0-9]{64}$/, "dedupeKey 必须是 64 位小写 SHA-256"),
  disposition: z.enum(CANDIDATE_INGEST_DISPOSITION_VALUES),
  category: z.enum(CANDIDATE_CATEGORY_VALUES),
  title: z.string().trim().min(1, "标题不能为空").max(120, "标题最多 120 个字"),
  summary: z.string().trim().min(1, "摘要不能为空").max(1000, "摘要最多 1000 个字"),
  sourceType: z.enum(CANDIDATE_SOURCE_TYPE_VALUES),
  sourceName: z
    .string()
    .trim()
    .min(1, "来源名称不能为空")
    .max(100, "来源名称最多 100 个字"),
  sourceUrl: httpsUrl,
  officialUrl: httpsUrl.nullable().optional(),
  deadline: isoDateTime.nullable().optional(),
  tags: z
    .array(candidateTag)
    .max(8, "最多添加 8 个标签")
    .transform((tags) => Array.from(new Set(tags))),
  rawExcerpt: z
    .string()
    .trim()
    .max(10000, "原始证据最多 10000 个字")
    .nullable()
    .optional(),
  discoveredAt: isoDateTime,
});

export const candidateIngestSchema = candidateIngestObjectSchema;

export const candidateAdminQuerySchema = z.strictObject({
  status: z.enum(CANDIDATE_STATUS_VALUES).default("PENDING"),
});

export const candidateIdSchema = z.string().cuid("候选 ID 格式不正确");

export const candidateApproveSchema = z.strictObject({});

export const candidateReviewSchema = z.strictObject({
  reviewNote: z.string().trim().max(300, "审核备注最多 300 个字").optional(),
});

export type CandidateIngestInput = z.infer<typeof candidateIngestSchema>;
