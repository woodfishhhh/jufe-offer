import { z } from "zod";
import { CATEGORY_VALUES } from "@/data/categories";

const httpUrl = z
  .string()
  .trim()
  .min(1, "请填写资源链接")
  .max(1000, "链接最多 1000 个字符")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "链接只能使用 HTTP 或 HTTPS");

const tagSchema = z
  .string()
  .trim()
  .min(1, "标签不能为空")
  .max(20, "单个标签最多 20 个字");

const optionalDateTime = z
  .string()
  .trim()
  .max(64, "时间格式过长")
  .datetime({ offset: true, message: "时间必须是带时区的 ISO 8601 格式" })
  .nullable();

const resourceObjectSchema = z.strictObject({
  title: z.string().trim().min(1, "标题不能为空").max(120, "标题最多 120 个字"),
  description: z.string().trim().min(1, "简介不能为空").max(1000, "简介最多 1000 个字"),
  url: httpUrl,
  category: z.enum(CATEGORY_VALUES),
  tags: z.array(tagSchema).max(8, "最多添加 8 个标签"),
  isFeatured: z.boolean(),
  startsAt: optionalDateTime,
  deadlineAt: optionalDateTime,
});

function checkTimeRange(
  value: { startsAt?: string | null; deadlineAt?: string | null },
  context: z.RefinementCtx,
) {
  if (
    value.startsAt &&
    value.deadlineAt &&
    new Date(value.deadlineAt).getTime() < new Date(value.startsAt).getTime()
  ) {
    context.addIssue({
      code: "custom",
      path: ["deadlineAt"],
      message: "截止时间不能早于开始时间",
    });
  }
}

export const resourceInputSchema = resourceObjectSchema.superRefine(checkTimeRange);

export const resourcePatchSchema = resourceObjectSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "没有需要更新的字段" })
  .superRefine(checkTimeRange);

export const resourceQuerySchema = z.strictObject({
  q: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORY_VALUES).optional(),
  featured: z.enum(["1", "true", "0", "false"]).optional(),
  sort: z.enum(["newest", "title"]).optional(),
});

export type ResourceInput = z.infer<typeof resourceInputSchema>;
