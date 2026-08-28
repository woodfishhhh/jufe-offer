import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  getTechnologyIconSpriteSources,
  TECHNOLOGY_ICON_SPRITE_COLUMNS,
} from "../src/data/technology-icons";

const CELL_SIZE = 44;
const ICON_SIZE = 40;
const PUBLIC_ICON_PATH = "/technology-icons/";

async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadMissingIcon(source: string, destination: string) {
  if (await fileExists(destination)) return false;

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Failed to download ${source}: HTTP ${response.status}`);
  }

  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  return true;
}

async function main() {
  const projectRoot = process.cwd();
  const iconDirectory = path.join(projectRoot, "public", "technology-icons");
  const spritePath = path.join(iconDirectory, "sprite.avif");
  const sources = getTechnologyIconSpriteSources();
  const rows = Math.ceil(sources.length / TECHNOLOGY_ICON_SPRITE_COLUMNS);

  await mkdir(iconDirectory, { recursive: true });

  let downloaded = 0;
  const icons = [];

  for (const [index, source] of sources.entries()) {
    const filename = path.basename(new URL(source).pathname);
    const iconPath = path.join(iconDirectory, filename);
    if (await downloadMissingIcon(source, iconPath)) downloaded += 1;

    const input = await sharp(iconPath)
      .resize(ICON_SIZE, ICON_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    const column = index % TECHNOLOGY_ICON_SPRITE_COLUMNS;
    const row = Math.floor(index / TECHNOLOGY_ICON_SPRITE_COLUMNS);

    icons.push({
      input,
      left: column * CELL_SIZE + (CELL_SIZE - ICON_SIZE) / 2,
      top: row * CELL_SIZE + (CELL_SIZE - ICON_SIZE) / 2,
    });
  }

  const result = await sharp({
    create: {
      width: TECHNOLOGY_ICON_SPRITE_COLUMNS * CELL_SIZE,
      height: rows * CELL_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(icons)
    .avif({ quality: 55, effort: 6, chromaSubsampling: "4:4:4" })
    .toFile(spritePath);

  console.log(
    JSON.stringify({
      source: `${PUBLIC_ICON_PATH}*.webp`,
      sprite: `${PUBLIC_ICON_PATH}${path.basename(spritePath)}`,
      icons: sources.length,
      columns: TECHNOLOGY_ICON_SPRITE_COLUMNS,
      rows,
      width: result.width,
      height: result.height,
      bytes: result.size,
      downloaded,
    }),
  );
}

void main();
