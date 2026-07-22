import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { WorkItem } from "@/lib/works";

const dataFilePath = path.join(process.cwd(), "src/data/works.json");
const imagesRoot = path.join(process.cwd(), "public/images");

function slugifyFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function htmlEscape(value: string) {
  return value.replaceAll("&", "&amp;");
}

function getNextImageNumber(works: WorkItem[]) {
  const max = works.reduce((currentMax, work) => {
    const matched = work.img.match(/^(\d+)/);
    const value = matched ? Number.parseInt(matched[1], 10) : 0;
    return Math.max(currentMax, value);
  }, 0);

  return max + 1;
}

async function ensureImageDirectories() {
  await Promise.all(
    ["big", "small", "sp"].map((dir) =>
      mkdir(path.join(imagesRoot, dir), { recursive: true })
    )
  );
}

async function createImageVariants(fileName: string, bytes: Buffer) {
  const image = sharp(bytes, { failOn: "none" });
  const metadata = await image.metadata();
  const isPng = metadata.format === "png";

  const bigOutput = path.join(imagesRoot, "big", fileName);
  const smallOutput = path.join(imagesRoot, "small", fileName);
  const spOutput = path.join(imagesRoot, "sp", fileName);

  if (isPng) {
    await Promise.all([
      image
        .clone()
        .resize({ width: 1600, withoutEnlargement: true })
        .png()
        .toFile(bigOutput),
      image
        .clone()
        .resize(320, 180, { fit: "cover", position: "centre" })
        .png()
        .toFile(smallOutput),
      image
        .clone()
        .resize({ width: 1200, withoutEnlargement: true })
        .png()
        .toFile(spOutput)
    ]);
    return;
  }

  await Promise.all([
    image
      .clone()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toFile(bigOutput),
    image
      .clone()
      .resize(320, 180, { fit: "cover", position: "centre" })
      .jpeg({ quality: 86 })
      .toFile(smallOutput),
    image
      .clone()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toFile(spOutput)
  ]);
}

export async function readWorksFromLocal(): Promise<WorkItem[]> {
  const raw = await readFile(dataFilePath, "utf-8");
  return JSON.parse(raw) as WorkItem[];
}

async function writeWorksToLocal(works: WorkItem[]) {
  await writeFile(dataFilePath, `${JSON.stringify(works, null, 2)}\n`, "utf-8");
}

export async function createWorkInLocal(input: {
  title: string;
  charge: string;
  imageFile: File;
}) {
  const works = await readWorksFromLocal();
  const nextNumber = getNextImageNumber(works);
  const ext = path.extname(input.imageFile.name).toLowerCase();
  const safeExt = ext === ".png" ? ".png" : ".jpg";
  const slug = slugifyFileName(input.title) || "work";
  const paddedNumber = String(nextNumber).padStart(2, "0");
  const fileName = `${paddedNumber}_${slug}${safeExt}`;

  await ensureImageDirectories();
  const arrayBuffer = await input.imageFile.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  await createImageVariants(fileName, bytes);

  works.push({
    ttl: htmlEscape(input.title),
    charge: htmlEscape(input.charge),
    img: fileName
  });

  await writeWorksToLocal(works);
}

export async function deleteWorkFromLocal(imageName: string) {
  const works = await readWorksFromLocal();
  const nextWorks = works.filter((work) => work.img !== imageName);

  if (nextWorks.length === works.length) {
    return false;
  }

  await writeWorksToLocal(nextWorks);

  await Promise.all(
    ["big", "small", "sp"].map(async (dir) => {
      const filePath = path.join(imagesRoot, dir, imageName);
      try {
        await unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    })
  );

  return true;
}

export async function updateWorkInLocal(input: {
  imageName: string;
  title: string;
  charge: string;
}) {
  const works = await readWorksFromLocal();
  const targetIndex = works.findIndex((work) => work.img === input.imageName);

  if (targetIndex === -1) {
    return false;
  }

  works[targetIndex] = {
    ...works[targetIndex],
    ttl: htmlEscape(input.title),
    charge: htmlEscape(input.charge)
  };

  await writeWorksToLocal(works);
  return true;
}
