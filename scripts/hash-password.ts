import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error("用法: pnpm hash-password -- <密码>");
    console.error("示例: pnpm hash-password -- jufe-offer-dev");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const hex = Buffer.from(hash, "utf8").toString("hex");

  console.log("bcrypt 哈希：");
  console.log(hash);
  console.log("");
  console.log("写入 .env 时请使用下面任意一种，避免 $ 被 Next.js 展开：");
  console.log(`ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "$$")}`);
  console.log(`ADMIN_PASSWORD_HASH=${hex}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
