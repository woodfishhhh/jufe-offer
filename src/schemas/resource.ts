import { z } from "zod";
import { CATEGORY_VALUES } from "@/data/categories";

const httpUrl = z
  .string()
  .trim()
  .min(1, "请填写资源链接")
  .max(500, "链接最多 500 个字符")
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
  .max(16, "单个标签最多 16 个字");

export const resourceInputSchema = z.strictObject({
  title: z.string().trim().min(1, "标题不能为空").max(80, "标题最多 80 个字"),
  description: z.string().trim().min(1, "简介不能为空").max(280, "简介最多 280 个字"),
  url: httpUrl,
  category: z.enum(CATEGORY_VALUES),
  tags: z.array(tagSchema).max(8, "最多添加 8 个标签"),
  isFeatured: z.boolean(),
});

export const resourcePatchSchema = resourceInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "没有需要更新的字段" });

export const resourceQuerySchema = z.strictObject({
  q: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORY_VALUES).optional(),
  featured: z.enum(["1", "true", "0", "false"]).optional(),
  sort: z.enum(["newest", "title"]).optional(),
});

export type ResourceInput = z.infer<typeof resourceInputSchema>;
