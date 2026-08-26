export const CANDIDATE_CATEGORY_VALUES = [
  "INTERNSHIP",
  "CAMPUS_RECRUITMENT",
  "REFERRAL",
  "HACKATHON",
  "TRAINING",
  "CAREER_EXPERIENCE",
  "RESUME_INTERVIEW",
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

export const CANDIDATE_CATEGORY_LABELS: Record<CandidateCategoryValue, string> = {
  INTERNSHIP: "实习",
  CAMPUS_RECRUITMENT: "校招",
  REFERRAL: "内推",
  HACKATHON: "黑客松",
  TRAINING: "训练营",
  CAREER_EXPERIENCE: "求职经验",
  RESUME_INTERVIEW: "简历与面试资料",
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
  "实习与校招" | "Hackathon" | "训练营" | "简历与面试"
> = {
  INTERNSHIP: "实习与校招",
  CAMPUS_RECRUITMENT: "实习与校招",
  REFERRAL: "实习与校招",
  HACKATHON: "Hackathon",
  TRAINING: "训练营",
  CAREER_EXPERIENCE: "简历与面试",
  RESUME_INTERVIEW: "简历与面试",
};
