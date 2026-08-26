import type { Category } from "@/data/categories";

export const CANDIDATE_CATEGORY_VALUES = [
  "INTERNSHIP",
  "CAMPUS_RECRUITMENT",
  "REFERRAL",
  "COMPETITION",
  "HACKATHON",
  "OPEN_SOURCE_RESOURCE",
  "TRAINING",
  "PROGRAMMING_LEARNING",
  "LEARNING_PATH",
  "PROGRAMMING_TOOL",
  "CAREER_EXPERIENCE",
  "RESUME_INTERVIEW",
  "CAMPUS_RESOURCE",
  "OTHER_RESOURCE",
] as const;

export const CANDIDATE_SOURCE_TYPE_VALUES = [
  "RSSHUB",
  "OFFICIAL_API",
  "OFFICIAL_PAGE",
  "WEB_MONITOR",
  "MANUAL_RESEARCH",
] as const;

export const CANDIDATE_INGEST_DISPOSITION_VALUES = [
  "AUTO_PUBLISH",
  "REVIEW_REQUIRED",
] as const;

export const CANDIDATE_STATUS_VALUES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "DUPLICATE",
] as const;

export type CandidateCategoryValue = (typeof CANDIDATE_CATEGORY_VALUES)[number];
export type CandidateSourceTypeValue = (typeof CANDIDATE_SOURCE_TYPE_VALUES)[number];
export type CandidateIngestDispositionValue =
  (typeof CANDIDATE_INGEST_DISPOSITION_VALUES)[number];
export type CandidateStatusValue = (typeof CANDIDATE_STATUS_VALUES)[number];

export const CANDIDATE_MANUAL_ONLY_VALUES = ["REFERRAL", "OTHER_RESOURCE"] as const;

export const CANDIDATE_AUTO_PUBLISH_VALUES = [
  "INTERNSHIP",
  "CAMPUS_RECRUITMENT",
  "COMPETITION",
  "HACKATHON",
  "TRAINING",
  "CAMPUS_RESOURCE",
] as const satisfies readonly CandidateCategoryValue[];

export const CANDIDATE_CATEGORY_LABELS: Record<CandidateCategoryValue, string> = {
  INTERNSHIP: "实习",
  CAMPUS_RECRUITMENT: "校招",
  REFERRAL: "内推",
  COMPETITION: "竞赛",
  HACKATHON: "黑客松",
  OPEN_SOURCE_RESOURCE: "开源资源",
  TRAINING: "训练营",
  PROGRAMMING_LEARNING: "编程学习",
  LEARNING_PATH: "学习路线",
  PROGRAMMING_TOOL: "编程工具",
  CAREER_EXPERIENCE: "求职经验",
  RESUME_INTERVIEW: "简历与面试资料",
  CAMPUS_RESOURCE: "江财校内资源",
  OTHER_RESOURCE: "其他资源",
};

export const CANDIDATE_SOURCE_TYPE_LABELS: Record<CandidateSourceTypeValue, string> = {
  RSSHUB: "RSSHub",
  OFFICIAL_API: "官方 API",
  OFFICIAL_PAGE: "官方页面",
  WEB_MONITOR: "网页监测",
  MANUAL_RESEARCH: "人工检索",
};

export const CANDIDATE_RESOURCE_CATEGORY: Record<
  CandidateCategoryValue,
  Category
> = {
  INTERNSHIP: "实习与校招",
  CAMPUS_RECRUITMENT: "实习与校招",
  REFERRAL: "实习与校招",
  COMPETITION: "竞赛",
  HACKATHON: "Hackathon",
  OPEN_SOURCE_RESOURCE: "开源项目",
  TRAINING: "训练营",
  PROGRAMMING_LEARNING: "编程学习",
  LEARNING_PATH: "学习路线",
  PROGRAMMING_TOOL: "编程工具",
  CAREER_EXPERIENCE: "简历与面试",
  RESUME_INTERVIEW: "简历与面试",
  CAMPUS_RESOURCE: "江财校内资源",
  OTHER_RESOURCE: "其他资源",
};
