import { z } from "zod";

export const loginSchema = z.strictObject({
  username: z.string().trim().min(1, "请输入用户名").max(64, "用户名过长"),
  password: z.string().min(1, "请输入密码").max(128, "密码过长"),
});
