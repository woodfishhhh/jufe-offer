#!/usr/bin/env node
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

async function main() {
  const [sourceArgument, destinationArgument, widthArgument] = process.argv.slice(2);
  if (!sourceArgument || !destinationArgument) {
    throw new Error(
      "Usage: tsx scripts/compress-readme-image.ts <source> <assets/readme/output.webp> [width]",
    );
  }

  const requestedWidth = widthArgument ? Number(widthArgument) : 1440;
  if (
    !Number.isSafeInteger(requestedWidth) ||
    requestedWidth < 240 ||
    requestedWidth > 2560
  ) {
    throw new Error("Width must be an integer between 240 and 2560 pixels.");
  }

  const repoRoot = process.cwd();
  const sourcePath = path.resolve(repoRoot, sourceArgument);
  const destinationPath = path.resolve(repoRoot, destinationArgument);
  const readmeAssetsRoot = path.resolve(repoRoot, "assets", "readme");

  if (!sourcePath.startsWith(`${repoRoot}${path.sep}`)) {
    throw new Error("The source image must be inside the repository.");
  }
  if (!destinationPath.startsWith(`${readmeAssetsRoot}${path.sep}`)) {
    throw new Error("The output image must be inside assets/readme/.");
  }

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await sharp(sourcePath, { limitInputPixels: 32_000_000 })
    .rotate()
    .resize({ width: requestedWidth, withoutEnlargement: true })
    .webp({ effort: 6, quality: 78, smartSubsample: true })
    .toFile(destinationPath);

  const [source, destination] = await Promise.all([
    stat(sourcePath),
    stat(destinationPath),
  ]);
  console.log(
    `Compressed ${sourceArgument} from ${source.size} bytes to ${destination.size} bytes (${destinationArgument}).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
